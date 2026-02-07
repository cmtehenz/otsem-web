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
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4 sm:p-6">
                            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalBRLEquivalent = balances.brl.total + (balances.usdt.okx * balances.usdtRate);

    return (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo BRL Total</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 truncate">
                                {formatBRL(balances.brl.total)}
                            </p>
                            <div className="mt-2 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                                <div className="min-w-0">
                                    <span className="text-muted-foreground">Inter</span>
                                    <p className="font-medium truncate">{formatBRL(balances.brl.inter)}</p>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-muted-foreground">OKX</span>
                                    <p className="font-medium truncate">{formatBRL(balances.brl.okx)}</p>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-muted-foreground">FD</span>
                                    <p className="font-medium truncate">{formatBRL(balances.brl.fd)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/10 shrink-0">
                            <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Saldo USDT (OKX)</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 truncate">
                                {formatUSDT(balances.usdt.okx)}
                            </p>
                            <div className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-muted-foreground">
                                ≈ {formatBRL(balances.usdt.okx * balances.usdtRate)}
                            </div>
                        </div>
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/10 shrink-0">
                            <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#6F00FF]/20 bg-gradient-to-br from-[#6F00FF]/5 to-[#6F00FF]/10 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Patrimônio Total (BRL)</p>
                            <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-[#6F00FF] truncate">
                                {formatBRL(totalBRLEquivalent)}
                            </p>
                            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-[11px] sm:text-xs">
                                <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground truncate">
                                    Cotação: 1 USDT = {formatBRL(balances.usdtRate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#6F00FF]/10 shrink-0">
                            <div className="text-lg sm:text-xl font-bold text-[#6F00FF]">Σ</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
