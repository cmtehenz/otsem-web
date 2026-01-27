"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Banknote, ArrowRightLeft } from "lucide-react";
import type { DashboardData } from "./page";

type Props = {
    balances: DashboardData["balances"] | null;
};

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatUSDT(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value) + " USDT";
}

export default function BalanceCards({ balances }: Props) {
    if (!balances) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalBRLEquivalent = balances.brl.total + (balances.usdt.okx * balances.usdtRate);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Saldo BRL Total</p>
                            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                                {formatBRL(balances.brl.total)}
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Inter</span>
                                    <p className="font-medium">{formatBRL(balances.brl.inter)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">OKX</span>
                                    <p className="font-medium">{formatBRL(balances.brl.okx)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">FD</span>
                                    <p className="font-medium">{formatBRL(balances.brl.fd)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                            <Banknote className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Saldo USDT (OKX)</p>
                            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {formatUSDT(balances.usdt.okx)}
                            </p>
                            <div className="mt-3 text-xs text-muted-foreground">
                                ≈ {formatBRL(balances.usdt.okx * balances.usdtRate)}
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#6F00FF]/50/20 bg-gradient-to-br from-[#6F00FF]/50/5 to-[#6F00FF]/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Patrimônio Total (BRL)</p>
                            <p className="mt-2 text-3xl font-bold text-[#6F00FF] dark:text-[#6F00FF]">
                                {formatBRL(totalBRLEquivalent)}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                                <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Cotação: 1 USDT = {formatBRL(balances.usdtRate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6F00FF]/50/10">
                            <div className="text-xl font-bold text-[#6F00FF]">Σ</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
