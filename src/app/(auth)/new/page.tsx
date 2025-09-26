// src/app/merchant/card/new/page.tsx
"use client";

import * as React from "react";
import type { JSX } from "react";
import Link from "next/link";
import useSWR from "swr";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { apiPost, swrFetcher, type CardPayment } from "@/lib/api";

// —— Schemas
const intentSchema = z.object({
    amount_brl: z.coerce.number().positive("Informe um valor maior que zero"),
    installments: z.coerce.number().int().min(1).max(12),
});
type IntentForm = z.infer<typeof intentSchema>;
const intentResolver = zodResolver(intentSchema) as unknown as Resolver<IntentForm>;

const confirmSchema = z.object({
    card_token: z.string().min(6, "Token inválido"),
});
type ConfirmForm = z.infer<typeof confirmSchema>;
const confirmResolver = zodResolver(confirmSchema) as unknown as Resolver<ConfirmForm>;

// —— Helpers
function fmtBRL(v: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}
function badgeClass(status?: CardPayment["status"]): string {
    switch (status) {
        case "AUTHORIZED":
        case "CAPTURED":
        case "SETTLED": return "text-emerald-600 dark:text-emerald-400";
        case "FAILED":
        case "CANCELED": return "text-rose-600 dark:text-rose-400";
        default: return "text-amber-600 dark:text-amber-400";
    }
}

export default function MerchantCardNewPage(): JSX.Element {
    const [payment, setPayment] = React.useState<CardPayment | null>(null);

    // polling do status quando houver pagamento
    const paymentId = payment?.id ?? null;
    const { data: livePayment, mutate } = useSWR<CardPayment>(paymentId ? `/card/payments/${paymentId}` : null, swrFetcher, {
        refreshInterval: paymentId ? 4000 : 0,
    });

    React.useEffect(() => {
        if (livePayment) setPayment(livePayment);
    }, [livePayment]);

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Cobrança no Cartão (Lojista)</h1>
                    <p className="text-sm text-muted-foreground">
                        Crie a venda em BRL (parcelado), confirme com o gateway e acompanhe a liquidação → conversão para USDT.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="size-4" /> Dashboard
                        </Button>
                    </Link>
                    <Button variant="ghost" onClick={() => mutate()} disabled={!paymentId} className="gap-2">
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {!payment && <CreateIntent onCreated={setPayment} />}

            {payment && (
                <>
                    <ConfirmPayment payment={payment} onConfirmed={setPayment} />
                    <StatusPanel payment={payment} />
                </>
            )}
        </div>
    );
}

// —— Criar intenção
function CreateIntent({ onCreated }: { onCreated: (p: CardPayment) => void }): JSX.Element {
    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<IntentForm>({
        resolver: intentResolver,
        defaultValues: { amount_brl: 30000, installments: 10 },
    });

    const onSubmit: SubmitHandler<IntentForm> = async (values) => {
        try {
            const created = await apiPost<CardPayment>("/card/payments/intent", values);
            toast.success("Pagamento criado. Confirme com o cartão.");
            onCreated(created);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Falha ao criar pagamento";
            toast.error(msg);
        }
    };

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="size-5" /> Criar intenção de pagamento
                </CardTitle>
                <CardDescription>Informe o valor em BRL e o número de parcelas.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <Label>Valor (BRL)</Label>
                        <Input type="number" step="0.01" placeholder="0,00" {...register("amount_brl")} />
                        {errors.amount_brl && <p className="text-xs text-rose-500 mt-1">{errors.amount_brl.message}</p>}
                    </div>
                    <div>
                        <Label>Parcelas</Label>
                        <Select defaultValue="10" onValueChange={(v) => setValue("installments", Number(v), { shouldValidate: true })}>
                            <SelectTrigger><SelectValue placeholder="Parcelas" /></SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>{i + 1}x</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.installments && <p className="text-xs text-rose-500 mt-1">{errors.installments.message}</p>}
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (<><Loader2 className="size-4 animate-spin" /> Criando…</>) : "Criar intenção"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// —— Confirmar com token
function ConfirmPayment({ payment, onConfirmed }: { payment: CardPayment; onConfirmed: (p: CardPayment) => void }): JSX.Element {
    const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<ConfirmForm>({
        resolver: confirmResolver,
        defaultValues: { card_token: "" },
    });

    const onSubmit: SubmitHandler<ConfirmForm> = async (values) => {
        try {
            const updated = await apiPost<CardPayment>(`/card/payments/${payment.id}/confirm`, values);
            onConfirmed(updated);
            if (updated.status === "AUTHORIZED" || updated.status === "CAPTURED" || updated.status === "SETTLED") {
                toast.success(`Pagamento ${updated.status.toLowerCase()}`);
            } else {
                toast("Atualizado", { description: `Status: ${updated.status}` });
            }
            reset({ card_token: "" });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Falha na confirmação";
            toast.error(msg);
        }
    };

    return (
        <Card className="rounded-2xl">
            <CardHeader>
                <CardTitle>Confirmar pagamento</CardTitle>
                <CardDescription>Use o token do gateway (tokenização segura via SDK).</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                        <Label>Token do Cartão (gateway)</Label>
                        <Input placeholder="tok_xxx… (ex.: DEMO)" {...register("card_token")} />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Confirmando…" : "Confirmar"}
                        </Button>
                    </div>
                </form>

                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>Valor: <b>{fmtBRL(payment.amount_brl)}</b></div>
                    <div>Parcelas: <b>{payment.installments}x</b></div>
                    <div className={badgeClass(payment.status)}>Status: <b>{payment.status}</b></div>
                    {payment.processor && <div>Gateway: <b>{payment.processor}</b></div>}
                    {payment.processorRef && <div>Ref: <b>{payment.processorRef}</b></div>}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4" /> Os dados do cartão devem ser coletados pelo SDK do processador (tokenização PCI-DSS).
                </div>
            </CardContent>
        </Card>
    );
}

// —— Painel de status
function StatusPanel({ payment }: { payment: CardPayment }): JSX.Element {
    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Status do Pagamento</CardTitle>
                    <CardDescription>Acompanhe autorização, captura e liquidação → conversão para USDT.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>ID: <b>{payment.id}</b></div>
                    <div>Valor: <b>{fmtBRL(payment.amount_brl)}</b></div>
                    <div>Parcelas: <b>{payment.installments}x</b></div>
                    <div className={badgeClass(payment.status)}>Status: <b>{payment.status}</b></div>
                    {typeof payment.settled_brl === "number" && <div>Liquidado: <b>{fmtBRL(payment.settled_brl)}</b></div>}
                    {typeof payment.converted_usdt === "number" && <div>USDT creditado: <b>{payment.converted_usdt.toFixed(2)} USDT</b></div>}
                </div>
            </CardContent>
        </Card>
    );
}
