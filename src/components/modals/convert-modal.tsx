"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingUp, CheckCircle2, Wallet, Check, Star } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

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

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function ConvertModal({ open, onClose, onSuccess, brlBalance }: ConvertModalProps) {
    const { user } = useAuth();
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "confirm" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(true);
    const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null);

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
        try {
            await http.post("/wallet/buy-usdt-with-brl", {
                brlAmount: numAmount,
                walletId: selectedWalletId,
            });
            setStep("success");
            toast.success("Conversão realizada com sucesso!");
            onSuccess?.();
        } catch (err: any) {
            const message = err?.response?.data?.message || "Erro ao converter";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        onClose();
        setTimeout(() => {
            setStep("wallet");
            setAmount("");
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
            <DialogContent className="bg-card border border-violet-500/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "wallet" && "Comprar USDT"}
                        {step === "amount" && "Valor da Compra"}
                        {step === "confirm" && "Confirmar Compra"}
                        {step === "success" && "Compra Realizada!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "wallet" && "Escolha onde receber seu USDT"}
                        {step === "amount" && "Digite o valor em BRL"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "success" && "Sua compra foi processada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "wallet" && (
                        <div className="w-full space-y-4">
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-violet-500 dark:text-violet-400" />
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
                                        <Loader2 className="w-6 h-6 text-violet-500 dark:text-violet-400 animate-spin" />
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
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                                                        selectedWalletId === wallet.id
                                                            ? "border-violet-500 bg-violet-500/20"
                                                            : "border-border bg-muted hover:border-violet-500/30"
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
                                                        <Check className="w-5 h-5 text-violet-500 dark:text-violet-400 shrink-0" />
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
                                                className="border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                                            >
                                                Cadastrar Carteira
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {wallets.length > 0 && (
                                <div className="text-center">
                                    <Link href="/customer/wallet" onClick={handleClose} className="text-violet-600 dark:text-violet-400 hover:text-violet-500 text-sm">
                                        Gerenciar carteiras →
                                    </Link>
                                </div>
                            )}

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedWalletId || wallets.length === 0}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
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
                                <ArrowRight className="w-5 h-5 text-violet-500 dark:text-violet-400" />
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
                                    className="w-full pl-12 pr-16 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                                <button
                                    onClick={handleMax}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 bg-violet-500/10 rounded"
                                >
                                    MAX
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition"
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
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
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
                                    <ArrowRight className="w-5 h-5 text-violet-500 dark:text-violet-400" />
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

                            <Button
                                onClick={handleConvert}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
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

                    {step === "success" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground text-sm mb-1">Você comprou</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                    {formatUSDT(convertedAmount)}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    por {formatBRL(numAmount)}
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                <p className="text-muted-foreground text-xs">Rede: {selectedWallet?.network || "SOLANA"}</p>
                                <p className="text-muted-foreground text-xs mt-1">
                                    O USDT será enviado para sua carteira em alguns minutos
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6"
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
