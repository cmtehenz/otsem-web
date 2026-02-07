"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Banknote, ArrowRightLeft, TrendingUp } from "lucide-react";
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
    return (
        new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + " USDT"
    );
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 380,
            damping: 30,
            mass: 0.8,
        },
    },
};

function SkeletonCard() {
    return (
        <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-5 sm:p-6">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
                        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="flex gap-3">
                        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BalanceCards({ balances }: Props) {
    if (!balances) {
        return (
            <div className="grid gap-4 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    const totalBRLEquivalent =
        balances.brl.total + balances.usdt.okx * balances.usdtRate;

    return (
        <motion.div
            className="grid gap-4 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* BRL Total */}
            <motion.div variants={cardVariants}>
                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/5" />
                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Saldo BRL Total
                            </p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                            {formatBRL(balances.brl.total)}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            {[
                                { label: "Inter", value: balances.brl.inter },
                                { label: "OKX", value: balances.brl.okx },
                                { label: "FD", value: balances.brl.fd },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="min-w-0 rounded-lg bg-emerald-500/5 px-2.5 py-2 dark:bg-emerald-500/10"
                                >
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                                        {formatBRL(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* USDT (OKX) */}
            <motion.div variants={cardVariants}>
                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-500/5" />
                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Saldo USDT (OKX)
                            </p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                            {formatUSDT(balances.usdt.okx)}
                        </p>

                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-500/5 px-3 py-2 dark:bg-blue-500/10">
                            <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-xs text-muted-foreground">
                                {formatBRL(balances.usdt.okx * balances.usdtRate)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Net Worth / Patrimonio Total */}
            <motion.div variants={cardVariants}>
                <Card className="relative overflow-hidden rounded-2xl border-0 shadow-md bg-gradient-to-br from-[#6F00FF]/5 to-white dark:from-[#6F00FF]/15 dark:to-slate-900">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#6F00FF]/5" />
                    <CardContent className="relative p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Patrimonio Total (BRL)
                            </p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F00FF]/10">
                                <TrendingUp className="h-5 w-5 text-[#6F00FF]" />
                            </div>
                        </div>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-[#6F00FF]">
                            {formatBRL(totalBRLEquivalent)}
                        </p>

                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#6F00FF]/5 px-3 py-2 dark:bg-[#6F00FF]/10">
                            <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-xs text-muted-foreground">
                                Cotacao: 1 USDT = {formatBRL(balances.usdtRate)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
