"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Building2, ArrowRightLeft } from "lucide-react";
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

    const totalBRLEquivalent = balances.brl.total + (balances.usdt.total * balances.usdtRate);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Saldo BRL (Banco)</p>
                            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                                {formatBRL(balances.brl.available)}
                            </p>
                            <div className="mt-3 flex gap-4 text-xs">
                                <span className="text-muted-foreground">
                                    Bloqueado: <span className="font-medium text-orange-600">{formatBRL(balances.brl.blocked)}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                            <Building2 className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Saldo USDT (Carteiras)</p>
                            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {formatUSDT(balances.usdt.total)}
                            </p>
                            <div className="mt-3 flex gap-4 text-xs">
                                <span className="text-muted-foreground">
                                    Solana: <span className="font-medium">{formatUSDT(balances.usdt.solana)}</span>
                                </span>
                                <span className="text-muted-foreground">
                                    Tron: <span className="font-medium">{formatUSDT(balances.usdt.tron)}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-violet-600/10">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Patrimônio Total (BRL)</p>
                            <p className="mt-2 text-3xl font-bold text-violet-600 dark:text-violet-400">
                                {formatBRL(totalBRLEquivalent)}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                                <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Cotação: 1 USDT = {formatBRL(balances.usdtRate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                            <div className="text-xl font-bold text-violet-600">Σ</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
