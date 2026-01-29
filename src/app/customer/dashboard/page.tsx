"use client";

import * as React from "react";
import { Loader2, Wallet, ArrowDownLeft, ArrowRightLeft, ArrowUpRight, TrendingUp, RefreshCw } from "lucide-react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { DepositModal } from "@/components/modals/deposit-modal";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { ConvertModal } from "@/components/modals/convert-modal";
import { useUiModals } from "@/stores/ui-modals";
import { LimitsCard } from "@/components/kyc/limits-card";
import Link from "next/link";

type AccountSummary = {
    accountHolderId: string;
    availableBalance: number;
    blockedBalance: number;
    totalBalance: number;
    currency: string;
    updatedAt: string;
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
    // Campos legados ou de conversão que podem vir da API ou serem calculados
    usdtAmount?: string | number | null;
    subType?: "BUY" | "SELL" | null;
    externalData?: any;
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

export default function Dashboard() {
    const { user } = useAuth();
    const { openModal, refreshTrigger } = useUiModals();
    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [usdtBalance, setUsdtBalance] = React.useState<number | null>(null);
    const [usdtBalanceLoading, setUsdtBalanceLoading] = React.useState(true);
    const [refreshCounter, setRefreshCounter] = React.useState(0);

    const refreshData = React.useCallback(() => {
        setRefreshCounter((c) => c + 1);
    }, []);

    const { rate: usdtRate, loading: usdtLoading, updatedAt } = useUsdtRate();
    const [timer, setTimer] = React.useState(15);

    const customerSpread = user?.spreadValue ?? 0.95;
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;

    React.useEffect(() => {
        setTimer(15);
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [updatedAt]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                const customerId = user?.customerId;
                if (!customerId) {
                    return;
                }

                const [accountRes, statementRes] = await Promise.all([
                    http.get<AccountSummary>(`/customers/${customerId}/balance`),
                    http.get<{ statements: Transaction[] }>(`/customers/${customerId}/statement?limit=10`)
                ]);
                
                if (!cancelled) {
                    setAccount(accountRes.data);
                    const txData = statementRes.data;
                    if (txData && Array.isArray(txData.statements)) {
                        setTransactions(txData.statements);
                    } else {
                        setTransactions([]);
                    }
                }

            } catch (error: unknown) {
                if (!cancelled) {
                    console.error(error);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id, user?.customerId, refreshTrigger, refreshCounter]);

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
    }, [refreshCounter]);

    React.useEffect(() => {
        if (wallets.length > 0) {
            const totalUsdt = wallets.reduce((sum, wallet) => {
                return sum + (parseFloat(wallet.balance) || 0);
            }, 0);
            setUsdtBalance(totalUsdt);
            setUsdtBalanceLoading(false);
        } else {
            setUsdtBalance(0);
            setUsdtBalanceLoading(false);
        }
    }, [wallets]);

    const saldoBRL = account?.availableBalance ?? 0;
    const saldoUSDT = usdtBalance ?? 0;
    const saldoTotal = saldoBRL + (saldoUSDT * usdtRateWithSpread);

    const [showConvertModal, setShowConvertModal] = React.useState(false);

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader2 className="relative h-10 w-10 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <DepositModal />
            <WithdrawModal />
            <ConvertModal
                open={showConvertModal}
                onClose={() => setShowConvertModal(false)}
                onSuccess={refreshData}
                brlBalance={saldoBRL}
                usdtBalance={saldoUSDT}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerencie seu saldo e transações</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => window.location.reload()}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            <div className="bg-gradient-to-br from-[#6F00FF] to-purple-700 rounded-2xl p-6 shadow-xl shadow-[#6F00FF]/50/20">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white/80 text-sm">Saldo total estimado</p>
                    <Wallet className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-4xl font-bold text-white mb-6">
                    {formatCurrency(saldoTotal)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <p className="text-white/60 text-xs mb-1">BRL</p>
                        <p className="text-white font-bold text-xl">{formatCurrency(saldoBRL)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <p className="text-white/60 text-xs mb-1">USDT</p>
                        <p className="text-white font-bold text-xl">
                            {usdtBalanceLoading ? "..." : formatUSD(saldoUSDT)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                    onClick={() => openModal("deposit")}
                    className="bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl py-6 text-sm"
                >
                    <ArrowDownLeft className="w-5 h-5 mr-1.5" />
                    Depositar
                </Button>
                <Button
                    onClick={() => openModal("withdraw")}
                    className="bg-card border border-border hover:bg-accent text-foreground font-semibold rounded-xl py-6 text-sm"
                >
                    <ArrowUpRight className="w-5 h-5 mr-1.5" />
                    Transferir
                </Button>
                <Button
                    onClick={() => setShowConvertModal(true)}
                    className="bg-[#6F00FF] hover:bg-[#6F00FF]/50 text-white font-semibold rounded-xl py-6 text-sm"
                >
                    <ArrowRightLeft className="w-5 h-5 mr-1.5" />
                    Comprar USDT
                </Button>
                <Button
                    onClick={() => openModal("sellUsdt")}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl py-6 text-sm"
                >
                    <ArrowRightLeft className="w-5 h-5 mr-1.5" />
                    Vender USDT
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                            <span className="text-muted-foreground text-sm">Cotação USDT</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Atualiza em {timer}s</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {usdtLoading ? "..." : formatCurrency(usdtRateWithSpread, 4)}
                    </p>
                </div>
                <LimitsCard compact />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-foreground font-semibold">Últimas transações</h2>
                    <Link href="/customer/transactions" className="text-sm text-[#6F00FF]/50 hover:text-[#6F00FF] font-medium">
                        Ver todas
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {transactions.length > 0 ? (
                        (() => {
                            const seenConversions: Array<{ time: number; amount: number; usdtAmt: number; subType: string; txHash?: string }> = [];
                            
                            return transactions.filter((tx, _index, allTx) => {
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
                        })()
                            .slice(0, 5)
                            .map((tx) => {
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

                            return (
                                <div key={tx.transactionId} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition">
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
                        })
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

        </div>
    );
}
