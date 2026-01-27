"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function ChartsSection({ charts }: Props) {
    if (!charts) {
        return (
            <Card className="animate-pulse">
                <CardContent className="p-6">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded" />
                </CardContent>
            </Card>
        );
    }

    const maxVolume = Math.max(...charts.transactionsLast7Days.map(d => d.volume), 1);
    const maxUsers = Math.max(...charts.usersLast30Days.map(d => d.count), 1);
    const totalByType = charts.transactionsByType.reduce((acc, t) => acc + t.count, 0) || 1;

    const typeColors: Record<string, string> = {
        PIX_IN: "bg-green-500",
        PIX_OUT: "bg-red-500",
        CONVERSION: "bg-blue-500",
        PAYOUT: "bg-amber-500",
    };

    const typeLabels: Record<string, string> = {
        PIX_IN: "PIX Entrada",
        PIX_OUT: "PIX Saída",
        CONVERSION: "Conversões",
        PAYOUT: "Saques",
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análise de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="transactions" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="transactions">Transações</TabsTrigger>
                        <TabsTrigger value="users">Usuários</TabsTrigger>
                        <TabsTrigger value="types">Por Tipo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="space-y-4">
                        <p className="text-sm text-muted-foreground">Volume dos últimos 7 dias</p>
                        <div className="flex h-48 items-end gap-2">
                            {charts.transactionsLast7Days.map((day, index) => (
                                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center">
                                        <span className="text-xs font-medium mb-1">
                                            {day.count}
                                        </span>
                                        <div
                                            className="w-full rounded-t bg-gradient-to-t from-[#6F00FF] to-[#6F00FF] transition-all hover:from-[#6F00FF]/50 hover:to-[#6F00FF]/30"
                                            style={{ height: `${(day.volume / maxVolume) * 160}px`, minHeight: "8px" }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatShortDate(day.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Total: {charts.transactionsLast7Days.reduce((a, b) => a + b.count, 0)} transações</span>
                            <span>Volume: {formatBRL(charts.transactionsLast7Days.reduce((a, b) => a + b.volume, 0))}</span>
                        </div>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-4">
                        <p className="text-sm text-muted-foreground">Novos usuários nos últimos 30 dias</p>
                        <div className="flex h-48 items-end gap-0.5">
                            {charts.usersLast30Days.map((day, index) => (
                                <div
                                    key={index}
                                    className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-500 hover:to-blue-300"
                                    style={{ height: `${(day.count / maxUsers) * 160}px`, minHeight: "4px" }}
                                    title={`${formatShortDate(day.date)}: ${day.count} usuários`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Total: {charts.usersLast30Days.reduce((a, b) => a + b.count, 0)} novos usuários</span>
                            <span>Média: {(charts.usersLast30Days.reduce((a, b) => a + b.count, 0) / 30).toFixed(1)}/dia</span>
                        </div>
                    </TabsContent>

                    <TabsContent value="types" className="space-y-4">
                        <p className="text-sm text-muted-foreground">Distribuição por tipo de transação</p>
                        <div className="space-y-3">
                            {charts.transactionsByType.map((type, index) => {
                                const percentage = (type.count / totalByType) * 100;
                                const colorClass = typeColors[type.type] || "bg-slate-500";
                                const label = typeLabels[type.type] || type.type;

                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{label}</span>
                                            <span className="text-muted-foreground">
                                                {type.count} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div
                                                className={`h-full ${colorClass} transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Volume: {formatBRL(type.volume)}
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
