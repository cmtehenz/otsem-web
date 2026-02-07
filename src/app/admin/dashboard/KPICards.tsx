"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    TrendingUp,
    ArrowUpDown,
    Repeat,
    Clock,
    BadgeCheck,
    XCircle,
} from "lucide-react";
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
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
    });
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
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

function SkeletonCard({ tall = false }: { tall?: boolean }) {
    return (
        <Card className="rounded-2xl border-transparent shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                        <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
                        <div
                            className={`${tall ? "h-8" : "h-7"} w-20 animate-pulse rounded-md bg-muted`}
                        />
                        <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
                    </div>
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function KPICards({ kpis }: Props) {
    if (!kpis) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonCard key={i} tall />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-3 lg:gap-4">
                    {[1, 2, 3].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const kpiCards = [
        {
            title: "Total de Usuarios",
            value: formatNumber(kpis.totalUsers),
            line1: `+${kpis.usersToday} hoje`,
            line2: `+${kpis.usersThisWeek} semana`,
            icon: Users,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100 dark:bg-blue-500/15",
        },
        {
            title: "Volume Transacionado",
            value: formatBRL(kpis.volumeToday),
            line1: `Semana: ${formatBRL(kpis.volumeThisWeek)}`,
            line2: `Mes: ${formatBRL(kpis.volumeThisMonth)}`,
            icon: TrendingUp,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
        },
        {
            title: "Transacoes Hoje",
            value: formatNumber(kpis.transactionsToday),
            line1: `Total: ${formatNumber(kpis.totalTransactions)}`,
            line2: "transacoes",
            icon: ArrowUpDown,
            iconColor: "text-violet-600",
            iconBg: "bg-violet-100 dark:bg-violet-500/15",
        },
        {
            title: "Conversoes USDT",
            value: formatNumber(kpis.conversionsToday),
            line1: `Volume: ${formatBRL(kpis.conversionsVolume)}`,
            line2: "",
            icon: Repeat,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100 dark:bg-amber-500/15",
        },
    ];

    const kycCards = [
        {
            label: "KYC Pendentes",
            value: kpis.kycPending,
            icon: Clock,
            iconColor: "text-amber-600",
            iconBg: "bg-amber-100 dark:bg-amber-500/15",
            accent: "border-l-amber-500",
        },
        {
            label: "KYC Aprovados",
            value: kpis.kycApproved,
            icon: BadgeCheck,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100 dark:bg-emerald-500/15",
            accent: "border-l-emerald-500",
        },
        {
            label: "KYC Rejeitados",
            value: kpis.kycRejected,
            icon: XCircle,
            iconColor: "text-red-600",
            iconBg: "bg-red-100 dark:bg-red-500/15",
            accent: "border-l-red-500",
        },
    ];

    return (
        <div className="space-y-4">
            {/* Main KPI Cards */}
            <motion.div
                className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {kpiCards.map((card, index) => (
                    <motion.div key={index} variants={cardVariants}>
                        <Card className="rounded-2xl border-transparent shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight">
                                        {card.title}
                                    </p>
                                    <div
                                        className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
                                    >
                                        <card.icon
                                            className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${card.iconColor}`}
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>

                                <p className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                                    {card.value}
                                </p>

                                <div className="mt-2 sm:mt-3 space-y-0.5">
                                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                        {card.line1}
                                    </p>
                                    {card.line2 && (
                                        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                                            {card.line2}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* KYC Status Cards */}
            <motion.div
                className="grid grid-cols-3 gap-3 lg:gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {kycCards.map((card, index) => (
                    <motion.div key={index} variants={cardVariants}>
                        <Card
                            className={`rounded-2xl border-l-[3px] shadow-sm hover:shadow-md transition-shadow duration-200 ${card.accent}`}
                        >
                            <CardContent className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4">
                                <div
                                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
                                >
                                    <card.icon
                                        className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${card.iconColor}`}
                                        strokeWidth={2}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold tracking-tight">
                                        {card.value}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                        {card.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
