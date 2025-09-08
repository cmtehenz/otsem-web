// src/app/pix/new/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Landmark, Loader2, QrCode, RefreshCw, Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

// shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Mock helpers
import { swrFetcher, apiPost } from "@/lib/api";

// ===== Types (mock / API) =====
type PixStatus = "CREATED" | "PENDING" | "PAID" | "CONVERTING" | "SETTLED" | "CANCELED" | "EXPIRED";
type PixCharge = {
    id: string;
    txid: string;
    status: PixStatus;
    valor: number;                 // BRL
    qrCode?: string;               // base64 (mock gera um SVG data-url)
    copyPaste?: string;            // payload copia-e-cola
    createdAt: string;
    expiresAt: string;
};
type Balances = { brl: number; usdt: number };

// ===== Validação =====
const schema = z.object({
    amount_brl: z.coerce.number().positive("Informe um valor maior que zero"),
    description: z.string().max(140).optional().or(z.literal("")),
    auto_convert: z.boolean().default(true),
});
type PixForm = z.infer<typeof schema>;

// 👉 resolver com cast tipado (compatível com qualquer versão do RHF/Resolvers)
const pixResolver = zodResolver(schema) as unknown as Resolver<PixForm>;

// ===== Página =====
export default function PixNewPage() {
    const { data: balances, mutate: refetchBalances } = useSWR<Balances>("/wallets/me", swrFetcher);
    const brl = balances?.brl ?? 0;

    const [charge, setCharge] = useState<PixCharge | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<PixForm>({
        resolver: pixResolver, // ✅ corrigido
        defaultValues: { amount_brl: 500, description: "", auto_convert: true },
    });

    // cria a cobrança
    const onSubmit = async (values: PixForm) => {
        try {
            const data = await apiPost<PixCharge>("/pix/charges", {
                amountBrl: values.amount_brl,
                description: values.description,
                autoConvert: values.auto_convert,
            });
            setCharge(data);
            toast.success("Cobrança Pix criada. Pague para concluir.");
            startPolling(data.id);
        } catch (e) {
            const errorMessage = typeof e === "object" && e !== null && "message" in e
                ? (e as { message: string }).message
                : "Erro ao criar Pix";
            toast.error(errorMessage);
        }
    };

    // polling de status
    function startPolling(id: string) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const up = await swrFetcher(`/pix/charges/${id}`);
                setCharge(up);
                if (["PAID", "SETTLED", "CANCELED", "EXPIRED"].includes(up.status)) {
                    stopPolling();
                    refetchBalances();
                    if (up.status === "SETTLED") toast.success("Pagamento confirmado e processado.");
                    else if (up.status === "PAID") toast.success("Pagamento confirmado (aguardando processamento).");
                }
            } catch {
                // silencioso no demo
            }
        }, 3000);
    }
    function stopPolling() {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
    }
    useEffect(() => () => stopPolling(), []);

    // badge de status
    const statusBadge = useMemo(() => {
        const st = charge?.status;
        if (!st) return null;
        const map: Record<PixStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
            CREATED: { label: "Criada", variant: "secondary" },
            PENDING: { label: "Pendente", variant: "secondary" },
            PAID: { label: "Paga", variant: "default" },
            CONVERTING: { label: "Convertendo", variant: "secondary" },
            SETTLED: { label: "Liquidada", variant: "default" },
            CANCELED: { label: "Cancelada", variant: "destructive" },
            EXPIRED: { label: "Expirada", variant: "destructive" },
        };
        const cfg = map[st];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    }, [charge?.status]);

    // copiar copia-e-cola
    const [copied, setCopied] = useState(false);
    async function copyPayload() {
        if (!charge?.copyPaste) return;
        await navigator.clipboard.writeText(charge.copyPaste);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
        toast.success("Pix Copia e Cola copiado");
    }

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            {/* Topbar com botão voltar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="size-4" /> Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Adicionar saldo via Pix</h1>
                        <p className="text-sm text-muted-foreground">
                            Gere uma cobrança Pix em BRL. Opcionalmente, converta para USDT automaticamente após a confirmação.
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => charge?.id && startPolling(charge.id)}
                    className="gap-2"
                    disabled={!charge?.id}
                >
                    <RefreshCw className="size-4" /> Atualizar
                </Button>
            </div>

            {/* Saldo BRL atual */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2 flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em Reais (BRL)</CardTitle>
                    <Landmark className="size-4 opacity-60" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-semibold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl)}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Saldo disponível antes do Pix</div>
                </CardContent>
            </Card>

            {/* Formulário de criação */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><QrCode className="size-5" /> Nova Cobrança Pix</CardTitle>
                    <CardDescription>Informe o valor em BRL e (opcional) uma descrição.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <Label>Valor (BRL)</Label>
                            <Input type="number" step="0.01" placeholder="0,00" {...register("amount_brl")} />
                            {errors.amount_brl && <p className="text-xs text-rose-500 mt-1">{errors.amount_brl.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <Label>Descrição (opcional)</Label>
                            <Input placeholder="Ex.: Adição de saldo" {...register("description")} />
                            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
                        </div>

                        <div className="md:col-span-1 flex items-end gap-3">
                            <div className="flex items-center gap-2">
                                {/* Switch controlado pra casar com boolean do zod */}
                                <Switch
                                    id="auto_convert"
                                    checked={watch("auto_convert")}
                                    onCheckedChange={(v) => setValue("auto_convert", v, { shouldValidate: true })}
                                />
                                <Label htmlFor="auto_convert" className="text-sm">Converter automaticamente para USDT</Label>
                            </div>
                        </div>

                        <div className="md:col-span-3">
                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? (<><Loader2 className="size-4 animate-spin" /> Gerando…</>) : (<>Gerar QR Pix</>)}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Resultado da cobrança */}
            {charge && (
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Cobrança {charge.txid}</CardTitle>
                            <CardDescription>Expira em {new Date(charge.expiresAt).toLocaleString("pt-BR")}</CardDescription>
                        </div>
                        {statusBadge}
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* QR */}
                            <div className="flex flex-col items-center justify-center border rounded-xl p-4">
                                {charge.qrCode ? (
                                    <img src={charge.qrCode} alt="QR Pix" className="rounded-xl w-full max-w-xs" />
                                ) : (
                                    <div className="text-sm text-muted-foreground">QR indisponível</div>
                                )}
                            </div>

                            {/* Dados */}
                            <div className="space-y-3">
                                <div className="text-sm">Status: {statusBadge}</div>
                                <div className="text-sm">Valor: <b>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(charge.valor)}</b></div>

                                {charge.copyPaste && (
                                    <div className="space-y-2">
                                        <Label>Pix Copia e Cola</Label>
                                        <div className="flex gap-2">
                                            <textarea readOnly className="w-full h-28 rounded-md border p-2 text-sm">{charge.copyPaste}</textarea>
                                            <Button type="button" variant="secondary" className="shrink-0" onClick={copyPayload}>
                                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(charge.status === "PAID" || charge.status === "SETTLED") && (
                            <>
                                <Separator className="my-2" />
                                <div className="text-xs text-muted-foreground">
                                    Pagamento recebido.
                                    {watch("auto_convert")
                                        ? " A conversão para USDT será/foi realizada automaticamente."
                                        : " Você pode converter manualmente no Dashboard."}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
