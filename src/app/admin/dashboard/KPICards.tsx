"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, ArrowUpDown, BadgeCheck, Clock, XCircle, Repeat } from "lucide-react";
import type { DashboardData } from "./page";

type Props = {
    kpis: DashboardData["kpis"] | null;
};

function formatNumber(value: number): string {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
}

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: value >= 100000 ? "compact" : "standard",
        maximumFractionDigits: 2,
    }).format(value);
}

export default function KPICards({ kpis }: Props) {
    if (!kpis) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const kpiCards = [
        {
            title: "Total de Usuários",
            value: formatNumber(kpis.totalUsers),
            line1: `+${kpis.usersToday} hoje`,
            line2: `+${kpis.usersThisWeek} semana`,
            icon: Users,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
        },
        {
            title: "Volume Transacionado",
            value: formatBRL(kpis.volumeToday),
            line1: `Semana: ${formatBRL(kpis.volumeThisWeek)}`,
            line2: `Mês: ${formatBRL(kpis.volumeThisMonth)}`,
            icon: TrendingUp,
            iconColor: "text-green-500",
            iconBg: "bg-green-500/10",
        },
        {
            title: "Transações Hoje",
            value: formatNumber(kpis.transactionsToday),
            line1: `Total: ${formatNumber(kpis.totalTransactions)}`,
            line2: "transações",
            icon: ArrowUpDown,
            iconColor: "text-[#6F00FF]",
            iconBg: "bg-[#6F00FF]/10",
        },
        {
            title: "Conversões USDT",
            value: formatNumber(kpis.conversionsToday),
            line1: `Volume: ${formatBRL(kpis.conversionsVolume)}`,
            line2: "",
            icon: Repeat,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
        },
    ];

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-3 sm:p-6">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-2">
                                {card.title}
                            </CardTitle>
                            <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg shrink-0 ${card.iconBg}`}>
                                <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                            <div className="text-xl sm:text-2xl font-bold truncate">{card.value}</div>
                            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                                {card.line1}
                                {card.line2 && (
                                    <>
                                        <br className="sm:hidden" />
                                        <span className="hidden sm:inline"> | </span>
                                        {card.line2}
                                    </>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <Card className="border-amber-500/20">
                    <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-amber-500/10 shrink-0">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{kpis.kycPending}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">KYC Pendentes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-500/20">
                    <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-500/10 shrink-0">
                            <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{kpis.kycApproved}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">KYC Aprovados</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20">
                    <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-500/10 shrink-0">
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{kpis.kycRejected}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">KYC Rejeitados</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
