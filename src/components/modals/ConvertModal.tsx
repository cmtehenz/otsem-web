"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUiModals } from "@/stores/ui-modals";
import { apiPost, swrFetcher } from "@/lib/api";

type Direction = "BRL_TO_USDT" | "USDT_TO_BRL";

const schema = z.object({
    amount: z.coerce.number().positive("Informe um valor maior que zero"),
});
type FormValues = z.infer<typeof schema>;

type RatesResp = { brlPerUsdt: number; updatedAt: string };
type BalancesResp = { brl: number; usdt: number };

export default function ConvertModal() {
    const router = useRouter();
    const { open, closeModal } = useUiModals();

    const isOpen = open.convertBrlUsdt || open.convertUsdtBrl;
    const direction: Direction = open.convertBrlUsdt ? "BRL_TO_USDT" : "USDT_TO_BRL";

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: { amount: 100 },
    });

    // pega cotação e saldos da demo API
    const { data: rates } = useSWR<RatesResp>(isOpen ? "/rates" : null, swrFetcher);
    const { data: balances } = useSWR<BalancesResp>(isOpen ? "/wallets/me" : null, swrFetcher);

    const amount = form.watch("amount") || 0;
    const rate = rates?.brlPerUsdt ?? 0;

    const youGet =
        direction === "BRL_TO_USDT"
            ? amount > 0 && rate > 0
                ? (amount / rate)
                : 0
            : amount > 0 && rate > 0
                ? (amount * rate)
                : 0;

    const insufficient =
        direction === "BRL_TO_USDT"
            ? !!balances && amount > balances.brl
            : !!balances && amount > balances.usdt;

    const [submitting, setSubmitting] = React.useState(false);

    const title = direction === "BRL_TO_USDT" ? "Converter BRL → USDT" : "Converter USDT → BRL";
    const label = direction === "BRL_TO_USDT" ? "Valor em BRL" : "Valor em USDT";
    const step = direction === "BRL_TO_USDT" ? "0.01" : "0.000001";
    const previewLabel = direction === "BRL_TO_USDT" ? "Você receberá (≈ USDT)" : "Você receberá (≈ BRL)";

    const handleClose = () => {
        closeModal("convertBrlUsdt");
        closeModal("convertUsdtBrl");
        form.reset();
    };

    async function onSubmit(values: FormValues) {
        try {
            setSubmitting(true);
            if (direction === "BRL_TO_USDT") {
                await apiPost("/conversions/brl-to-usdt", { amountBRL: values.amount });
            } else {
                await apiPost("/conversions/usdt-to-brl", { amountUSDT: values.amount });
            }
            handleClose();
            router.refresh();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro na conversão";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(v) => (!v ? handleClose() : null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">{label}</Label>
                        <Input
                            id="amount"
                            type="number"
                            inputMode="decimal"
                            step={step}
                            placeholder="0"
                            {...form.register("amount")}
                        />
                        {form.formState.errors.amount && (
                            <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                        )}
                    </div>

                    {/* Prévia */}
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{previewLabel}</span>
                            <span className="font-medium">
                                {direction === "BRL_TO_USDT"
                                    ? youGet ? youGet.toFixed(6) : "—"
                                    : youGet ? youGet.toFixed(2) : "—"}
                            </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            {rate ? `Taxa usada: 1 USDT ≈ R$ ${rate.toFixed(2)}` : "Carregando taxa..."}
                        </div>
                    </div>

                    {insufficient && (
                        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            Saldo insuficiente.
                        </div>
                    )}

                    <Separator />

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting || insufficient || amount <= 0}>
                            {submitting ? "Convertendo..." : "Converter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
