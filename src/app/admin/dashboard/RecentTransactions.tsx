"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

type Transaction = {
    id: string;
    createdAt: string;
    type?: "PIX" | "CARD" | "PAYOUT" | "CRYPTO" | string;
    asset?: string;
    amount: number;
    status: "pending" | "processing" | "completed" | "failed";
    description?: string;
    // Possíveis campos alternativos do backend
    transactionType?: string;
    currency?: string;
    direction?: "credit" | "debit";
};

type RecentTransactionsProps = {
    transactions: Transaction[];
};

function formatDate(iso: string) {
    try {
        const date = new Date(iso);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        if (isToday) {
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

function formatAmount(amount: number, asset?: string) {
    const currency = asset || "BRL";
    try {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${asset || "BRL"}`;
    }
}

function getTransactionType(tx: Transaction): string {
    return tx.type || tx.transactionType || "PIX";
}

function getAsset(tx: Transaction): string {
    return tx.asset || tx.currency || "BRL";
}

function mapStatus(status: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string } {
    switch (status?.toLowerCase()) {
        case "completed":
        case "success":
            return { label: "Concluído", variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100" };
        case "pending":
            return { label: "Pendente", variant: "secondary" };
        case "processing":
            return { label: "Processando", variant: "outline", className: "border-blue-200 text-blue-700" };
        case "failed":
        case "error":
            return { label: "Falhou", variant: "destructive" };
        default:
            return { label: status || "Desconhecido", variant: "secondary" };
    }
}

function getTypeIcon(type: string) {
    const t = type?.toUpperCase();
    if (t === "PIX" || t === "PAYOUT") {
        return <ArrowUpRight className="h-3 w-3" />;
    }
    return <ArrowDownLeft className="h-3 w-3" />;
}

function getTypeBadgeColor(type: string): string {
    const t = type?.toUpperCase();
    switch (t) {
        case "PIX":
            return "bg-blue-100 text-blue-700";
        case "CARD":
            return "bg-purple-100 text-purple-700";
        case "PAYOUT":
            return "bg-green-100 text-green-700";
        case "CRYPTO":
            return "bg-orange-100 text-orange-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    // Debug: log primeira transação para ver estrutura real
    React.useEffect(() => {
        if (transactions.length > 0) {
            console.log("Estrutura da transação:", transactions[0]);
        }
    }, [transactions]);

    return (
        <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#000000]/5 pb-4">
                <CardTitle className="text-base font-semibold">Últimas Transações</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/transactions" className="text-xs text-[#b852ff] hover:text-[#a942ee]">
                        Ver todas →
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Quando</TableHead>
                                    <TableHead className="text-xs">Tipo</TableHead>
                                    <TableHead className="text-xs">Moeda</TableHead>
                                    <TableHead className="text-right text-xs">Valor</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => {
                                    const txType = getTransactionType(tx);
                                    const asset = getAsset(tx);
                                    const s = mapStatus(tx.status);

                                    return (
                                        <TableRow key={tx.id} className="hover:bg-[#faffff]/50">
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(tx.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {getTypeIcon(txType)}
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getTypeBadgeColor(txType)}`}>
                                                        {txType}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-mono font-medium">{asset}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-semibold tabular-nums">
                                                    {formatAmount(tx.amount, asset)}
                                                </div>
                                                {tx.description && (
                                                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground max-w-[200px]">
                                                        {tx.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={s.variant}
                                                    className={`text-[10px] font-medium ${s.className || ""}`}
                                                >
                                                    {s.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">
                            Nenhuma transação recente
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}