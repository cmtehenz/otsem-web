"use client";

import React, { useState, useEffect, useCallback } from "react";
import http from "@/lib/http";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

type Transaction = {
    transactionId: string;
    type: "PIX_IN" | "PIX_OUT" | "CONVERSION" | "TRANSFER";
    status: "PENDING" | "COMPLETED" | "FAILED" | "PROCESSING";
    amount: number;
    description: string;
    senderName?: string | null;
    senderCpf?: string | null;
    recipientName?: string | null;
    recipientCpf?: string | null;
    recipientCnpj?: string | null;
    createdAt: string;
    // Campos legados ou de conversão
    usdtAmount?: string | number | null;
    subType?: "BUY" | "SELL" | null;
    externalData?: any;
};

const ITEMS_PER_PAGE = 10;

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}

function formatUSD(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function TransactionsPage() {
    const { user } = useAuth();
    const customerId = user?.customerId;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchTransactions = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const res = await http.get<{
                statements: Transaction[];
                total: number;
                page: number;
                limit: number;
            }>(`/customers/${customerId}/statement?page=${page}&limit=${ITEMS_PER_PAGE}`);
            
            setTransactions(res.data.statements || []);
            setTotal(res.data.total || 0);
            setTotalPages(Math.ceil((res.data.total || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            console.error("Erro ao carregar transações:", err);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [page, customerId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    function filterTransactions(txs: Transaction[]): Transaction[] {
        const seenConversions: Array<{ time: number; amount: number; usdtAmt: number; subType: string; txHash?: string }> = [];
        
        return txs.filter((tx, _index, allTx) => {
            if (tx.type === "CONVERSION") {
                const txHash = tx.externalData?.txHash;
                const txTime = new Date(tx.createdAt).getTime();
                const txAmount = Number(tx.amount);
                const usdtRaw = tx.externalData?.usdtAmount || tx.usdtAmount;
                const usdtAmt = typeof usdtRaw === 'number' ? usdtRaw : parseFloat(String(usdtRaw)) || 0;
                const subType = tx.subType || (tx.description?.toLowerCase().includes('venda') ? 'SELL' : 'BUY');
                
                if (txHash) {
                    const hasDupe = seenConversions.some(s => s.txHash === txHash);
                    if (hasDupe) return false;
                    seenConversions.push({ time: txTime, amount: txAmount, usdtAmt, subType, txHash });
                    return true;
                }
                
                const hasDupe = seenConversions.some(s => {
                    const timeDiff = Math.abs(s.time - txTime);
                    const amountDiff = Math.abs(s.amount - txAmount);
                    const usdtDiff = Math.abs(s.usdtAmt - usdtAmt);
                    return s.subType === subType && timeDiff < 300000 && amountDiff < 1 && usdtDiff < 0.5;
                });
                
                if (hasDupe) return false;
                seenConversions.push({ time: txTime, amount: txAmount, usdtAmt, subType });
                return true;
            }
            
            if (tx.type !== "PIX_OUT" && tx.type !== "PIX_IN") return true;
            
            const txTime = new Date(tx.createdAt).getTime();
            const txAmount = Number(tx.amount);
            
            const hasMatchingConversion = allTx.some((other) => {
                if (other.transactionId === tx.transactionId) return false;
                if (other.type !== "CONVERSION") return false;
                
                const otherTime = new Date(other.createdAt).getTime();
                const otherAmount = Number(other.amount);
                const timeDiff = Math.abs(txTime - otherTime);
                
                return Math.abs(txAmount - otherAmount) < 1 && timeDiff < 300000;
            });
            
            return !hasMatchingConversion;
        });
    }

    const filteredTransactions = filterTransactions(transactions);

    function renderTransaction(tx: Transaction) {
        const amount = Number(tx.amount);
        const isIncoming = tx.type === "PIX_IN";
        const isPending = tx.status === "PENDING" || tx.status === "PROCESSING";
        const isCompleted = tx.status === "COMPLETED";
        const isConversion = tx.type === "CONVERSION";
        
        const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        
        let displayName = "";
        let isConversionTx = false;
        let usdtAmountValue: number | null = null;
        
        const descLower = (tx.description || "").toLowerCase();
        const isConversionByDesc = descLower.includes("usdt") || 
            descLower.includes("conversão") || 
            descLower.includes("conversao") ||
            descLower.includes("buy") ||
            descLower.includes("sell");
        
        const isSellConversion = tx.subType === "SELL" || 
            (!tx.subType && (descLower.includes("venda") || descLower.includes("sell")));
        
        if (isConversion || isConversionByDesc) {
            isConversionTx = true;
            
            const walletAddr = tx.externalData?.walletAddress;
            const network = tx.externalData?.network;
            
            if (isSellConversion) {
                if (walletAddr && network) {
                    const truncated = `${walletAddr.slice(0, 8)}...${walletAddr.slice(-8)}`;
                    displayName = `Venda de USDT carteira ${truncated} ${network}`;
                } else {
                    displayName = "Venda de USDT";
                }
            } else {
                if (walletAddr && network) {
                    const truncated = `${walletAddr.slice(0, 8)}...${walletAddr.slice(-8)}`;
                    displayName = `Compra de USDT carteira ${truncated} ${network}`;
                } else {
                    displayName = "Compra de USDT";
                }
            }
            
            const usdtRaw = tx.usdtAmount || tx.externalData?.usdtAmount;
            if (usdtRaw) {
                usdtAmountValue = typeof usdtRaw === 'number' ? usdtRaw : parseFloat(usdtRaw);
            }
        } else if (tx.description && !isUUID(tx.description)) {
            displayName = tx.description;
        } else if (isIncoming && tx.senderName) {
            displayName = `Depósito de ${tx.senderName}`;
        } else if (isIncoming && tx.externalData?.pagador?.nome) {
            displayName = `Depósito de ${tx.externalData.pagador.nome}`;
        } else if (!isIncoming && tx.recipientName) {
            displayName = `Transferência para ${tx.recipientName}`;
        } else {
            displayName = isIncoming ? "Depósito PIX" : "Transferência PIX";
        }
        
        if (isCompleted && displayName.toLowerCase().includes("aguardando")) {
            displayName = displayName
                .replace(/aguardando\s*/gi, "")
                .replace(/depósito pix de\s*/gi, "Depósito de ")
                .trim();
        }

        const iconBgColor = isPending 
            ? "bg-amber-500/20" 
            : isConversionTx
                ? isSellConversion ? "bg-orange-500/20" : "bg-blue-500/20"
                : isIncoming 
                    ? "bg-green-500/20" 
                    : "bg-red-500/20";
        
        const iconColor = isPending 
            ? "text-amber-500 dark:text-amber-400" 
            : isConversionTx
                ? isSellConversion ? "text-orange-500 dark:text-orange-400" : "text-blue-500 dark:text-blue-400"
                : isIncoming 
                    ? "text-green-500 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400";
        
        const amountColor = isPending 
            ? "text-amber-500 dark:text-amber-400" 
            : isConversionTx
                ? isSellConversion ? "text-orange-500 dark:text-orange-400" : "text-blue-500 dark:text-blue-400"
                : isIncoming 
                    ? "text-green-500 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400";

        const statusLabel = isPending ? "Processando" : tx.status === "FAILED" ? "Falhou" : "";

        return (
            <div key={tx.transactionId} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition border-b border-border last:border-b-0">
                <div className={`p-2.5 rounded-full ${iconBgColor}`}>
                    {isConversionTx ? (
                        <ArrowRightLeft className={`w-4 h-4 ${iconColor}`} />
                    ) : isIncoming ? (
                        <ArrowDownLeft className={`w-4 h-4 ${iconColor}`} />
                    ) : (
                        <ArrowUpRight className={`w-4 h-4 ${iconColor}`} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">
                        {displayName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        {formatDate(tx.createdAt)}
                        {statusLabel && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                isPending ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
                            }`}>
                                {statusLabel}
                            </span>
                        )}
                    </p>
                </div>
                {isConversionTx ? (
                    <div className="text-right">
                        {isSellConversion ? (
                            <>
                                <span className="text-green-500 dark:text-green-400 font-bold text-sm">
                                    +{formatCurrency(amount)}
                                </span>
                                {usdtAmountValue !== null && (
                                    <p className="text-red-500 dark:text-red-400 text-xs font-medium">
                                        -{formatUSD(usdtAmountValue)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-foreground font-bold text-sm">
                                    -{formatCurrency(amount)}
                                </span>
                                {usdtAmountValue !== null && (
                                    <p className="text-emerald-500 dark:text-emerald-400 text-xs font-medium">
                                        +{formatUSD(usdtAmountValue)}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <span className={`font-bold ${amountColor}`}>
                        {isIncoming ? "+" : "-"}{formatCurrency(Math.abs(amount))}
                    </span>
                )}
            </div>
        );
    }

    if (loading && page === 1) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                <p className="text-sm text-muted-foreground mt-4">Carregando transações...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Transações</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Histórico completo de movimentações
                    </p>
                </div>
                <Link href="/customer/dashboard">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Voltar
                    </Button>
                </Link>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[#6F00FF]/50" />
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    <>
                        <div className="divide-y divide-border">
                            {filteredTransactions.map(renderTransaction)}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {filteredTransactions.length} de {total} transações
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                        className="h-8 w-8 border-border"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="h-8 w-8 border-border"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    
                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        const showPages = 5;
                                        let start = Math.max(1, page - Math.floor(showPages / 2));
                                        const end = Math.min(totalPages, start + showPages - 1);
                                        
                                        if (end - start + 1 < showPages) {
                                            start = Math.max(1, end - showPages + 1);
                                        }
                                        
                                        if (start > 1) {
                                            pages.push(1);
                                            if (start > 2) pages.push("...");
                                        }
                                        
                                        for (let i = start; i <= end; i++) {
                                            pages.push(i);
                                        }
                                        
                                        if (end < totalPages) {
                                            if (end < totalPages - 1) pages.push("...");
                                            pages.push(totalPages);
                                        }
                                        
                                        return pages.map((p, idx) => 
                                            p === "..." ? (
                                                <span key={`dots-${idx}`} className="px-2 text-muted-foreground">...</span>
                                            ) : (
                                                <Button
                                                    key={p}
                                                    variant={page === p ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => setPage(p as number)}
                                                    className={`h-8 w-8 ${page === p ? "bg-[#6F00FF] hover:bg-[#6F00FF]/50 text-white" : "border-border"}`}
                                                >
                                                    {p}
                                                </Button>
                                            )
                                        );
                                    })()}
                                    
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="h-8 w-8 border-border"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                        className="h-8 w-8 border-border"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="p-4 rounded-full bg-muted inline-block mb-3">
                            <ArrowDownLeft className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                    </div>
                )}
            </div>
        </div>
    );
}
