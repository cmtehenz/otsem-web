"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRightLeft, ArrowRight, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
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

type ConvertDirection = "BRL_TO_USDT" | "USDT_TO_BRL";

const QUICK_AMOUNTS_BRL = [100, 500, 1000, 5000];
const QUICK_AMOUNTS_USDT = [10, 50, 100, 500];

export function ConvertModal({ open, onClose, brlBalance, usdtBalance }: ConvertModalProps) {
    const { user } = useAuth();
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"direction" | "amount" | "confirm" | "success">("direction");
    const [direction, setDirection] = React.useState<ConvertDirection>("BRL_TO_USDT");
    const [amount, setAmount] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const customerSpread = user?.spreadValue ?? 0.95;
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;

    const numAmount = parseFloat(amount) || 0;
    const isBrlToUsdt = direction === "BRL_TO_USDT";
    
    const convertedAmount = isBrlToUsdt
        ? (usdtRateWithSpread ? numAmount / usdtRateWithSpread : 0)
        : numAmount * usdtRateWithSpread;

    const maxAmount = isBrlToUsdt ? brlBalance : usdtBalance;
    const minAmount = isBrlToUsdt ? 10 : 1;
    const quickAmounts = isBrlToUsdt ? QUICK_AMOUNTS_BRL : QUICK_AMOUNTS_USDT;
    const sourceCurrency = isBrlToUsdt ? "BRL" : "USDT";
    const targetCurrency = isBrlToUsdt ? "USDT" : "BRL";

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

    function handleSelectDirection(dir: ConvertDirection) {
        setDirection(dir);
        setAmount("");
        setStep("amount");
    }

    function handleQuickAmount(value: number) {
        setAmount(value.toString());
    }

    function handleMax() {
        setAmount(maxAmount.toFixed(2));
    }

    function handleContinue() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${isBrlToUsdt ? formatBRL(minAmount) : formatUSDT(minAmount)}`);
            return;
        }
        if (numAmount > maxAmount) {
            toast.error("Saldo insuficiente");
            return;
        }
        setStep("confirm");
    }

    async function handleConvert() {
        setLoading(true);
        try {
            await http.post("/wallet/convert", {
                fromCurrency: sourceCurrency,
                toCurrency: targetCurrency,
                amount: numAmount,
            });
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
            setStep("direction");
            setDirection("BRL_TO_USDT");
            setAmount("");
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("direction");
            setAmount("");
        } else if (step === "confirm") {
            setStep("amount");
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[#0a0118] border border-violet-500/20 max-w-sm shadow-2xl shadow-violet-500/10">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center">
                        {step === "direction" && "Converter"}
                        {step === "amount" && `Converter ${sourceCurrency}`}
                        {step === "confirm" && "Confirmar Conversão"}
                        {step === "success" && "Conversão Realizada!"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        {step === "direction" && "Escolha a direção da conversão"}
                        {step === "amount" && `Digite o valor em ${sourceCurrency}`}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "success" && "Sua conversão foi processada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "direction" && (
                        <div className="w-full space-y-3">
                            <button
                                onClick={() => handleSelectDirection("BRL_TO_USDT")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-5 hover:border-violet-500/50 hover:bg-violet-500/10 transition text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                                            🇧🇷
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-semibold">BRL</span>
                                                <ArrowRight className="w-4 h-4 text-white/40" />
                                                <span className="text-white font-semibold">USDT</span>
                                            </div>
                                            <p className="text-white/50 text-sm mt-0.5">
                                                Saldo: {formatBRL(brlBalance)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-violet-400">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectDirection("USDT_TO_BRL")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-5 hover:border-violet-500/50 hover:bg-violet-500/10 transition text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
                                            💵
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-semibold">USDT</span>
                                                <ArrowRight className="w-4 h-4 text-white/40" />
                                                <span className="text-white font-semibold">BRL</span>
                                            </div>
                                            <p className="text-white/50 text-sm mt-0.5">
                                                Saldo: {formatUSDT(usdtBalance)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-violet-400">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </button>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-violet-400" />
                                    <span className="text-white/60 text-sm">Cotação atual</span>
                                </div>
                                <p className="text-white font-bold text-lg">
                                    {rateLoading ? "..." : `1 USDT = ${formatBRL(usdtRateWithSpread)}`}
                                </p>
                            </div>
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
                                    {isBrlToUsdt ? "🇧🇷" : "💵"}
                                </div>
                                <ArrowRight className="w-5 h-5 text-violet-400" />
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                    {isBrlToUsdt ? "💵" : "🇧🇷"}
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                                    {isBrlToUsdt ? "R$" : "$"}
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
                                {quickAmounts.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition"
                                    >
                                        {isBrlToUsdt ? `R$ ${value}` : `$ ${value}`}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/50 text-sm">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    {isBrlToUsdt ? formatUSDT(convertedAmount) : formatBRL(convertedAmount)}
                                </p>
                            </div>

                            <Button
                                onClick={handleContinue}
                                disabled={numAmount < minAmount}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                Continuar
                            </Button>

                            <p className="text-white/40 text-xs text-center">
                                Saldo disponível: {isBrlToUsdt ? formatBRL(maxAmount) : formatUSDT(maxAmount)}
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
                                            {isBrlToUsdt ? "🇧🇷" : "💵"}
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs">De</p>
                                            <p className="text-white font-bold">
                                                {isBrlToUsdt ? formatBRL(numAmount) : formatUSDT(numAmount)}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRightLeft className="w-5 h-5 text-violet-400" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-white/50 text-xs text-right">Para</p>
                                            <p className="text-green-400 font-bold">
                                                {isBrlToUsdt ? formatUSDT(convertedAmount) : formatBRL(convertedAmount)}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            {isBrlToUsdt ? "💵" : "🇧🇷"}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Cotação</span>
                                        <span className="text-white">1 USDT = {formatBRL(usdtRateWithSpread)}</span>
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
                                        Convertendo...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-5 h-5 mr-2" />
                                        Confirmar Conversão
                                    </>
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
                                <p className="text-white/50 text-sm mb-1">Convertido</p>
                                <p className="text-2xl font-bold text-white">
                                    {isBrlToUsdt ? formatBRL(numAmount) : formatUSDT(numAmount)}
                                </p>
                                <p className="text-white/50 text-sm mt-2">para</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mt-1">
                                    {isBrlToUsdt ? formatUSDT(convertedAmount) : formatBRL(convertedAmount)}
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
