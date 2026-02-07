"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    Clock,
    AlertCircle,
    XCircle,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { DashboardData } from "./page";

type Props = {
    alerts: DashboardData["alerts"];
};

const alertIcons = {
    kyc_pending: Clock,
    high_value: AlertTriangle,
    error: XCircle,
    warning: AlertCircle,
};

const alertStyles = {
    kyc_pending: {
        bg: "bg-amber-50",
        border: "border-amber-200/60",
        icon: "text-amber-500",
        indicator: "bg-amber-400",
        badge: "bg-amber-100 text-amber-700",
    },
    high_value: {
        bg: "bg-blue-50",
        border: "border-blue-200/60",
        icon: "text-blue-500",
        indicator: "bg-blue-400",
        badge: "bg-blue-100 text-blue-700",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200/60",
        icon: "text-red-500",
        indicator: "bg-red-400",
        badge: "bg-red-100 text-red-700",
    },
    warning: {
        bg: "bg-orange-50",
        border: "border-orange-200/60",
        icon: "text-orange-500",
        indicator: "bg-orange-400",
        badge: "bg-orange-100 text-orange-700",
    },
};

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.8,
        },
    },
};

export default function AlertsSection({ alerts }: Props) {
    if (alerts.length === 0) {
        return (
            <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-black/[0.04]">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-gray-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100">
                            <AlertCircle className="h-4 w-4 text-gray-500" />
                        </div>
                        Alertas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                        className="flex h-36 flex-col items-center justify-center text-center"
                    >
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/50">
                            <ShieldCheck className="h-7 w-7 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            Nenhum alerta pendente
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Tudo funcionando normalmente
                        </p>
                    </motion.div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-black/[0.04]">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                    </div>
                    Alertas
                </CardTitle>
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                    }}
                    className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm shadow-red-200"
                >
                    {alerts.length}
                </motion.span>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-2.5"
                    >
                        {alerts.slice(0, 5).map((alert) => {
                            const Icon =
                                alertIcons[alert.type] || AlertCircle;
                            const style =
                                alertStyles[alert.type] || alertStyles.warning;

                            return (
                                <motion.div
                                    key={alert.id}
                                    variants={itemVariants}
                                    className={`group relative overflow-hidden rounded-2xl border p-3.5 transition-colors duration-200 ${style.bg} ${style.border}`}
                                >
                                    <div
                                        className={`absolute left-0 top-0 h-full w-[3px] rounded-full ${style.indicator}`}
                                    />

                                    <div className="flex items-start gap-3 pl-1.5">
                                        <div
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.badge}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[13px] font-semibold leading-snug text-gray-800">
                                                    {alert.title}
                                                </p>
                                                <span className="shrink-0 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 ring-1 ring-black/[0.04]">
                                                    {timeAgo(alert.createdAt)}
                                                </span>
                                            </div>

                                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                                                {alert.description}
                                            </p>

                                            {alert.actionUrl && (
                                                <Link
                                                    href={alert.actionUrl}
                                                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
                                                >
                                                    Ver detalhes
                                                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {alerts.length > 5 && (
                            <motion.div variants={itemVariants}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-xl border-dashed text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                                    asChild
                                >
                                    <Link href="/admin/alerts">
                                        Ver todos os {alerts.length} alertas
                                        <ChevronRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
