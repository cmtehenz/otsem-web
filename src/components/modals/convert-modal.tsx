"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingUp, CheckCircle2, Wallet, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { useAuth } from "@/contexts/auth-context";

type ConvertModalProps = {
    open: boolean;
    onClose: () => void;
    brlBalance: number;
    usdtBalance: number;
};

type WalletType = {
    id: string;
    currency: string;
    network: string;
    externalAddress: string;
    balance: string;
};

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function ConvertModal({ open, onClose, brlBalance }: ConvertModalProps) {
    const { user } = useAuth();
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "confirm" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(true);
    const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null);
    const [customWallet, setCustomWallet] = React.useState("");
    const [useCustomWallet, setUseCustomWallet] = React.useState(false);

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
            if (data.length > 0) {
                setSelectedWalletId(data[0].id);
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
        if (!useCustomWallet && !selectedWalletId && wallets.length === 0) {
            toast.error("Selecione ou adicione uma carteira");
            return;
        }
        if (useCustomWallet && !customWallet.trim()) {
            toast.error("Digite o endereço da carteira");
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
            const payload: { brlAmount: number; walletId?: string; externalAddress?: string } = {
                brlAmount: numAmount,
            };
            
            if (useCustomWallet && customWallet.trim()) {
                payload.externalAddress = customWallet.trim();
            } else if (selectedWalletId) {
                payload.walletId = selectedWalletId;
            }

            await http.post("/wallet/buy-usdt-with-brl", payload);
            setStep("success");
            toast.success("Conversão realizada com sucesso!");
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
            setUseCustomWallet(false);
            setCustomWallet("");
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
    const displayWalletAddress = useCustomWallet 
        ? customWallet 
        : selectedWallet?.externalAddress || "";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[#0a0118] border border-violet-500/20 max-w-sm shadow-2xl shadow-violet-500/10">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center">
                        {step === "wallet" && "Comprar USDT"}
                        {step === "amount" && "Valor da Compra"}
                        {step === "confirm" && "Confirmar Compra"}
                        {step === "success" && "Compra Realizada!"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        {step === "wallet" && "Escolha onde receber seu USDT"}
                        {step === "amount" && "Digite o valor em BRL"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "success" && "Sua compra foi processada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "wallet" && (
                        <div className="w-full space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-violet-400" />
                                    <span className="text-white/60 text-sm">Cotação atual</span>
                                </div>
                                <p className="text-white font-bold text-lg">
                                    {rateLoading ? "..." : `1 USDT = ${formatBRL(usdtRateWithSpread)}`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-white/60 text-sm">Suas carteiras</p>
                                
                                {walletsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                                    </div>
                                ) : wallets.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {wallets.map((wallet) => (
                                            <button
                                                key={wallet.id}
                                                onClick={() => {
                                                    setSelectedWalletId(wallet.id);
                                                    setUseCustomWallet(false);
                                                }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                                                    selectedWalletId === wallet.id && !useCustomWallet
                                                        ? "border-violet-500 bg-violet-500/20"
                                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-white font-medium text-sm">
                                                        {wallet.network || "SOLANA"}
                                                    </p>
                                                    <p className="text-white/50 text-xs truncate">
                                                        {wallet.externalAddress?.slice(0, 12)}...{wallet.externalAddress?.slice(-8)}
                                                    </p>
                                                </div>
                                                {selectedWalletId === wallet.id && !useCustomWallet && (
                                                    <Check className="w-5 h-5 text-violet-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-white/40 text-sm">
                                        Nenhuma carteira cadastrada
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => setUseCustomWallet(!useCustomWallet)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                                        useCustomWallet
                                            ? "border-violet-500 bg-violet-500/20"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-medium text-sm">Usar outra carteira</p>
                                        <p className="text-white/50 text-xs">Digite o endereço manualmente</p>
                                    </div>
                                    {useCustomWallet && <Check className="w-5 h-5 text-violet-400" />}
                                </button>

                                {useCustomWallet && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={customWallet}
                                            onChange={(e) => setCustomWallet(e.target.value)}
                                            placeholder="Endereço da carteira USDT (Solana)"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none placeholder:text-white/30 text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedWalletId && !useCustomWallet}
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
                                className="text-white/50 hover:text-white text-sm flex items-center gap-1"
                            >
                                ← Voltar
                            </button>

                            <div className="flex items-center justify-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                    🇧🇷
                                </div>
                                <ArrowRight className="w-5 h-5 text-violet-400" />
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                    💵
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                                    R$
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={minAmount}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-12 pr-16 text-center text-xl bg-white/5 border border-white/10 text-white h-14 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none placeholder:text-white/30"
                                    autoFocus
                                />
                                <button
                                    onClick={handleMax}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 rounded"
                                >
                                    MAX
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition"
                                    >
                                        R$ {value}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/50 text-sm">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
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

                            <p className="text-white/40 text-xs text-center">
                                Saldo disponível: {formatBRL(brlBalance)}
                            </p>
                        </div>
                    )}

                    {step === "confirm" && (
                        <div className="w-full space-y-5">
                            <button
                                onClick={handleBack}
                                className="text-white/50 hover:text-white text-sm flex items-center gap-1"
                            >
                                ← Voltar
                            </button>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl">
                                            🇧🇷
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs">De</p>
                                            <p className="text-white font-bold">{formatBRL(numAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-violet-400" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-white/50 text-xs text-right">Para</p>
                                            <p className="text-green-400 font-bold">{formatUSDT(convertedAmount)}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            💵
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Cotação</span>
                                        <span className="text-white">1 USDT = {formatBRL(usdtRateWithSpread)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Carteira destino</span>
                                        <span className="text-white text-xs truncate max-w-[180px]">
                                            {displayWalletAddress.slice(0, 8)}...{displayWalletAddress.slice(-6)}
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
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-white/50 text-sm mb-1">Você comprou</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    {formatUSDT(convertedAmount)}
                                </p>
                                <p className="text-white/50 text-sm mt-2">
                                    por {formatBRL(numAmount)}
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/50 text-xs text-center">
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
