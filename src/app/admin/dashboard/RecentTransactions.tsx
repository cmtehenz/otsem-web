"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Repeat,
    ExternalLink,
    ReceiptText,
} from "lucide-react";
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

const listContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const listItem = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 28 },
    },
};

function getAmountColor(type: string): string {
    if (type === "PIX_IN") return "text-emerald-600 dark:text-emerald-400";
    if (type === "PIX_OUT" || type === "PAYOUT") return "text-red-600 dark:text-red-400";
    return "text-blue-600 dark:text-blue-400";
}

function getAmountPrefix(type: string): string {
    if (type === "PIX_IN") return "+";
    if (type === "PIX_OUT" || type === "PAYOUT") return "-";
    return "";
}

export default function RecentTransactions({ transactions }: Props) {
    if (transactions.length === 0) {
        return (
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold sm:text-lg">
                        Transações Recentes
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" asChild>
                        <Link href="/admin/recebidos">
                            Ver todas
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <ReceiptText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Nenhuma transação recente
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground/70">
                                As transações aparecerão aqui
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold sm:text-lg">
                    Transações Recentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/admin/recebidos">
                        Ver todas
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {/* Mobile card view */}
                <motion.div
                    className="space-y-2 md:hidden"
                    variants={listContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {transactions.map((tx) => {
                        const typeInfo = typeConfig[tx.type] || typeConfig.PIX_IN;
                        const statusInfo = statusConfig[tx.status] || statusConfig.PENDING;
                        const Icon = typeInfo.icon;

                        return (
                            <motion.div
                                key={tx.id}
                                variants={listItem}
                                className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${typeInfo.color}`}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-medium">
                                            {tx.customerName || "\u2014"}
                                        </span>
                                        <span
                                            className={`shrink-0 text-sm font-semibold tabular-nums ${getAmountColor(tx.type)}`}
                                        >
                                            {getAmountPrefix(tx.type)}
                                            {formatBRL(tx.amount)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[11px] text-muted-foreground">
                                                {typeInfo.label}
                                            </span>
                                            <Badge
                                                variant={statusInfo.variant}
                                                className="shrink-0 px-1.5 py-0 text-[9px]"
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                            {formatDate(tx.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Desktop table view */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="w-[160px] text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Tipo
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Cliente
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Descrição
                                </TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Valor
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Status
                                </TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground/80">
                                    Data
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx, index) => {
                                const typeInfo = typeConfig[tx.type] || typeConfig.PIX_IN;
                                const statusInfo = statusConfig[tx.status] || statusConfig.PENDING;
                                const Icon = typeInfo.icon;

                                return (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28,
                                            delay: index * 0.04,
                                        }}
                                        className="group border-b border-border/40 transition-colors hover:bg-muted/40"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${typeInfo.color}`}
                                                >
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xs font-medium">
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {tx.customerName || "\u2014"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="line-clamp-1 max-w-[220px] text-sm text-muted-foreground">
                                                {tx.description || "\u2014"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`text-sm font-semibold tabular-nums ${getAmountColor(tx.type)}`}
                                            >
                                                {getAmountPrefix(tx.type)}
                                                {formatBRL(tx.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusInfo.variant}
                                                className="text-[10px]"
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(tx.createdAt)}
                                            </span>
                                        </TableCell>
                                    </motion.tr>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
