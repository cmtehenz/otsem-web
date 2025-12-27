"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingDown, CheckCircle2, Copy, Check, QrCode, Wallet, Star } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type SellUsdtModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

type Network = "SOLANA" | "TRON";

type PixKeyType = {
    id: string;
    pixKey: string;
    pixKeyType: string;
    isMain?: boolean;
    label?: string;
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
    const [step, setStep] = React.useState<"pix" | "amount" | "confirm" | "deposit" | "waiting">("pix");
    const [amount, setAmount] = React.useState("");
    const [network, setNetwork] = React.useState<Network>("SOLANA");
    const [loading, setLoading] = React.useState(false);
    const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
    const [sellData, setSellData] = React.useState<SellResponse | null>(null);
    const [copied, setCopied] = React.useState(false);
    
    const [pixKeys, setPixKeys] = React.useState<PixKeyType[]>([]);
    const [pixKeysLoading, setPixKeysLoading] = React.useState(true);
    const [selectedPixKeyId, setSelectedPixKeyId] = React.useState<string | null>(null);

    const numAmount = parseFloat(amount) || 0;
    const minAmount = 5;
    const estimatedBrl = usdtRate ? numAmount * usdtRate * 0.99 : 0;

    React.useEffect(() => {
        if (open) {
            fetchPixKeys();
        }
    }, [open]);

    async function fetchPixKeys() {
        setPixKeysLoading(true);
        try {
            const res = await http.get("/customers/me/pix-keys");
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setPixKeys(data);
            const mainKey = data.find((k: PixKeyType) => k.isMain) || data[0];
            if (mainKey) {
                setSelectedPixKeyId(mainKey.id);
            }
        } catch (err) {
            console.error("Erro ao buscar chaves PIX:", err);
        } finally {
            setPixKeysLoading(false);
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

    function formatPixKeyType(type: string): string {
        const types: Record<string, string> = {
            CPF: "CPF",
            CNPJ: "CNPJ",
            EMAIL: "E-mail",
            PHONE: "Telefone",
            EVP: "Chave Aleatória",
        };
        return types[type] || type;
    }

    function truncatePixKey(key: string): string {
        if (key.length <= 20) return key;
        return `${key.slice(0, 10)}...${key.slice(-8)}`;
    }

    function handleQuickAmount(value: number) {
        setAmount(value.toString());
    }

    function handleContinueToAmount() {
        if (!selectedPixKeyId) {
            toast.error("Selecione uma chave PIX para receber");
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
        if (!selectedPixKeyId) {
            toast.error("Selecione uma chave PIX");
            return;
        }
        setLoading(true);
        try {
            const res = await http.post<SellResponse>("/wallet/sell-usdt-to-pix", {
                usdtAmount: numAmount,
                network,
                pixKeyId: selectedPixKeyId,
            });
            setSellData(res.data);
            setStep("deposit");
            toast.success("Venda iniciada! Envie o USDT para o endereço");
        } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao iniciar venda");
        } finally {
            setLoading(false);
        }
    }

    function handleCopyAddress() {
        const address = sellData?.depositAddress;
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
            setStep("pix");
            setAmount("");
            setQuote(null);
            setSellData(null);
            setSelectedPixKeyId(pixKeys.find(k => k.isMain)?.id || pixKeys[0]?.id || null);
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("pix");
        } else if (step === "confirm") {
            setStep("amount");
        }
    }

    function handleFinish() {
        setStep("waiting");
        toast.success("Acompanhe o status da sua venda nas transações");
        onSuccess?.();
    }

    const selectedPixKey = pixKeys.find(k => k.id === selectedPixKeyId);
    const displayAddress = sellData?.depositAddress || "";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-orange-500/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "pix" && "Vender USDT"}
                        {step === "amount" && "Valor da Venda"}
                        {step === "confirm" && "Confirmar Venda"}
                        {step === "deposit" && "Envie seu USDT"}
                        {step === "waiting" && "Aguardando Depósito"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "pix" && "Escolha onde receber seu BRL via PIX"}
                        {step === "amount" && "Digite o valor em USDT para vender"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "deposit" && "Envie o USDT para receber BRL via PIX"}
                        {step === "waiting" && "Assim que confirmarmos, você receberá o PIX"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "pix" && (
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
                                <p className="text-muted-foreground text-sm">Receber PIX em:</p>

                                {pixKeysLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                    </div>
                                ) : pixKeys.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {pixKeys.map((key, index) => {
                                            const isMain = key.isMain || index === 0;
                                            const isSelected = key.id === selectedPixKeyId;
                                            return (
                                                <button
                                                    key={key.id}
                                                    onClick={() => setSelectedPixKeyId(key.id)}
                                                    className={`w-full p-3 rounded-xl border transition text-left ${
                                                        isSelected
                                                            ? "border-orange-500 bg-orange-500/10"
                                                            : "border-border bg-muted hover:border-orange-500/30"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                isSelected ? "bg-orange-500/20" : "bg-muted-foreground/10"
                                                            }`}>
                                                                <Wallet className={`w-4 h-4 ${isSelected ? "text-orange-500" : "text-muted-foreground"}`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-foreground font-medium text-sm">
                                                                    {key.label || formatPixKeyType(key.pixKeyType)}
                                                                </p>
                                                                <p className="text-muted-foreground text-xs">
                                                                    {truncatePixKey(key.pixKey)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isMain && (
                                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                            )}
                                                            {isSelected && (
                                                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                        <p className="text-muted-foreground text-sm mb-2">
                                            Você ainda não tem chaves PIX cadastradas
                                        </p>
                                        <Link
                                            href="/customer/pix"
                                            className="text-orange-500 hover:text-orange-400 text-sm font-medium"
                                            onClick={handleClose}
                                        >
                                            Cadastrar chave PIX →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedPixKeyId || pixKeys.length === 0}
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
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-orange-500" />
                                    <span className="text-muted-foreground text-sm">PIX para:</span>
                                    <span className="text-foreground text-sm font-medium">
                                        {truncatePixKey(selectedPixKey?.pixKey || "")}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Rede de envio</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNetwork("SOLANA")}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "SOLANA"
                                                ? "border-purple-500 bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                                : "border-border bg-muted text-muted-foreground hover:border-purple-500/30"
                                        }`}
                                    >
                                        Solana
                                    </button>
                                    <button
                                        onClick={() => setNetwork("TRON")}
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
                                            <p className="text-muted-foreground text-xs">De</p>
                                            <p className="text-foreground font-bold">{formatUSDT(numAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-orange-500" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs text-right">Para</p>
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
                                        <span className="text-muted-foreground">PIX para</span>
                                        <span className="text-foreground">
                                            {truncatePixKey(selectedPixKey?.pixKey || "")}
                                        </span>
                                    </div>
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
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
                                    Após confirmar, você terá 30 minutos para enviar o USDT
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

                    {step === "deposit" && (
                        <div className="w-full space-y-5">
                            <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                <p className="text-muted-foreground text-sm mb-2">Envie exatamente:</p>
                                <p className="text-2xl font-bold text-foreground">{formatUSDT(numAmount)}</p>
                                <p className={`text-sm mt-1 ${network === "SOLANA" ? "text-purple-600" : "text-red-600"}`}>
                                    via {network}
                                </p>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-4">
                                <div className="flex items-center justify-center mb-4">
                                    <QrCode className="w-5 h-5 text-muted-foreground mr-2" />
                                    <span className="text-muted-foreground text-sm">Endereço de depósito</span>
                                </div>
                                
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-white rounded-xl">
                                        <QRCodeSVG value={displayAddress} size={160} />
                                    </div>
                                </div>

                                <div className="bg-muted rounded-lg p-3 break-all text-sm font-mono text-center text-foreground">
                                    {displayAddress}
                                </div>

                                <Button
                                    onClick={handleCopyAddress}
                                    variant="outline"
                                    className="w-full mt-3 border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar Endereço
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-green-600 dark:text-green-400 text-sm text-center">
                                    Você receberá <strong>{formatBRL(quote?.brlAmount || estimatedBrl)}</strong> via PIX em{" "}
                                    <strong>{truncatePixKey(selectedPixKey?.pixKey || "")}</strong>
                                </p>
                            </div>

                            <Button
                                onClick={handleFinish}
                                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl py-6"
                            >
                                Já enviei o USDT
                            </Button>
                        </div>
                    )}

                    {step === "waiting" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-semibold text-lg mb-1">
                                    Aguardando confirmação
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Estamos verificando seu depósito na rede {network}
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 text-center space-y-2">
                                <p className="text-muted-foreground text-sm">Valor esperado:</p>
                                <p className="text-xl font-bold text-foreground">{formatUSDT(numAmount)}</p>
                                <p className="text-muted-foreground text-sm">
                                    Você receberá: <span className="text-green-600 font-medium">{formatBRL(quote?.brlAmount || estimatedBrl)}</span>
                                </p>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-600 dark:text-amber-400 text-xs text-center">
                                    A confirmação pode levar alguns minutos dependendo da rede.
                                    Você será notificado quando o PIX for enviado.
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
