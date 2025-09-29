"use client";

import React from "react";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowUpRight, Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// —— Schema & Types
type Network = "TRON" | "ETHEREUM" | "SOLANA";

console.log(Network);

const payoutSchema = z.object({
    network: z.enum(["TRON", "ETHEREUM", "SOLANA"]).default("TRON"),
    toAddress: z.string().min(8, "Endereço inválido"),
    amount: z.coerce.number().positive("Informe um valor maior que zero"),
});
type PayoutForm = z.infer<typeof payoutSchema>;

// 👉 casta o resolver para casar os generics do RHF nesta versão
const payoutResolver = zodResolver(payoutSchema) as unknown as Resolver<PayoutForm>;

export default function NewPayoutPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        reset,
        watch,
    } = useForm<PayoutForm>({
        resolver: payoutResolver, // ✅ sem erro de tipos
        defaultValues: { network: "TRON", toAddress: "", amount: 0 },
    });

    const onSubmit: SubmitHandler<PayoutForm> = async (values) => {
        try {
            const res = await fetch(`${API}/payouts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (!res.ok) {throw new Error(data?.message || "Falha no payout");}
            toast.success(`Payout criado em ${values.network}. Hash: ${data?.txHash ?? "pendente"}`);
            reset({ network: values.network, toAddress: "", amount: 0 });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Erro no payout";
            toast.error(errorMessage);
        }
    };

    const amount = watch("amount");

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Novo Payout</h1>
                <p className="text-sm text-muted-foreground">
                    Envie USDT para uma carteira on-chain escolhendo a rede, endereço e valor.
                </p>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowUpRight className="size-5" /> Enviar USDT
                    </CardTitle>
                    <CardDescription>Preencha os dados para enviar o payout on-chain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rede</Label>
                            <Select
                                defaultValue="TRON"
                                onValueChange={(v) =>
                                    setValue("network", v as PayoutForm["network"], { shouldValidate: true })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a rede" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRON">TRON</SelectItem>
                                    <SelectItem value="ETHEREUM">Ethereum</SelectItem>
                                    <SelectItem value="SOLANA">Solana</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.network && <p className="text-xs text-rose-500 mt-1">{errors.network.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Endereço da carteira</Label> {/* <-- seu código tinha <Lab ... truncado */}
                            <Input placeholder="Wallet do recebedor" {...register("toAddress")} />
                            {errors.toAddress && <p className="text-xs text-rose-500 mt-1">{errors.toAddress.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Valor (USDT)</Label>
                            <Input type="number" min={0} step="0.01" placeholder="0.00" {...register("amount")} />
                            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
                        </div>

                        <Button type="submit" disabled={isSubmitting || !amount || amount <= 0} className="w-full">
                            {isSubmitting ? "Enviando…" : "Enviar payout"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
