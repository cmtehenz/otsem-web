"use client";

import React from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRightLeft, Landmark, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// import { apiPost, swrFetcher } from "@/lib/api";


// ===== Schema/Form =====
const schema = z.object({
    amount_usdt: z.coerce.number().positive("Informe um valor maior que zero"),
});
type FormValues = z.infer<typeof schema>;

// Algumas versões de RHF/Resolvers exigem cast do resolver:
const formResolver = zodResolver(schema) as unknown as Resolver<FormValues>;

export default function UsdtToBrlPage() {
    // Saldos (para mostrar e refrescar depois da conversão)
    // const { data: balances, mutate: refetchBalances } = useSWR<Balances>("/wallets/me", swrFetcher);
    // const brl = balances?.brl ?? 0;
    // const usdt = balances?.usdt ?? 0;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        resolver: formResolver,
        defaultValues: { amount_usdt: 100 },
    });

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            // const resp = await apiPost<{ ok: true; rate: number; amountUSDT: number; brlAdded: number }>(
            //     "/conversions/usdt-to-brl",
            //     { amountUSDT: values.amount_usdt }
            // );
            // toast.success(`Convertido ${values.amount_usdt.toFixed(2)} USDT → R$ ${resp.brlAdded.toFixed(2)} (cotação R$ ${resp.rate.toFixed(2)})`);
            // reset({ amount_usdt: 0 });
            // await refetchBalances();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Falha na conversão";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            {/* Topo */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Converter USDT → BRL</h1>
                    <p className="text-sm text-muted-foreground">
                        Transforme seu saldo em USDT para Reais (BRL) instantaneamente no modo de demonstração.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="size-4" /> Dashboard
                        </Button>
                    </Link>
                    {/* <Button variant="ghost" onClick={() => refetchBalances()} className="gap-2">
                        <RefreshCw className="size-4" /> Atualizar
                    </Button> */}
                </div>
            </div>

            {/* Saldos atuais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em Reais (BRL)</CardTitle>
                        <Landmark className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        {/* <div className="text-3xl font-semibold">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(brl)}
                        </div> */}
                        <div className="mt-2 text-xs text-muted-foreground">Saldo disponível em BRL</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em USDT</CardTitle>
                        <ArrowRightLeft className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">
                            {/* {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(usdt)} */}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">Saldo disponível em USDT</div>
                    </CardContent>
                </Card>
            </div>

            {/* Formulário */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="size-5" /> USDT → BRL
                    </CardTitle>
                    <CardDescription>Informe o valor em USDT que deseja converter para Reais.</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                            <Label>Valor (USDT)</Label>
                            <Input type="number" step="0.01" placeholder="0.00" {...register("amount_usdt")} />
                            {errors.amount_usdt && (
                                <p className="text-xs text-rose-500 mt-1">{errors.amount_usdt.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2 flex items-end">
                            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" /> Convertendo…
                                    </>
                                ) : (
                                    <>Converter</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
