"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Repeat, ExternalLink } from "lucide-react";
import type { DashboardData } from "./page";

type Props = {
    transactions: DashboardData["recentTransactions"];
};

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    PIX_IN: { label: "PIX Entrada", icon: ArrowDownLeft, color: "text-green-500 bg-green-500/10" },
    PIX_OUT: { label: "PIX Saída", icon: ArrowUpRight, color: "text-red-500 bg-red-500/10" },
    CONVERSION: { label: "Conversão", icon: Repeat, color: "text-blue-500 bg-blue-500/10" },
    PAYOUT: { label: "Saque", icon: ArrowUpRight, color: "text-amber-500 bg-amber-500/10" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    COMPLETED: { label: "Concluído", variant: "default" },
    PENDING: { label: "Pendente", variant: "secondary" },
    PROCESSING: { label: "Processando", variant: "outline" },
    FAILED: { label: "Falhou", variant: "destructive" },
};

export default function RecentTransactions({ transactions }: Props) {
    if (transactions.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Transações Recentes</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/transactions">Ver todas</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground">Nenhuma transação recente</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Transações Recentes</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/admin/transactions">
                        Ver todas
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[140px]">Tipo</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => {
                                const typeInfo = typeConfig[tx.type] || typeConfig.PIX_IN;
                                const statusInfo = statusConfig[tx.status] || statusConfig.PENDING;
                                const Icon = typeInfo.icon;

                                return (
                                    <TableRow key={tx.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${typeInfo.color}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xs font-medium">{typeInfo.label}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{tx.customerName || "—"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                                                {tx.description || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-semibold tabular-nums ${
                                                tx.type === "PIX_IN" ? "text-green-600" : 
                                                tx.type === "PIX_OUT" || tx.type === "PAYOUT" ? "text-red-600" : 
                                                "text-blue-600"
                                            }`}>
                                                {tx.type === "PIX_IN" ? "+" : tx.type === "PIX_OUT" || tx.type === "PAYOUT" ? "-" : ""}
                                                {formatBRL(tx.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant} className="text-[10px]">
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(tx.createdAt)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
