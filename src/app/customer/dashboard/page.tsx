"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    DollarSign,
    ChevronRight,
    Eye,
    EyeOff,
    Loader2,
    UserRoundSearch,
    TrendingUp,
    Receipt,
    Sparkles,
} from "lucide-react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { useUiModals } from "@/stores/ui-modals";
import { ConvertModal } from "@/components/modals/convert-modal";
import { TransactionDetailSheet } from "@/components/modals/transaction-detail-sheet";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────
type AccountSummary = {
    id: string;
    balance: number;
    status: string;
    pixKey: string;
    pixKeyType: string;
    dailyLimit: number;
    monthlyLimit: number;
    blockedAmount: number;
    createdAt: string;
    updatedAt: string;
};

type Payment = {
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
};

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
    usdtAmount?: string | number | null;
    subType?: "BUY" | "SELL" | null;
    externalData?: Record<string, unknown>;
};

type WalletType = {
    id: string;
    customerId: string;
    currency: string;
    balance: string;
    externalAddress: string;
    createdAt: string;
    updatedAt: string;
};

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(value: number, decimals = 2): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatUSD(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateOnly.getTime() === today.getTime()) {
        return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Ontem, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    }
}

// ─── Stagger animation ──────────────────────────────────
const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.06 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

// ─── Circular Quick Action Button (fintech style) ───────
function QuickAction({
    icon: Icon,
    label,
    onClick,
}: {
    icon: typeof ArrowDownLeft;
    label: string;
    onClick: () => void;
}) {
    return (
        <motion.button
            className="flex flex-col items-center gap-1.5"
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-full fintech-glass-btn active:bg-white/10 transition-colors">
                <Icon className="w-[20px] h-[20px] text-white/90" strokeWidth={1.8} />
            </div>
            <span className="text-[12px] font-medium text-white/70">{label}</span>
        </motion.button>
    );
}

// ─── Transaction Row ─────────────────────────────────────
function TransactionRow({ tx, onTap }: { tx: Transaction; onTap?: () => void }) {
    const amount = Number(tx.amount);
    const isIncoming = tx.type === "PIX_IN" || tx.type === "TRANSFER_IN";
    const isTransfer = tx.type === "TRANSFER" || tx.type === "TRANSFER_IN" || tx.type === "TRANSFER_OUT";
    const isPending = tx.status === "PENDING" || tx.status === "PROCESSING";

    const descLower = (tx.description || "").toLowerCase();
    const isConversionByDesc =
        descLower.includes("usdt") ||
        descLower.includes("conversão") ||
        descLower.includes("conversao") ||
        descLower.includes("buy") ||
        descLower.includes("sell");
    const isConversionTx = tx.type === "CONVERSION" || (!isTransfer && isConversionByDesc);
    const isSellConversion =
        tx.subType === "SELL" || (!tx.subType && (descLower.includes("venda") || descLower.includes("sell")));

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let displayName = "";
    let usdtAmountValue: number | null = null;

    if (isTransfer) {
        const toUser = tx.metadata?.toUsername;
        const fromUser = tx.metadata?.fromUsername;
        if (tx.type === "TRANSFER_OUT" || (tx.type === "TRANSFER" && !isIncoming)) {
            displayName = toUser ? `Para @${toUser}` : (tx.recipientName || "Transferência");
        } else {
            displayName = fromUser ? `De @${fromUser}` : (tx.senderName || "Transferência recebida");
        }
    } else if (isConversionTx) {
        displayName = isSellConversion ? "Venda de USDT" : "Compra de USDT";
        const usdtRaw = tx.usdtAmount || (tx.externalData?.usdtAmount as string | number | undefined);
        if (usdtRaw) usdtAmountValue = typeof usdtRaw === "number" ? usdtRaw : parseFloat(String(usdtRaw));
    } else if (tx.description && !isUUID(tx.description)) {
        displayName = tx.description;
    } else if (isIncoming && tx.senderName) {
        displayName = tx.senderName;
    } else if (isIncoming && (tx.externalData?.pagador as Record<string, unknown>)?.nome) {
        displayName = String((tx.externalData?.pagador as Record<string, unknown>).nome);
    } else if (!isIncoming && tx.recipientName) {
        displayName = tx.recipientName;
    } else {
        displayName = isIncoming ? "Depósito PIX" : "Transferência PIX";
    }

    if (tx.status === "COMPLETED" && displayName.toLowerCase().includes("aguardando")) {
        displayName = displayName.replace(/aguardando\s*/gi, "").replace(/depósito pix de\s*/gi, "").trim();
    }

    const iconConfig = isPending
        ? { bg: "bg-white/8", color: "text-white/60", Icon: ArrowRightLeft }
        : isTransfer
          ? { bg: "bg-[#6C5CE7]/12", color: "text-[#8E7BFF]", Icon: UserRoundSearch }
          : isConversionTx
            ? { bg: "bg-[#3871F1]/12", color: "text-[#396DE6]", Icon: ArrowRightLeft }
            : isIncoming
              ? { bg: "bg-emerald-500/12", color: "text-emerald-400", Icon: ArrowDownLeft }
              : { bg: "bg-[#3871F1]/12", color: "text-[#396DE6]", Icon: ArrowUpRight };

    return (
        <motion.div
            className="flex items-center gap-3 py-2.5 active:bg-white/5 -mx-1 px-1 rounded-xl transition-colors cursor-pointer"
            whileTap={{ scale: 0.98 }}
            onClick={onTap}
        >
            <div className={`flex items-center justify-center w-9 h-9 rounded-full ${iconConfig.bg}`}>
                <iconConfig.Icon className={`w-4 h-4 ${iconConfig.color}`} strokeWidth={2} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">{displayName}</p>
                <p className="text-[11px] text-white">{formatDate(tx.createdAt)}</p>
            </div>

            <div className="text-right">
                {isConversionTx ? (
                    <>
                        <p className={`text-[13px] font-semibold ${isSellConversion ? "text-white" : "text-white"}`}>
                            {isSellConversion ? "+" : "-"}
                            {formatCurrency(amount)}
                        </p>
                        {usdtAmountValue !== null && (
                            <p className={`text-[10px] font-medium ${isSellConversion ? "text-white" : "text-white"}`}>
                                {isSellConversion ? "-" : "+"}
                                {formatUSD(usdtAmountValue)}
                            </p>
                        )}
                    </>
                ) : (
                    <p className={`text-[13px] font-semibold ${
                        isPending ? "text-white" : isIncoming ? "text-white" : "text-white"
                    }`}>
                        {isIncoming ? "+" : "-"}
                        {formatCurrency(Math.abs(amount))}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    const { openModal, refreshTrigger, depositBoostUntil } = useUiModals();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [usdtBalance, setUsdtBalance] = React.useState<number | null>(null);
    const [usdtBalanceLoading, setUsdtBalanceLoading] = React.useState(true);
    const [refreshCounter, setRefreshCounter] = React.useState(0);
    const [balanceHidden, setBalanceHidden] = React.useState(false);
    const [showConvertModal, setShowConvertModal] = React.useState(false);
    const [selectedTxId, setSelectedTxId] = React.useState<string | null>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const refreshData = React.useCallback(() => setRefreshCounter((c) => c + 1), []);
    const initialLoadDone = React.useRef(false);

    const { buyRate: usdtRate, loading: usdtLoading } = useUsdtRate();
    const usdtRateWithSpread = usdtRate ?? 0;

    // Handle exchange widget redirect
    React.useEffect(() => {
        if (!searchParams) return;
        const action = searchParams.get("action");
        if (action === "convert" && !loading) {
            setShowConvertModal(true);
            router.replace("/customer/dashboard");
        }
    }, [searchParams, loading, router]);

    // Shared loader for account data (silent = no spinner)
    const loadAccountData = React.useCallback(async (silent: boolean) => {
        const customerId = user?.customerId;
        if (!customerId) return;

        if (!silent) setLoading(true);

        try {
            // Fetch both sources in parallel
            const [accountRes, statementRes] = await Promise.allSettled([
                http.get<AccountSummary & { payments: Payment[] }>(`/accounts/${customerId}/summary`),
                http.get<{ statements: Transaction[]; total: number }>(`/customers/${customerId}/statement?page=1&limit=20`),
            ]);

            // 1. Account summary (for balance)
            if (accountRes.status === "fulfilled") {
                const accountData = accountRes.value.data;
                if (accountData) {
                    setAccount({
                        ...accountData,
                        balance: Number(accountData.balance ?? 0),
                        blockedAmount: Number(accountData.blockedAmount ?? 0),
                    });
                }
            }

            // 2. Build transaction list by merging both sources.
            //    - summary.payments are bank-confirmed (always COMPLETED)
            //    - statement may include pending charges that haven't been
            //      confirmed yet, but also other tx types (PIX_OUT, CONVERSION)
            //    We merge and deduplicate so confirmed payments override any
            //    stale PENDING records from the statement.
            const merged: Transaction[] = [];
            const seenIds = new Set<string>();

            // Confirmed payments first (source of truth for completed PIX_IN)
            if (accountRes.status === "fulfilled") {
                const payments = accountRes.value.data.payments || [];
                for (const payment of payments) {
                    seenIds.add(payment.id);
                    merged.push({
                        transactionId: payment.id,
                        type: "PIX_IN" as const,
                        status: "COMPLETED" as const,
                        amount: payment.paymentValue / 100,
                        description: payment.bankPayload.descricao,
                        senderName: payment.bankPayload.detalhes.nomePagador,
                        senderCpf: payment.bankPayload.detalhes.cpfCnpjPagador,
                        createdAt: payment.paymentDate,
                    });
                }
            }

            // Add statement transactions that aren't already covered by
            // confirmed payments (avoids duplicating a tx that shows as
            // PENDING in statement but COMPLETED in payments)
            if (statementRes.status === "fulfilled" && statementRes.value.data.statements?.length > 0) {
                for (const tx of statementRes.value.data.statements) {
                    if (seenIds.has(tx.transactionId)) continue;

                    // Skip PENDING PIX_IN that match a confirmed payment by
                    // amount + time proximity (IDs may differ between sources)
                    if (tx.type === "PIX_IN" && (tx.status === "PENDING" || tx.status === "PROCESSING")) {
                        const txTime = new Date(tx.createdAt).getTime();
                        const txAmount = Number(tx.amount);
                        const alreadyConfirmed = merged.some(
                            (m) =>
                                m.type === "PIX_IN" &&
                                m.status === "COMPLETED" &&
                                Math.abs(Number(m.amount) - txAmount) < 0.01 &&
                                Math.abs(new Date(m.createdAt).getTime() - txTime) < 300_000
                        );
                        if (alreadyConfirmed) continue;
                    }

                    seenIds.add(tx.transactionId);
                    merged.push(tx);
                }
            }

            merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTransactions(merged);
        } catch (error: unknown) {
            console.error("Error loading dashboard:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [user?.customerId]);

    // Initial load + reload on refresh triggers
    React.useEffect(() => {
        const silent = initialLoadDone.current;
        loadAccountData(silent).then(() => {
            initialLoadDone.current = true;
        });
    }, [loadAccountData, refreshTrigger, refreshCounter]);

    // Poll account data — adaptive interval (5s during deposit boost, otherwise 60s).
    // Pauses when tab is not visible to save battery and bandwidth.
    React.useEffect(() => {
        if (!user?.customerId) return;

        let interval: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (interval) return;
            const isBoosted = depositBoostUntil > Date.now();
            const intervalMs = isBoosted ? 5_000 : 60_000;
            interval = setInterval(() => loadAccountData(true), intervalMs);
        };

        const stopPolling = () => {
            if (interval) { clearInterval(interval); interval = null; }
        };

        const handleVisibility = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                // Refresh immediately when tab becomes visible, then resume polling
                loadAccountData(true);
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibility);

        // When boost is active, schedule a re-render when it expires to revert to 60s
        let boostTimeout: NodeJS.Timeout | undefined;
        const isBoosted = depositBoostUntil > Date.now();
        if (isBoosted) {
            boostTimeout = setTimeout(() => {
                stopPolling();
                startPolling();
            }, depositBoostUntil - Date.now());
        }

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibility);
            if (boostTimeout) clearTimeout(boostTimeout);
        };
    }, [loadAccountData, user?.customerId, depositBoostUntil]);

    // Load wallets
    React.useEffect(() => {
        async function fetchWallets() {
            try {
                const res = await http.get<WalletType[]>("/wallet");
                setWallets(res.data);
            } catch {
                setWallets([]);
            }
        }
        fetchWallets();
    }, [refreshCounter, refreshTrigger]);

    // Calculate USDT balance
    React.useEffect(() => {
        const totalUsdt = wallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
        setUsdtBalance(totalUsdt);
        setUsdtBalanceLoading(false);
    }, [wallets]);

    const saldoBRL = Number(account?.balance ?? 0);
    const saldoUSDT = Number(usdtBalance ?? 0);
    const saldoTotal = saldoBRL + saldoUSDT * usdtRateWithSpread;

    // Deduplication filter
    const filteredTransactions = React.useMemo(() => {
        const seenConversions: Array<{ time: number; amount: number; usdtAmt: number; subType: string; txHash?: string }> = [];
        return transactions.filter((tx, _index, allTx) => {
            if (tx.type === "CONVERSION") {
                const txHash = (tx.externalData?.txHash as string) || undefined;
                const txTime = new Date(tx.createdAt).getTime();
                const txAmount = Number(tx.amount);
                const usdtRaw = (tx.externalData?.usdtAmount as string | number) || tx.usdtAmount;
                const usdtAmt = typeof usdtRaw === "number" ? usdtRaw : parseFloat(String(usdtRaw)) || 0;
                const subType = tx.subType || (tx.description?.toLowerCase().includes("venda") ? "SELL" : "BUY");
                if (txHash) {
                    if (seenConversions.some((s) => s.txHash === txHash)) return false;
                    seenConversions.push({ time: txTime, amount: txAmount, usdtAmt, subType, txHash });
                    return true;
                }
                if (seenConversions.some((s) => s.subType === subType && Math.abs(s.time - txTime) < 300000 && Math.abs(s.amount - txAmount) < 1 && Math.abs(s.usdtAmt - usdtAmt) < 0.5)) return false;
                seenConversions.push({ time: txTime, amount: txAmount, usdtAmt, subType });
                return true;
            }
            if (tx.type !== "PIX_OUT" && tx.type !== "PIX_IN") return true;
            const txTime = new Date(tx.createdAt).getTime();
            const txAmount = Number(tx.amount);
            return !allTx.some((other) => other.transactionId !== tx.transactionId && other.type === "CONVERSION" && Math.abs(txAmount - Number(other.amount)) < 1 && Math.abs(txTime - new Date(other.createdAt).getTime()) < 300000);
        });
    }, [transactions]);

    // ─── Loading state ───────────────────────────────────
    if (loading) {
        return (
            <div className="flex h-[60dvh] flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#3871F1]/30 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="relative h-8 w-8 animate-spin text-[#3871F1]" />
                </div>
            </div>
        );
    }

    return (
        <motion.div className="space-y-0" variants={stagger} initial="hidden" animate="show">
            {/* Convert Modal */}
            <ConvertModal
                open={showConvertModal}
                onClose={() => setShowConvertModal(false)}
                onSuccess={refreshData}
                brlBalance={saldoBRL}
                usdtBalance={saldoUSDT}
            />

            {/* ── Balance Section ── */}
            <motion.div variants={fadeUp} className="text-center pt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <p className="text-[13px] font-medium text-white/70">Saldo total</p>
                    <motion.button
                        onClick={() => setBalanceHidden(!balanceHidden)}
                        className="p-2.5 -m-2.5 rounded-full active:bg-white/10 transition-colors"
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        aria-label={balanceHidden ? "Mostrar saldo" : "Ocultar saldo"}
                    >
                        {balanceHidden ? (
                            <EyeOff className="w-4 h-4 text-white/60" />
                        ) : (
                            <Eye className="w-4 h-4 text-white/60" />
                        )}
                    </motion.button>
                </div>

                <motion.p
                    className="text-[44px] font-bold leading-none"
                    style={{ letterSpacing: "-0.03em", color: "rgba(255,255,255,0.92)" }}
                    key={balanceHidden ? "hidden" : "visible"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                    {balanceHidden ? "R$ ••••••" : formatCurrency(saldoTotal)}
                </motion.p>
            </motion.div>

            {/* ── Currency Cards (symmetrical) ── */}
            <motion.div variants={fadeUp} className="flex gap-3 mt-5">
                {/* BRL Card */}
                <div className="flex-1 fintech-glass-card px-4 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[15px]">🇧🇷</span>
                        <span className="text-white/70 text-[12px] font-medium">BRL</span>
                    </div>
                    <p className="font-semibold text-[22px] leading-tight" style={{ color: "rgba(255,255,255,0.92)" }}>
                        {balanceHidden ? "••••" : formatCurrency(saldoBRL)}
                    </p>
                    <p className="text-white/48 text-[11px] mt-1">Real Brasileiro</p>
                </div>

                {/* USDT Card (with rate integrated) */}
                <div className="flex-1 fintech-glass-card px-4 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Image src="/images/usdt-icon.svg" alt="USDT" width={20} height={20} />
                        <span className="text-white/70 text-[12px] font-medium">USDT</span>
                    </div>
                    <p className="font-semibold text-[22px] leading-tight" style={{ color: "rgba(255,255,255,0.92)" }}>
                        {balanceHidden ? "••••" : usdtBalanceLoading ? "..." : formatUSD(saldoUSDT)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/[0.06]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-white/70">
                            1 USDT = {usdtLoading ? "..." : formatCurrency(usdtRateWithSpread, 2)}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ── Quick Actions (outlined circles) ── */}
            <motion.div variants={fadeUp} className="flex justify-center gap-6 mt-4">
                <QuickAction
                    icon={ArrowDownLeft}
                    label="Depositar"
                    onClick={() => openModal("deposit")}
                />
                <QuickAction
                    icon={ArrowUpRight}
                    label="Transferir"
                    onClick={() => openModal("withdraw")}
                />
                <QuickAction
                    icon={ArrowRightLeft}
                    label="Comprar"
                    onClick={() => setShowConvertModal(true)}
                />
                <QuickAction
                    icon={DollarSign}
                    label="Vender"
                    onClick={() => openModal("sellUsdt")}
                />
                <QuickAction
                    icon={Receipt}
                    label="Pagar"
                    onClick={() => openModal("payBoleto")}
                />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4">
                <Link href="/customer/pro">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="fintech-glass-card px-4 py-3.5 flex items-center gap-3 active:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6C5CE7]/15">
                            <Sparkles className="w-5 h-5 text-[#8E7BFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-white/92">PRO</p>
                            <p className="text-[12px] text-white/48">Trading spot com livro de ofertas</p>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 text-white/30" />
                    </motion.div>
                </Link>
            </motion.div>

            {/* ── Mercado Link ── */}
            <motion.div variants={fadeUp} className="mt-3">
                <Link href="/customer/mercado">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="fintech-glass-card px-4 py-3.5 flex items-center gap-3 active:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3871F1]/15">
                            <TrendingUp className="w-5 h-5 text-[#396DE6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-white/92">Mercado cripto</p>
                            <p className="text-[12px] text-white/48">Top 15 tokens em tempo real</p>
                        </div>
                        <ChevronRight className="w-4.5 h-4.5 text-white/30" />
                    </motion.div>
                </Link>
            </motion.div>

            {/* ── Recent Activity ── */}
            <motion.div variants={fadeUp} className="mt-4">
                <div className="fintech-glass-activity p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[17px] font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>Atividade recente</h3>
                        <Link
                            href="/customer/transactions"
                            className="flex items-center gap-0.5 text-[12px] font-medium text-[#3871F1] active:opacity-80"
                        >
                            Ver tudo
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <div className="divide-y divide-white/[0.06]">
                            {filteredTransactions.slice(0, 5).map((tx) => (
                                <TransactionRow
                                    key={tx.transactionId}
                                    tx={tx}
                                    onTap={() => {
                                        setSelectedTxId(tx.transactionId);
                                        setDetailOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center mb-2">
                                <ArrowDownLeft className="w-4.5 h-4.5 text-white/48" />
                            </div>
                            <p className="text-[13px] text-white/48">Nenhuma transação ainda</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Transaction Detail Sheet ── */}
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
