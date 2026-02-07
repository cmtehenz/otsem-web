"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    Users,
    ArrowDownUp,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import type { DashboardData } from "./page";

type Props = {
    charts: DashboardData["charts"] | null;
};

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
    }).format(value);
}

function formatShortDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatWeekday(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function ChartSkeleton() {
    return (
        <Card className="rounded-2xl">
            <CardHeader className="px-4 pt-5 pb-0 sm:px-6">
                <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
                {/* tab skeleton */}
                <div className="mt-4 flex gap-1 rounded-lg bg-muted p-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-9 flex-1 animate-pulse rounded-md bg-muted-foreground/10"
                        />
                    ))}
                </div>

                {/* bars skeleton */}
                <div className="mt-6 flex h-44 items-end gap-2 sm:h-52">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-2">
                            <div
                                className="w-full animate-pulse rounded-t-md bg-muted"
                                style={{
                                    height: `${30 + Math.random() * 60}%`,
                                    animationDelay: `${i * 80}ms`,
                                }}
                            />
                            <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>

                {/* stats skeleton */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-16 animate-pulse rounded-xl bg-muted" />
                    <div className="h-16 animate-pulse rounded-xl bg-muted" />
                </div>
            </CardContent>
        </Card>
    );
}

/* ------------------------------------------------------------------ */
/*  Tooltip on hover / tap                                             */
/* ------------------------------------------------------------------ */

function BarTooltip({
    children,
    label,
}: {
    children: React.ReactNode;
    label: string;
}) {
    return (
        <div className="group relative flex flex-1 flex-col items-center">
            {/* tooltip */}
            <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:text-xs">
                {label}
            </div>
            {children}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ChartsSection({ charts }: Props) {
    if (!charts) {
        return <ChartSkeleton />;
    }

    /* ---------- calculations (unchanged) ---------- */
    const maxVolume = Math.max(
        ...charts.transactionsLast7Days.map((d) => d.volume),
        1,
    );
    const maxUsers = Math.max(
        ...charts.usersLast30Days.map((d) => d.count),
        1,
    );
    const totalByType =
        charts.transactionsByType.reduce((acc, t) => acc + t.count, 0) || 1;

    const totalTx = charts.transactionsLast7Days.reduce(
        (a, b) => a + b.count,
        0,
    );
    const totalVolume = charts.transactionsLast7Days.reduce(
        (a, b) => a + b.volume,
        0,
    );
    const totalNewUsers = charts.usersLast30Days.reduce(
        (a, b) => a + b.count,
        0,
    );
    const avgUsersPerDay = (totalNewUsers / 30).toFixed(1);

    /* ---------- type mappings ---------- */

    const typeColors: Record<string, string> = {
        PIX_IN: "bg-emerald-500",
        PIX_OUT: "bg-red-500",
        CONVERSION: "bg-blue-500",
        PAYOUT: "bg-amber-500",
    };

    const typeBgLight: Record<string, string> = {
        PIX_IN: "bg-emerald-500/10",
        PIX_OUT: "bg-red-500/10",
        CONVERSION: "bg-blue-500/10",
        PAYOUT: "bg-amber-500/10",
    };

    const typeTextColor: Record<string, string> = {
        PIX_IN: "text-emerald-600 dark:text-emerald-400",
        PIX_OUT: "text-red-600 dark:text-red-400",
        CONVERSION: "text-blue-600 dark:text-blue-400",
        PAYOUT: "text-amber-600 dark:text-amber-400",
    };

    const typeLabels: Record<string, string> = {
        PIX_IN: "Entrada PIX",
        PIX_OUT: "Saída PIX",
        CONVERSION: "Conversão",
        PAYOUT: "Pagamento",
    };

    const typeIcons: Record<string, React.ReactNode> = {
        PIX_IN: <TrendingUp className="size-3.5" />,
        PIX_OUT: <TrendingDown className="size-3.5" />,
        CONVERSION: <ArrowDownUp className="size-3.5" />,
        PAYOUT: <TrendingDown className="size-3.5" />,
    };

    return (
        <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="px-4 pt-5 pb-0 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
                    Análise de Atividade
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-5 sm:px-6">
                <Tabs defaultValue="transactions" className="mt-1 space-y-5">
                    {/* -------- Tab triggers -------- */}
                    <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-muted/70 p-1 sm:h-10">
                        <TabsTrigger
                            value="transactions"
                            className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                        >
                            <BarChart3 className="hidden size-3.5 sm:block" />
                            Transações
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                        >
                            <Users className="hidden size-3.5 sm:block" />
                            Usuários
                        </TabsTrigger>
                        <TabsTrigger
                            value="types"
                            className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                        >
                            <ArrowDownUp className="hidden size-3.5 sm:block" />
                            Por Tipo
                        </TabsTrigger>
                    </TabsList>

                    {/* ================================================================ */}
                    {/*  TAB 1 — Transactions last 7 days                                */}
                    {/* ================================================================ */}
                    <TabsContent value="transactions" className="space-y-4">
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Volume dos últimos 7 dias
                        </p>

                        {/* bar chart */}
                        <div className="flex h-44 items-end gap-1.5 pt-8 sm:h-52 sm:gap-2.5">
                            {charts.transactionsLast7Days.map((day, index) => {
                                const pct = (day.volume / maxVolume) * 100;
                                return (
                                    <BarTooltip
                                        key={index}
                                        label={`${day.count} tx - ${formatBRL(day.volume)}`}
                                    >
                                        {/* bar + count label */}
                                        <div className="flex w-full flex-1 flex-col items-center justify-end gap-1">
                                            <span className="text-[10px] font-semibold tabular-nums text-foreground/70 sm:text-xs">
                                                {day.count}
                                            </span>
                                            <div
                                                className="w-full rounded-t-md bg-gradient-to-t from-[#6F00FF] to-[#9B4DFF] transition-all duration-300 ease-out hover:from-[#5800CC] hover:to-[#8B2FFF]"
                                                style={{
                                                    height: `${pct}%`,
                                                    minHeight: "6px",
                                                }}
                                            />
                                        </div>
                                        {/* date label */}
                                        <div className="mt-2 flex flex-col items-center leading-none">
                                            <span className="text-[10px] font-medium capitalize text-muted-foreground sm:text-[11px]">
                                                {formatWeekday(day.date)}
                                            </span>
                                            <span className="text-[9px] tabular-nums text-muted-foreground/70 sm:text-[10px]">
                                                {formatShortDate(day.date)}
                                            </span>
                                        </div>
                                    </BarTooltip>
                                );
                            })}
                        </div>

                        {/* stats summary */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-[#6F00FF]/5 px-3.5 py-3">
                                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                    Total de transações
                                </p>
                                <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground sm:text-xl">
                                    {totalTx}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#6F00FF]/5 px-3.5 py-3">
                                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                    Volume total
                                </p>
                                <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground sm:text-xl">
                                    {formatBRL(totalVolume)}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ================================================================ */}
                    {/*  TAB 2 — Users last 30 days                                      */}
                    {/* ================================================================ */}
                    <TabsContent value="users" className="space-y-4">
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Novos usuários nos últimos 30 dias
                        </p>

                        {/* bar chart (compact bars, 30 items) */}
                        <div className="flex h-44 items-end gap-px sm:h-52 sm:gap-0.5">
                            {charts.usersLast30Days.map((day, index) => {
                                const pct = (day.count / maxUsers) * 100;
                                return (
                                    <div
                                        key={index}
                                        className="group relative flex-1"
                                        style={{ height: "100%" }}
                                    >
                                        {/* hover tooltip */}
                                        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                            {formatShortDate(day.date)}: {day.count}
                                        </div>
                                        <div className="flex h-full items-end">
                                            <div
                                                className="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-200 ease-out hover:from-blue-500 hover:to-sky-300"
                                                style={{
                                                    height: `${pct}%`,
                                                    minHeight: "3px",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* stats summary */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-blue-500/5 px-3.5 py-3">
                                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                    Total de novos
                                </p>
                                <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground sm:text-xl">
                                    {totalNewUsers}
                                </p>
                            </div>
                            <div className="rounded-xl bg-blue-500/5 px-3.5 py-3">
                                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                                    Média diária
                                </p>
                                <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground sm:text-xl">
                                    {avgUsersPerDay}
                                    <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                                        /dia
                                    </span>
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ================================================================ */}
                    {/*  TAB 3 — By transaction type                                     */}
                    {/* ================================================================ */}
                    <TabsContent value="types" className="space-y-4">
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Distribuição por tipo de transação
                        </p>

                        <div className="space-y-4">
                            {charts.transactionsByType.map((type, index) => {
                                const percentage =
                                    (type.count / totalByType) * 100;
                                const colorClass =
                                    typeColors[type.type] || "bg-slate-500";
                                const bgClass =
                                    typeBgLight[type.type] || "bg-slate-500/10";
                                const textColor =
                                    typeTextColor[type.type] ||
                                    "text-slate-600 dark:text-slate-400";
                                const label =
                                    typeLabels[type.type] || type.type;
                                const icon = typeIcons[type.type] ?? null;

                                return (
                                    <div key={index} className="space-y-2">
                                        {/* label row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex size-6 items-center justify-center rounded-md ${bgClass} ${textColor}`}
                                                >
                                                    {icon}
                                                </span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                                    {type.count}
                                                </span>
                                                <span className="text-xs tabular-nums text-muted-foreground">
                                                    ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>

                                        {/* progress bar */}
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/80">
                                            <div
                                                className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>

                                        {/* volume */}
                                        <p className="text-[11px] text-muted-foreground sm:text-xs">
                                            Volume:{" "}
                                            <span className="font-medium text-foreground/80">
                                                {formatBRL(type.volume)}
                                            </span>
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
