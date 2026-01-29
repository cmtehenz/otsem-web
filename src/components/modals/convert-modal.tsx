"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingUp, CheckCircle2, Wallet, Check, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

function isLimitExceededError(message?: string): boolean {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes("limite") && (lower.includes("excedido") || lower.includes("upgrade"));
}

type ConvertModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    brlBalance: number;
    usdtBalance: number;
};

type WalletType = {
    id: string;
    currency: string;
    network: string;
    externalAddress: string;
    balance: string;
    isMain?: boolean;
    label?: string;
};

type BuyResponse = {
    conversionId?: string;
    status?: string;
    message?: string;
};

type ConversionStatus = "PENDING" | "PIX_SENT" | "USDT_BOUGHT" | "USDT_WITHDRAWN" | "COMPLETED" | "FAILED";

type ConversionDetail = {
    id: string;
    status: ConversionStatus;
    statusLabel: string;
    usdtAmount: number;
    brlAmount: number;
    network: string;
    txHash?: string;
    createdAt: string;
    completedAt?: string;
};

const STATUS_LABELS: Record<ConversionStatus, string> = {
    PENDING: "Iniciando compra...",
    PIX_SENT: "Enviando BRL para exchange...",
    USDT_BOUGHT: "USDT comprado, preparando envio...",
    USDT_WITHDRAWN: "Enviando USDT para sua carteira...",
    COMPLETED: "Concluído - USDT enviado!",
    FAILED: "Falha na transação"
};

const STATUS_ORDER: ConversionStatus[] = ["PENDING", "PIX_SENT", "USDT_BOUGHT", "USDT_WITHDRAWN", "COMPLETED"];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function ConvertModal({ open, onClose, onSuccess, brlBalance }: ConvertModalProps) {
    const { user } = useAuth();
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "confirm" | "processing" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(true);
    const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null);
    const [conversionId, setConversionId] = React.useState<string | null>(null);
    const [conversionStatus, setConversionStatus] = React.useState<ConversionStatus>("PENDING");
    const [conversionDetail, setConversionDetail] = React.useState<ConversionDetail | null>(null);
    const [limitError, setLimitError] = React.useState<string | null>(null);
    const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

    const customerSpread = user?.spreadValue ?? 0.95;
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;

    const numAmount = parseFloat(amount) || 0;
    const convertedAmount = usdtRateWithSpread ? numAmount / usdtRateWithSpread : 0;
    const minAmount = 10;

    React.useEffect(() => {
        if (open) {
            fetchWallets();
        }
    }, [open]);

    React.useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    async function pollConversionStatus(id: string) {
        try {
            const res = await http.get<ConversionDetail>(`/wallet/conversion/${id}`);
            const detail = res.data;
            setConversionDetail(detail);
            
            const mappedStatus = mapBackendStatus(detail.status);
            setConversionStatus(mappedStatus);
            
            if (mappedStatus === "COMPLETED") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                setTimeout(() => {
                    setStep("success");
                    onSuccess?.();
                }, 1500);
            } else if (mappedStatus === "FAILED") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                toast.error("Falha no processamento da compra");
            }
        } catch (err) {
            console.error("Erro ao verificar status:", err);
        }
    }

    function mapBackendStatus(status: string): ConversionStatus {
        const statusMap: Record<string, ConversionStatus> = {
            "PENDING": "PENDING",
            "PIX_SENT": "PIX_SENT",
            "USDT_BOUGHT": "USDT_BOUGHT",
            "USDT_WITHDRAWN": "USDT_WITHDRAWN",
            "COMPLETED": "COMPLETED",
            "FAILED": "FAILED",
        };
        return statusMap[status] || "PENDING";
    }

    function startPolling(id: string) {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }
        pollConversionStatus(id);
        pollingRef.current = setInterval(() => pollConversionStatus(id), 8000);
    }

    async function fetchWallets() {
        setWalletsLoading(true);
        try {
            const res = await http.get("/wallet");
            const data = Array.isArray(res.data) ? res.data : res.data.wallets || [];
            setWallets(data);
            const mainWallet = data.find((w: WalletType) => w.isMain) || data[0];
            if (mainWallet) {
                setSelectedWalletId(mainWallet.id);
            }
        } catch (err) {
            console.error("Erro ao buscar carteiras:", err);
        } finally {
            setWalletsLoading(false);
        }
    }

    function formatBRL(value: number): string {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        });
    }

    function formatUSDT(value: number): string {
        return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function handleQuickAmount(value: number) {
        setAmount(value.toString());
    }

    function handleMax() {
        setAmount(brlBalance.toFixed(2));
    }

    function handleContinueToAmount() {
        if (!selectedWalletId) {
            toast.error("Selecione uma carteira");
            return;
        }
        setStep("amount");
    }

    function handleContinueToConfirm() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${formatBRL(minAmount)}`);
            return;
        }
        if (numAmount > brlBalance) {
            toast.error("Saldo insuficiente");
            return;
        }
        setStep("confirm");
    }

    async function handleConvert() {
        setLoading(true);
        setStep("processing");
        setConversionStatus("PENDING");
        
        try {
            const res = await http.post<BuyResponse>("/wallet/buy-usdt-with-brl", {
                brlAmount: numAmount,
                walletId: selectedWalletId,
            });
            
            const { conversionId: id, status } = res.data;
            
            if (id) {
                setConversionId(id);
                const mappedStatus = mapBackendStatus(status || "PENDING");
                setConversionStatus(mappedStatus);
                
                if (mappedStatus === "COMPLETED") {
                    setStep("success");
                    toast.success("Compra realizada com sucesso!");
                    onSuccess?.();
                } else if (mappedStatus === "FAILED") {
                    toast.error("Falha na compra");
                    setStep("confirm");
                } else {
                    toast.success("Compra iniciada! Acompanhe o progresso.");
                    startPolling(id);
                }
            } else {
                setStep("success");
                toast.success("Conversão realizada com sucesso!");
                onSuccess?.();
            }
        } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            if (isLimitExceededError(message)) {
                setLimitError(message || "Limite mensal excedido. Considere fazer upgrade do seu nível KYC.");
                setStep("confirm");
            } else {
                toast.error(message || "Erro ao converter");
                setStep("confirm");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        onClose();
        setTimeout(() => {
            setStep("wallet");
            setAmount("");
            setConversionId(null);
            setConversionStatus("PENDING");
            setConversionDetail(null);
            setLimitError(null);
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("wallet");
        } else if (step === "confirm") {
            setStep("amount");
        }
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-[#6F00FF]/50/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "wallet" && "Comprar USDT"}
                        {step === "amount" && "Valor da Compra"}
                        {step === "confirm" && "Confirmar Compra"}
                        {step === "processing" && "Processando Compra"}
                        {step === "success" && "Compra Realizada!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "wallet" && "Escolha onde receber seu USDT"}
                        {step === "amount" && "Digite o valor em BRL"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "processing" && "Acompanhe o progresso da sua compra"}
                        {step === "success" && "Sua compra foi processada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "wallet" && (
                        <div className="w-full space-y-4">
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                    <span className="text-muted-foreground text-sm">Cotação atual</span>
                                </div>
                                <p className="text-foreground font-bold text-lg">
                                    {rateLoading ? "..." : `1 USDT = ${formatBRL(usdtRateWithSpread)}`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Suas carteiras</p>

                                {walletsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-[#6F00FF]/50 dark:text-[#6F00FF] animate-spin" />
                                    </div>
                                ) : wallets.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {wallets.map((wallet, index) => {
                                            const isMain = wallet.isMain || index === 0;
                                            const networkColor = wallet.network === "TRON"
                                                ? "text-red-600 dark:text-red-400 bg-red-500/20"
                                                : "text-green-600 dark:text-green-400 bg-green-500/20";
                                            return (
                                                <button
                                                    key={wallet.id}
                                                    onClick={() => setSelectedWalletId(wallet.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${selectedWalletId === wallet.id
                                                        ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/20"
                                                        : "border-border bg-muted hover:border-[#6F00FF]/50/30"
                                                        }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                        <Wallet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-foreground font-medium text-sm truncate">
                                                                {wallet.label || `Carteira ${index + 1}`}
                                                            </p>
                                                            {isMain && (
                                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 rounded text-amber-600 dark:text-amber-400 text-xs shrink-0">
                                                                    <Star className="w-3 h-3" />
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`px-1.5 py-0.5 text-xs rounded ${networkColor}`}>
                                                                {wallet.network || "SOLANA"}
                                                            </span>
                                                            <p className="text-muted-foreground text-xs truncate">
                                                                {wallet.externalAddress?.slice(0, 8)}...{wallet.externalAddress?.slice(-6)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedWalletId === wallet.id && (
                                                        <Check className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF] shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-muted border border-border rounded-xl">
                                        <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground text-sm mb-3">Nenhuma carteira cadastrada</p>
                                        <Link href="/customer/wallet" onClick={handleClose}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#6F00FF]/50/30 text-[#6F00FF] dark:text-[#6F00FF] hover:bg-[#6F00FF]/50/10"
                                            >
                                                Cadastrar Carteira
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {wallets.length > 0 && (
                                <div className="text-center">
                                    <Link href="/customer/wallet" onClick={handleClose} className="text-[#6F00FF] dark:text-[#6F00FF] hover:text-[#6F00FF]/50 text-sm">
                                        Gerenciar carteiras →
                                    </Link>
                                </div>
                            )}

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedWalletId || wallets.length === 0}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                Continuar
                            </Button>
                        </div>
                    )}

                    {step === "amount" && (
                        <div className="w-full space-y-5">
                            <button
                                onClick={handleBack}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                            >
                                ← Voltar
                            </button>

                            <div className="flex items-center justify-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                                    🇧🇷
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                                    💵
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                                    R$
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={minAmount}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-12 pr-16 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-[#6F00FF]/50/50 focus:ring-2 focus:ring-[#6F00FF]/50/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                                <button
                                    onClick={handleMax}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-[#6F00FF] dark:text-[#6F00FF] hover:text-[#6F00FF]/50 bg-[#6F00FF]/50/10 rounded"
                                >
                                    MAX
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-[#6F00FF]/50/30 bg-[#6F00FF]/50/10 text-[#6F00FF] dark:text-[#6F00FF]/30 hover:bg-[#6F00FF]/50/20 hover:border-[#6F00FF]/50/50 transition"
                                    >
                                        R$ {value}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4">
                                <p className="text-muted-foreground text-sm">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {formatUSDT(convertedAmount)}
                                </p>
                            </div>

                            <Button
                                onClick={handleContinueToConfirm}
                                disabled={numAmount < minAmount}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                Continuar
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Saldo disponível: {formatBRL(brlBalance)}
                            </p>
                        </div>
                    )}

                    {step === "confirm" && (
                        <div className="w-full space-y-5">
                            <button
                                onClick={handleBack}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                            >
                                ← Voltar
                            </button>

                            <div className="bg-muted border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl">
                                            🇧🇷
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">De</p>
                                            <p className="text-foreground font-bold">{formatBRL(numAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs text-right">Para</p>
                                            <p className="text-green-600 dark:text-green-400 font-bold">{formatUSDT(convertedAmount)}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            💵
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Cotação</span>
                                        <span className="text-foreground">1 USDT = {formatBRL(usdtRateWithSpread)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rede</span>
                                        <span className="text-foreground">{selectedWallet?.network || "SOLANA"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Carteira</span>
                                        <span className="text-foreground text-xs truncate max-w-[180px]">
                                            {selectedWallet?.externalAddress?.slice(0, 8)}...{selectedWallet?.externalAddress?.slice(-6)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {limitError && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">{limitError}</p>
                                        <Link href="/customer/kyc" onClick={handleClose}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                            >
                                                Ver meus limites
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleConvert}
                                disabled={loading || !!limitError}
                                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    "Confirmar Compra"
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-[#6F00FF]/50/20 flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-[#6F00FF]/50 animate-spin" />
                                    </div>
                                    {conversionStatus === "COMPLETED" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-full">
                                            <Check className="w-10 h-10 text-green-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-bold text-lg">
                                    {STATUS_LABELS[conversionStatus] || "Processando..."}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Aguarde enquanto processamos sua compra
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 space-y-4">
                                {STATUS_ORDER.map((status, idx) => {
                                    const currentIdx = STATUS_ORDER.indexOf(conversionStatus);
                                    const isCompleted = idx < currentIdx || conversionStatus === "COMPLETED";
                                    const isCurrent = status === conversionStatus && conversionStatus !== "COMPLETED";
                                    
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isCompleted 
                                                    ? "bg-green-500" 
                                                    : isCurrent 
                                                        ? "bg-[#6F00FF]/50 animate-pulse" 
                                                        : "bg-muted-foreground/20"
                                            }`}>
                                                {isCompleted ? (
                                                    <Check className="w-4 h-4 text-white" />
                                                ) : isCurrent ? (
                                                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">{idx + 1}</span>
                                                )}
                                            </div>
                                            <span className={`text-sm ${
                                                isCompleted || isCurrent 
                                                    ? "text-foreground font-medium" 
                                                    : "text-muted-foreground"
                                            }`}>
                                                {STATUS_LABELS[status]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor investido</span>
                                    <span className="text-foreground font-medium">{formatBRL(numAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">USDT a receber</span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {formatUSDT(conversionDetail?.usdtAmount || convertedAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Carteira</span>
                                    <span className="text-foreground text-xs truncate max-w-[180px]">
                                        {selectedWallet?.externalAddress?.slice(0, 8)}...{selectedWallet?.externalAddress?.slice(-6)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#6F00FF]/50/10 border border-[#6F00FF]/50/30 rounded-xl p-4">
                                <p className="text-[#6F00FF] dark:text-[#6F00FF] text-sm text-center">
                                    Este processo leva aproximadamente 2-5 minutos. Você pode fechar esta janela.
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="w-full border-border text-foreground rounded-xl py-6"
                            >
                                Fechar e Acompanhar Depois
                            </Button>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground text-sm mb-1">Você comprou</p>
                                <p className="text-3xl font-bold bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                    {formatUSDT(conversionDetail?.usdtAmount || convertedAmount)}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    por {formatBRL(numAmount)}
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                <p className="text-muted-foreground text-xs">Rede: {selectedWallet?.network || "SOLANA"}</p>
                                <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                                    USDT enviado para sua carteira!
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6"
                            >
                                Fechar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
