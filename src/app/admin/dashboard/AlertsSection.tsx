"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, AlertCircle, XCircle, ChevronRight } from "lucide-react";
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
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: "text-amber-500",
    },
    high_value: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: "text-blue-500",
    },
    error: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: "text-red-500",
    },
    warning: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        icon: "text-orange-500",
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

export default function AlertsSection({ alerts }: Props) {
    if (alerts.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Alertas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Nenhum alerta pendente</p>
                        <p className="text-xs text-muted-foreground">Tudo funcionando normalmente</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Alertas
                </CardTitle>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {alerts.length}
                </span>
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.slice(0, 5).map((alert) => {
                    const Icon = alertIcons[alert.type] || AlertCircle;
                    const style = alertStyles[alert.type] || alertStyles.warning;

                    return (
                        <div
                            key={alert.id}
                            className={`rounded-lg border p-3 ${style.bg} ${style.border}`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{alert.title}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                        {alert.description}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground">
                                            {timeAgo(alert.createdAt)}
                                        </span>
                                        {alert.actionUrl && (
                                            <Link href={alert.actionUrl}>
                                                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                    Ver
                                                    <ChevronRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {alerts.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/admin/alerts">
                            Ver todos os {alerts.length} alertas
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
