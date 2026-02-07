"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Inbox,
    UserRoundSearch,
} from "lucide-react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { TransactionDetailSheet } from "@/components/modals/transaction-detail-sheet";
import type { Transaction } from "@/types/transaction";

type FilterType = "ALL" | "PIX_IN" | "PIX_OUT" | "CONVERSION";

// ─── Constants ───────────────────────────────────────────

const ITEMS_PER_PAGE = 15;

const FILTERS: { key: FilterType; label: string }[] = [
    { key: "ALL", label: "Todos" },
    { key: "PIX_IN", label: "Recebidos" },
    { key: "PIX_OUT", label: "Enviados" },
    { key: "CONVERSION", label: "Conversões" },
];

// ─── Animation variants ─────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.06,
        },
    },
};

// ─── Helpers ─────────────────────────────────────────────

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}

function formatUSD(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getDateGroupLabel(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();
    for (const tx of txs) {
        const label = getDateGroupLabel(tx.createdAt);
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(tx);
    }
    return groups;
}

// ─── Deduplication ───────────────────────────────────────

function deduplicateTransactions(txs: Transaction[]): Transaction[] {
    const seenConversions: Array<{
        time: number;
        amount: number;
        usdtAmt: number;
        subType: string;
        txHash?: string;
    }> = [];

    return txs.filter((tx, _index, allTx) => {
        if (tx.type === "CONVERSION") {
            const txHash = tx.externalData?.txHash;
            const txTime = new Date(tx.createdAt).getTime();
            const txAmount = Number(tx.amount);
            const usdtRaw = tx.externalData?.usdtAmount || tx.usdtAmount;
            const usdtAmt =
                typeof usdtRaw === "number"
                    ? usdtRaw
                    : parseFloat(String(usdtRaw)) || 0;
            const subType =
                tx.subType ||
                (tx.description?.toLowerCase().includes("venda") ? "SELL" : "BUY");

            if (txHash) {
                const hasDupe = seenConversions.some((s) => s.txHash === txHash);
                if (hasDupe) return false;
                seenConversions.push({
                    time: txTime,
                    amount: txAmount,
                    usdtAmt,
                    subType,
                    txHash,
                });
                return true;
            }

            const hasDupe = seenConversions.some((s) => {
                const timeDiff = Math.abs(s.time - txTime);
                const amountDiff = Math.abs(s.amount - txAmount);
                const usdtDiff = Math.abs(s.usdtAmt - usdtAmt);
                return (
                    s.subType === subType &&
                    timeDiff < 300000 &&
                    amountDiff < 1 &&
                    usdtDiff < 0.5
                );
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

// ─── Transaction metadata helper ─────────────────────────

function getTransactionMeta(tx: Transaction) {
    const amount = Number(tx.amount);
    const isIncoming = tx.type === "PIX_IN" || tx.type === "TRANSFER_IN";
    const isTransfer = tx.type === "TRANSFER" || tx.type === "TRANSFER_IN" || tx.type === "TRANSFER_OUT";
    const isPending = tx.status === "PENDING" || tx.status === "PROCESSING";
    const isCompleted = tx.status === "COMPLETED";
    const isConversion = tx.type === "CONVERSION";

    const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            str
        );

    let displayName = "";
    let isConversionTx = false;
    let usdtAmountValue: number | null = null;

    const descLower = (tx.description || "").toLowerCase();
    const isConversionByDesc =
        descLower.includes("usdt") ||
        descLower.includes("conversão") ||
        descLower.includes("conversao") ||
        descLower.includes("buy") ||
        descLower.includes("sell");

    const isSellConversion =
        tx.subType === "SELL" ||
        (!tx.subType &&
            (descLower.includes("venda") || descLower.includes("sell")));

    if (isTransfer) {
        const toUser = tx.metadata?.toUsername;
        const fromUser = tx.metadata?.fromUsername;
        if (tx.type === "TRANSFER_OUT" || (tx.type === "TRANSFER" && !isIncoming)) {
            displayName = toUser ? `Para @${toUser}` : (tx.recipientName ? `Para ${tx.recipientName}` : "Transferência");
        } else {
            displayName = fromUser ? `De @${fromUser}` : (tx.senderName ? `De ${tx.senderName}` : "Transferência recebida");
        }
    } else if (isConversion || (!isTransfer && isConversionByDesc)) {
        isConversionTx = true;

        const walletAddr = tx.externalData?.walletAddress;
        const network = tx.externalData?.network;

        if (isSellConversion) {
            if (walletAddr && network) {
                const truncated = `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`;
                displayName = `Venda USDT · ${truncated}`;
            } else {
                displayName = "Venda de USDT";
            }
        } else {
            if (walletAddr && network) {
                const truncated = `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`;
                displayName = `Compra USDT · ${truncated}`;
            } else {
                displayName = "Compra de USDT";
            }
        }

        const usdtRaw = tx.usdtAmount || tx.externalData?.usdtAmount;
        if (usdtRaw) {
            usdtAmountValue =
                typeof usdtRaw === "number" ? usdtRaw : parseFloat(usdtRaw);
        }
    } else if (tx.description && !isUUID(tx.description)) {
        displayName = tx.description;
    } else if (isIncoming && tx.senderName) {
        displayName = `Depósito de ${tx.senderName}`;
    } else if (isIncoming && tx.externalData?.pagador?.nome) {
        displayName = `Depósito de ${tx.externalData.pagador.nome}`;
    } else if (!isIncoming && tx.recipientName) {
        displayName = `Para ${tx.recipientName}`;
    } else {
        displayName = isIncoming ? "Depósito PIX" : "Transferência PIX";
    }

    if (isCompleted && displayName.toLowerCase().includes("aguardando")) {
        displayName = displayName
            .replace(/aguardando\s*/gi, "")
            .replace(/depósito pix de\s*/gi, "Depósito de ")
            .trim();
    }

    return {
        amount,
        isIncoming,
        isTransfer,
        isPending,
        isConversionTx,
        isSellConversion,
        usdtAmountValue,
        displayName,
    };
}

// ─── Component ───────────────────────────────────────────

export default function TransactionsPage() {
    const { user } = useAuth();
    const customerId = user?.customerId;

    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<FilterType>("ALL");
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // ── Fetch all transactions ──────────────────────────

    const fetchTransactions = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            // Try the statement endpoint first
            try {
                const res = await http.get<{
                    statements: Transaction[];
                    total: number;
                    page: number;
                    limit: number;
                }>(`/customers/${customerId}/statement?page=1&limit=500`);

                if (res.data.statements && res.data.statements.length > 0) {
                    const sorted = [...res.data.statements].sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    );
                    setAllTransactions(deduplicateTransactions(sorted));
                    setLoading(false);
                    return;
                }
            } catch {
                console.warn(
                    "Endpoint statement não disponível, usando fontes alternativas"
                );
            }

            // Fallback: multiple sources
            const [accountRes, pixRes, conversionsRes] = await Promise.allSettled([
                http.get<{
                    payments: Array<{
                        id: string;
                        paymentValue: number;
                        paymentDate: string;
                        receiverPixKey: string;
                        endToEnd: string;
                        bankPayload: {
                            valor: string;
                            titulo: string;
                            descricao: string;
                            detalhes: {
                                nomePagador: string;
                                cpfCnpjPagador: string;
                                nomeEmpresaPagador: string;
                                endToEndId: string;
                                txId?: string;
                                descricaoPix?: string;
                            };
                            dataTransacao: string;
                            tipoTransacao: string;
                        };
                    }>;
                }>(`/accounts/${customerId}/summary`),
                http.get<{ transactions: Transaction[] }>(
                    `/pix/transactions/account-holders/${customerId}`
                ),
                http
                    .get<{
                        data: Array<{
                            id: string;
                            status: string;
                            subType: "BUY" | "SELL";
                            brlAmount: number;
                            usdtAmount: number;
                            network: string;
                            walletAddress?: string;
                            txHash?: string;
                            createdAt: string;
                            completedAt?: string;
                        }>;
                    }>(`/wallet/conversions`)
                    .catch(() => ({ status: "rejected" as const })),
            ]);

            const collected: Transaction[] = [];

            // PIX_IN from account summary
            if (
                accountRes.status === "fulfilled" &&
                accountRes.value.data.payments
            ) {
                const payments = accountRes.value.data.payments.map((payment) => ({
                    transactionId: payment.id,
                    type: "PIX_IN" as const,
                    status: "COMPLETED" as const,
                    amount: payment.paymentValue / 100,
                    description: payment.bankPayload.descricao,
                    senderName: payment.bankPayload.detalhes.nomePagador,
                    senderCpf: payment.bankPayload.detalhes.cpfCnpjPagador,
                    createdAt: payment.paymentDate,
                }));
                collected.push(...payments);
            }

            // PIX_OUT from pix transactions
            if (
                pixRes.status === "fulfilled" &&
                pixRes.value.data.transactions
            ) {
                collected.push(...pixRes.value.data.transactions);
            }

            // Conversions
            if (
                conversionsRes.status === "fulfilled" &&
                "data" in conversionsRes.value
            ) {
                const convData = conversionsRes.value.data;
                if (
                    convData &&
                    "data" in convData &&
                    Array.isArray(convData.data)
                ) {
                    const conversions = convData.data.map(
                        (conv: {
                            id: string;
                            status: string;
                            subType: "BUY" | "SELL";
                            brlAmount: number;
                            usdtAmount: number;
                            network: string;
                            walletAddress?: string;
                            txHash?: string;
                            createdAt: string;
                            completedAt?: string;
                        }) => ({
                            transactionId: conv.id,
                            type: "CONVERSION" as const,
                            status: (conv.status === "COMPLETED"
                                ? "COMPLETED"
                                : conv.status === "FAILED"
                                    ? "FAILED"
                                    : "PENDING") as Transaction["status"],
                            amount: conv.brlAmount,
                            description:
                                conv.subType === "SELL"
                                    ? "Venda de USDT"
                                    : "Compra de USDT",
                            createdAt: conv.completedAt || conv.createdAt,
                            usdtAmount: conv.usdtAmount,
                            subType: conv.subType,
                            externalData: {
                                walletAddress: conv.walletAddress,
                                network: conv.network,
                                txHash: conv.txHash,
                                usdtAmount: conv.usdtAmount,
                            },
                        })
                    );
                    collected.push(...conversions);
                }
            }

            // Sort and deduplicate
            collected.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );

            setAllTransactions(deduplicateTransactions(collected));
        } catch (err) {
            console.error("Erro ao carregar transações:", err);
            setAllTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Reset page when filter changes
    useEffect(() => {
        setPage(1);
    }, [filter]);

    // ── Derived data ────────────────────────────────────

    const filtered = useMemo(() => {
        if (filter === "ALL") return allTransactions;
        if (filter === "PIX_OUT") {
            return allTransactions.filter(
                (tx) => tx.type === "PIX_OUT" || tx.type === "TRANSFER" || tx.type === "TRANSFER_OUT"
            );
        }
        if (filter === "PIX_IN") {
            return allTransactions.filter(
                (tx) => tx.type === "PIX_IN" || tx.type === "TRANSFER_IN"
            );
        }
        return allTransactions.filter((tx) => tx.type === filter);
    }, [allTransactions, filter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

    const paginated = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

    const grouped = useMemo(() => groupByDate(paginated), [paginated]);

    // ── Pagination helpers ──────────────────────────────

    function getVisiblePages(): (number | "dots")[] {
        const pages: (number | "dots")[] = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("dots");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("dots");
            pages.push(totalPages);
        }

        return pages;
    }

    // ── Icon helper ─────────────────────────────────────

    function getIcon(_tx: Transaction, meta: ReturnType<typeof getTransactionMeta>) {
        const size = "w-[18px] h-[18px]";

        if (meta.isPending) {
            return (
                <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
                    <ArrowRightLeft className={`${size} text-white/60`} />
                </div>
            );
        }

        if (meta.isTransfer) {
            return (
                <div className="w-9 h-9 rounded-full bg-[#6C5CE7]/12 flex items-center justify-center">
                    <UserRoundSearch className={`${size} text-[#8E7BFF]`} />
                </div>
            );
        }

        if (meta.isConversionTx) {
            return (
                <div className="w-9 h-9 rounded-full bg-[#3871F1]/12 flex items-center justify-center">
                    <ArrowRightLeft className={`${size} text-[#396DE6]`} />
                </div>
            );
        }

        if (meta.isIncoming) {
            return (
                <div className="w-9 h-9 rounded-full bg-emerald-500/12 flex items-center justify-center">
                    <ArrowDownLeft className={`${size} text-emerald-400`} />
                </div>
            );
        }

        return (
            <div className="w-9 h-9 rounded-full bg-[#3871F1]/12 flex items-center justify-center">
                <ArrowUpRight className={`${size} text-[#396DE6]`} />
            </div>
        );
    }

    // ── Amount display ──────────────────────────────────

    function renderAmount(meta: ReturnType<typeof getTransactionMeta>) {
        const {
            amount,
            isPending,
            isConversionTx,
            isSellConversion,
            isIncoming,
            usdtAmountValue,
        } = meta;

        if (isPending) {
            return (
                <div className="text-right">
                    <span className="text-[14px] font-semibold text-white">
                        {isIncoming ? "+" : "-"}
                        {formatCurrency(Math.abs(amount))}
                    </span>
                    <p className="text-[11px] font-medium text-white mt-0.5">
                        Processando
                    </p>
                </div>
            );
        }

        if (isConversionTx) {
            if (isSellConversion) {
                return (
                    <div className="text-right">
                        <span className="text-[14px] font-semibold text-white">
                            +{formatCurrency(amount)}
                        </span>
                        {usdtAmountValue !== null && (
                            <p className="text-[11px] font-medium text-white mt-0.5">
                                -{formatUSD(usdtAmountValue)}
                            </p>
                        )}
                    </div>
                );
            }
            return (
                <div className="text-right">
                    <span className="text-[14px] font-semibold text-white">
                        -{formatCurrency(amount)}
                    </span>
                    {usdtAmountValue !== null && (
                        <p className="text-[11px] font-medium text-white mt-0.5">
                            +{formatUSD(usdtAmountValue)}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <span className={`text-[14px] font-semibold ${isIncoming ? "text-white" : "text-white"}`}>
                {isIncoming ? "+" : "-"}
                {formatCurrency(Math.abs(amount))}
            </span>
        );
    }

    // ── Loading state ───────────────────────────────────

    if (loading && allTransactions.length === 0) {
        return (
            <div className="flex h-[80dvh] flex-col items-center justify-center px-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#3871F1]/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative">
                        <Loader2 className="h-10 w-10 animate-spin text-[#3871F1]" />
                    </div>
                </div>
                <p className="text-[13px] text-white mt-6">
                    Carregando atividade...
                </p>
            </div>
        );
    }

    // ── Main render ─────────────────────────────────────

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="pb-8"
        >
            {/* ── Header ─────────────────────────────── */}
            <motion.div variants={fadeUp} className="pt-1 pb-4">
                <h1 className="text-[22px] font-bold text-white tracking-tight">
                    Atividade
                </h1>
                <p className="text-[13px] text-white mt-0.5">
                    Histórico de movimentações
                </p>
            </motion.div>

            {/* ── Filter pills ───────────────────────── */}
            <motion.div
                variants={fadeUp}
                className="pb-4 flex gap-2 overflow-x-auto scrollbar-none"
            >
                {FILTERS.map((f) => {
                    const isActive = filter === f.key;
                    return (
                        <motion.button
                            key={f.key}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(f.key)}
                            className={`
                                px-4 py-2 rounded-full text-[13px] font-medium
                                whitespace-nowrap transition-all duration-200
                                ${
                                    isActive
                                        ? "bg-[#3871F1] text-white shadow-lg shadow-[#3871F1]/25"
                                        : "bg-white/10 border border-white/15 text-white hover:text-white"
                                }
                            `}
                        >
                            {f.label}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* ── Count label ────────────────────────── */}
            <motion.div variants={fadeUp} className="pb-2">
                <p className="text-[11px] font-medium text-white uppercase tracking-wider">
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "transação" : "transações"}
                    {filter !== "ALL" && " encontradas"}
                </p>
            </motion.div>

            {/* ── Transaction list ────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${filter}-${page}`}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={staggerContainer}
                    className="space-y-3"
                >
                    {paginated.length === 0 ? (
                        <motion.div
                            variants={fadeUp}
                            className="fintech-glass-card rounded-[20px] p-5 rounded-2xl p-10 flex flex-col items-center justify-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4">
                                <Inbox className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-[14px] font-medium text-white">
                                Nenhuma transação encontrada
                            </p>
                            <p className="text-[12px] text-white mt-1">
                                {filter !== "ALL"
                                    ? "Tente outro filtro"
                                    : "Suas movimentações aparecerão aqui"}
                            </p>
                        </motion.div>
                    ) : (
                        Array.from(grouped.entries()).map(
                            ([dateLabel, txsInGroup]) => (
                                <motion.div key={dateLabel} variants={fadeUp}>
                                    {/* Sticky date header */}
                                    <div className="sticky top-0 z-10 py-2">
                                        <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                                            {dateLabel}
                                        </span>
                                    </div>

                                    {/* Group card */}
                                    <div className="fintech-glass-card rounded-[20px] p-5 rounded-2xl overflow-hidden">
                                        {txsInGroup.map((tx, idx) => {
                                            const meta = getTransactionMeta(tx);
                                            const isLast =
                                                idx === txsInGroup.length - 1;

                                            return (
                                                <motion.div
                                                    key={tx.transactionId}
                                                    variants={fadeUp}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setSelectedTxId(tx.transactionId);
                                                        setDetailOpen(true);
                                                    }}
                                                    className={`
                                                        flex items-center gap-3 px-4 py-3.5
                                                        cursor-pointer
                                                        transition-colors duration-150
                                                        hover:bg-white/[0.03] active:bg-white/[0.05]
                                                        ${!isLast ? "border-b border-white/[0.04] dark:border-white/[0.04]" : ""}
                                                    `}
                                                >
                                                    {/* Icon */}
                                                    {getIcon(tx, meta)}

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[14px] font-medium text-white truncate leading-tight">
                                                            {meta.displayName}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[12px] text-white">
                                                                {formatTime(tx.createdAt)}
                                                            </span>
                                                            {meta.isPending && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
                                                                    Processando
                                                                </span>
                                                            )}
                                                            {tx.status === "FAILED" && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium">
                                                                    Falhou
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Amount */}
                                                    {renderAmount(meta)}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )
                        )
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ── Pagination ─────────────────────────── */}
            {totalPages > 1 && (
                <motion.div
                    variants={fadeUp}
                    className="flex items-center justify-center gap-2 pt-6 pb-4"
                >
                    {/* Previous */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            transition-all duration-200
                            bg-white/10
                            border border-white/15
                            ${page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/15"}
                        `}
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </motion.button>

                    {/* Page numbers */}
                    {getVisiblePages().map((p, idx) =>
                        p === "dots" ? (
                            <span
                                key={`dots-${idx}`}
                                className="w-10 h-10 flex items-center justify-center text-[13px] text-white"
                            >
                                ...
                            </span>
                        ) : (
                            <motion.button
                                key={p}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setPage(p)}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    text-[13px] font-semibold transition-all duration-200
                                    ${
                                        page === p
                                            ? "bg-[#3871F1] text-white shadow-lg shadow-[#3871F1]/25"
                                            : "bg-white/10 border border-white/15 text-white hover:text-white hover:bg-white/15"
                                    }
                                `}
                            >
                                {p}
                            </motion.button>
                        )
                    )}

                    {/* Next */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            transition-all duration-200
                            bg-white/10
                            border border-white/15
                            ${page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-white/15"}
                        `}
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </motion.button>
                </motion.div>
            )}

            {/* ── Summary footer ─────────────────────── */}
            {totalPages > 1 && paginated.length > 0 && (
                <motion.p
                    variants={fadeUp}
                    className="text-center text-[11px] text-white pb-4"
                >
                    Página {page} de {totalPages}
                </motion.p>
            )}

            {/* ── Transaction Detail Sheet ─────────── */}
            <TransactionDetailSheet
                transactionId={selectedTxId}
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelectedTxId(null);
                }}
            />
        </motion.div>
    );
}
