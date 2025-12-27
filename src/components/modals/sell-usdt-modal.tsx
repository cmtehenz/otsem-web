"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingDown, Copy, Check, QrCode } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { QRCodeSVG } from "qrcode.react";

type SellUsdtModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

type Network = "SOLANA" | "TRON";

type DepositAddressResponse = {
    address: string;
    network: Network;
    memo?: string;
};

type QuoteResponse = {
    usdtAmount: number;
    brlAmount: number;
    exchangeRate: number;
    spreadPercent: number;
    network: Network;
};

type SellResponse = {
    conversionId: string;
    depositAddress: string;
    network: Network;
    usdtAmount: number;
    brlAmount: number;
    status: string;
};

const QUICK_AMOUNTS = [10, 50, 100, 500];

export function SellUsdtModal({ open, onClose, onSuccess }: SellUsdtModalProps) {
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"network" | "amount" | "confirm" | "success">("network");
    const [amount, setAmount] = React.useState("");
    const [network, setNetwork] = React.useState<Network>("SOLANA");
    const [loading, setLoading] = React.useState(false);
    const [depositAddress, setDepositAddress] = React.useState<DepositAddressResponse | null>(null);
    const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
    const [sellData, setSellData] = React.useState<SellResponse | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [addressLoading, setAddressLoading] = React.useState(false);

    const numAmount = parseFloat(amount) || 0;
    const minAmount = 5;
    const estimatedBrl = usdtRate ? numAmount * usdtRate * 0.99 : 0;

    async function fetchDepositAddress(selectedNetwork: Network) {
        setAddressLoading(true);
        try {
            const res = await http.get<DepositAddressResponse>("/wallet/deposit-address", {
                params: { network: selectedNetwork }
            });
            setDepositAddress(res.data);
        } catch (err) {
            console.error("Erro ao buscar endereço:", err);
            toast.error("Erro ao buscar endereço de depósito");
        } finally {
            setAddressLoading(false);
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

    function handleSelectNetwork(selectedNetwork: Network) {
        setNetwork(selectedNetwork);
        fetchDepositAddress(selectedNetwork);
    }

    function handleQuickAmount(value: number) {
        setAmount(value.toString());
    }

    function handleContinueToAmount() {
        if (!depositAddress) {
            toast.error("Aguarde o carregamento do endereço");
            return;
        }
        setStep("amount");
    }

    async function handleContinueToConfirm() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${formatUSDT(minAmount)}`);
            return;
        }
        setLoading(true);
        try {
            const res = await http.get<QuoteResponse>("/wallet/quote-sell-usdt", {
                params: { usdtAmount: numAmount, network }
            });
            setQuote(res.data);
            setStep("confirm");
        } catch (err) {
            console.error("Erro ao buscar cotação:", err);
            toast.error("Erro ao buscar cotação");
        } finally {
            setLoading(false);
        }
    }

    async function handleConfirmSell() {
        setLoading(true);
        try {
            const res = await http.post<SellResponse>("/wallet/sell-usdt-to-pix", {
                usdtAmount: numAmount,
                network,
            });
            setSellData(res.data);
            setStep("success");
            toast.success("Venda registrada! Agora envie o USDT para o endereço");
            onSuccess?.();
        } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao iniciar venda");
        } finally {
            setLoading(false);
        }
    }

    function handleCopyAddress() {
        const address = depositAddress?.address;
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success("Endereço copiado!");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    function handleClose() {
        onClose();
        setTimeout(() => {
            setStep("network");
            setAmount("");
            setQuote(null);
            setDepositAddress(null);
            setSellData(null);
            setNetwork("SOLANA");
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("network");
        } else if (step === "confirm") {
            setStep("amount");
        }
    }

    const displayAddress = depositAddress?.address || "";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-orange-500/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "network" && "Vender USDT"}
                        {step === "amount" && "Valor da Venda"}
                        {step === "confirm" && "Confirmar Venda"}
                        {step === "success" && "Venda Registrada!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "network" && "Escolha a rede e veja o endereço de depósito"}
                        {step === "amount" && "Informe quanto USDT você vai enviar"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "success" && "Envie o USDT para receber BRL via PIX"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "network" && (
                        <div className="w-full space-y-5">
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-orange-500" />
                                    <span className="text-muted-foreground text-sm">Cotação atual</span>
                                </div>
                                <p className="text-foreground font-bold text-lg">
                                    {rateLoading ? "..." : `1 USDT = ${formatBRL(usdtRate || 0)}`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Escolha a rede para enviar USDT:</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSelectNetwork("SOLANA")}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "SOLANA"
                                                ? "border-purple-500 bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                                : "border-border bg-muted text-muted-foreground hover:border-purple-500/30"
                                        }`}
                                    >
                                        Solana
                                    </button>
                                    <button
                                        onClick={() => handleSelectNetwork("TRON")}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "TRON"
                                                ? "border-red-500 bg-red-500/20 text-red-600 dark:text-red-400"
                                                : "border-border bg-muted text-muted-foreground hover:border-red-500/30"
                                        }`}
                                    >
                                        Tron (TRC20)
                                    </button>
                                </div>
                            </div>

                            {addressLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                </div>
                            ) : depositAddress ? (
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex items-center justify-center mb-3">
                                        <QrCode className="w-4 h-4 text-muted-foreground mr-2" />
                                        <span className="text-muted-foreground text-sm">Endereço de depósito OKX</span>
                                    </div>
                                    
                                    <div className="flex justify-center mb-3">
                                        <div className="p-2 bg-white rounded-xl">
                                            <QRCodeSVG value={displayAddress} size={120} />
                                        </div>
                                    </div>

                                    <div className="bg-muted rounded-lg p-2 break-all text-xs font-mono text-center text-foreground">
                                        {displayAddress}
                                    </div>

                                    <Button
                                        onClick={handleCopyAddress}
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3 h-3 mr-1" />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copiar Endereço
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-muted border border-border rounded-xl p-6 text-center">
                                    <p className="text-muted-foreground text-sm">
                                        Selecione uma rede para ver o endereço de depósito
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!depositAddress || addressLoading}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
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

                            <div className="bg-muted border border-border rounded-xl p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Rede:</span>
                                    <span className={`text-sm font-medium ${network === "SOLANA" ? "text-purple-600" : "text-red-600"}`}>
                                        {network}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-muted-foreground text-sm">Endereço:</span>
                                    <span className="text-foreground text-xs font-mono">
                                        {displayAddress.slice(0, 8)}...{displayAddress.slice(-6)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                                    💵
                                </div>
                                <ArrowRight className="w-5 h-5 text-orange-500" />
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                                    🇧🇷
                                </div>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={minAmount}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/50 transition"
                                    >
                                        $ {value}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4">
                                <p className="text-muted-foreground text-sm">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {formatBRL(estimatedBrl)}
                                </p>
                            </div>

                            <Button
                                onClick={handleContinueToConfirm}
                                disabled={numAmount < minAmount || loading}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Buscando cotação...
                                    </>
                                ) : (
                                    "Continuar"
                                )}
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Mínimo: {formatUSDT(minAmount)}
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
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            💵
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Você envia</p>
                                            <p className="text-foreground font-bold">{formatUSDT(numAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-orange-500" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs text-right">Você recebe</p>
                                            <p className="text-green-600 dark:text-green-400 font-bold">
                                                {formatBRL(quote?.brlAmount || estimatedBrl)}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            🇧🇷
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Cotação</span>
                                        <span className="text-foreground">
                                            1 USDT = {formatBRL(quote?.exchangeRate || usdtRate || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rede</span>
                                        <span className={network === "SOLANA" ? "text-purple-600" : "text-red-600"}>
                                            {network}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Spread</span>
                                        <span className="text-foreground">{quote?.spreadPercent || 1}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Endereço</span>
                                        <span className="text-foreground text-xs font-mono">
                                            {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
                                    Após confirmar, envie exatamente <strong>{formatUSDT(numAmount)}</strong> para o endereço acima
                                </p>
                            </div>

                            <Button
                                onClick={handleConfirmSell}
                                disabled={loading}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    "Confirmar Venda"
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-semibold text-lg mb-1">
                                    Venda registrada com sucesso!
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Agora envie o USDT para o endereço abaixo
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                <p className="text-muted-foreground text-sm mb-2">Envie exatamente:</p>
                                <p className="text-2xl font-bold text-foreground">{formatUSDT(numAmount)}</p>
                                <p className={`text-sm mt-1 ${network === "SOLANA" ? "text-purple-600" : "text-red-600"}`}>
                                    via {network}
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-4">
                                <div className="flex justify-center mb-3">
                                    <div className="p-2 bg-white rounded-xl">
                                        <QRCodeSVG value={displayAddress} size={120} />
                                    </div>
                                </div>

                                <div className="bg-muted rounded-lg p-2 break-all text-xs font-mono text-center text-foreground">
                                    {displayAddress}
                                </div>

                                <Button
                                    onClick={handleCopyAddress}
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3 h-3 mr-1" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3 mr-1" />
                                            Copiar Endereço
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-green-600 dark:text-green-400 text-sm text-center">
                                    Após confirmarmos o depósito, você receberá{" "}
                                    <strong>{formatBRL(quote?.brlAmount || sellData?.brlAmount || estimatedBrl)}</strong> via PIX
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="w-full border-border text-foreground hover:bg-muted rounded-xl py-6"
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
