"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    ArrowRight,
    Wallet,
    Check,
    Star,
    Receipt,
    Copy,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import Link from "next/link";

type BoletoPaymentModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

type WalletItem = {
    id: string;
    currency: string;
    network: string;
    externalAddress: string;
    balance: string;
    isMain?: boolean;
    label?: string;
};

type CryptoCurrency = "USDT" | "SOL" | "TRX";

type QuoteResponse = {
    boletoAmount: number;
    serviceFee: number;
    serviceFeePct: number;
    totalBrl: number;
    cryptoCurrency: string;
    exchangeRate: number;
    cryptoAmount: number;
};

type Step = "input" | "quote" | "confirm" | "success";

export function BoletoPaymentModal({ open, onClose, onSuccess }: BoletoPaymentModalProps) {
    const [step, setStep] = React.useState<Step>("input");
    const [barcode, setBarcode] = React.useState("");
    const [boletoAmount, setBoletoAmount] = React.useState("");
    const [cryptoCurrency, setCryptoCurrency] = React.useState<CryptoCurrency>("USDT");
    const [description, setDescription] = React.useState("");
    const [wallets, setWallets] = React.useState<WalletItem[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(false);
    const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(null);
    const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [paymentId, setPaymentId] = React.useState<string | null>(null);
    const [amountActive, setAmountActive] = React.useState(false);
    const amountInputRef = React.useRef<HTMLInputElement>(null);

    const numAmount = parseFloat(boletoAmount) || 0;

    // Determine which crypto currencies are available based on wallets
    const hasSolanaWallet = wallets.some((w) => w.network?.toLowerCase() === "solana");
    const availableCurrencies: CryptoCurrency[] = hasSolanaWallet
        ? ["USDT", "SOL", "TRX"]
        : ["USDT", "TRX"];

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
            const mainWallet = data.find((w: WalletItem) => w.isMain) || data[0];
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

    function formatCrypto(value: number, currency: string): string {
        const decimals = currency === "USDT" ? 2 : 4;
        return `${value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`;
    }

    async function handleGetQuote() {
        if (!barcode.trim()) {
            toast.error("Informe o código de barras do boleto");
            return;
        }
        if (numAmount < 1) {
            toast.error("Informe o valor do boleto");
            return;
        }
        if (!selectedWalletId) {
            toast.error("Selecione uma carteira");
            return;
        }

        setLoading(true);
        try {
            const res = await http.get<QuoteResponse>("/boleto-payments/quote", {
                params: { boletoAmount: numAmount, cryptoCurrency },
            });
            setQuote(res.data);
            setStep("quote");
        } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao buscar cotação. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!quote || !selectedWalletId) return;

        setLoading(true);
        try {
            const res = await http.post<{ id: string; message?: string }>("/boleto-payments", {
                barcode: barcode.trim(),
                boletoAmount: numAmount,
                walletId: selectedWalletId,
                cryptoCurrency,
                description: description.trim() || undefined,
            });
            setPaymentId(res.data.id);
            setStep("success");
            toast.success("Pagamento de boleto enviado!");
            onSuccess?.();
        } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao enviar pagamento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        onClose();
        setTimeout(() => {
            setStep("input");
            setBarcode("");
            setBoletoAmount("");
            setCryptoCurrency("USDT");
            setDescription("");
            setSelectedWalletId(wallets.find((w) => w.isMain)?.id || wallets[0]?.id || null);
            setQuote(null);
            setLoading(false);
            setPaymentId(null);
            setAmountActive(false);
        }, 200);
    }

    function handleCryptoSelect(c: CryptoCurrency) {
        setCryptoCurrency(c);
        if (c === "SOL") {
            // Auto-select the primary Solana wallet
            const solanaWallet = wallets.find((w) => w.network?.toLowerCase() === "solana" && w.isMain)
                || wallets.find((w) => w.network?.toLowerCase() === "solana");
            if (solanaWallet) {
                setSelectedWalletId(solanaWallet.id);
            }
        }
    }

    function handleAmountClick() {
        if (!amountActive) {
            setAmountActive(true);
            // Focus the input after activating
            setTimeout(() => amountInputRef.current?.focus(), 0);
        }
    }

    function handleBack() {
        if (step === "quote") {
            setStep("input");
            setQuote(null);
        } else if (step === "confirm") {
            setStep("quote");
        }
    }

    const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

    return (
        <BottomSheet open={open} onOpenChange={handleClose}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle className="text-foreground text-xl text-center">
                        {step === "input" && "Pagar Boleto"}
                        {step === "quote" && "Cotação do Pagamento"}
                        {step === "confirm" && "Confirmar Pagamento"}
                        {step === "success" && "Pagamento Enviado!"}
                    </BottomSheetTitle>
                    <BottomSheetDescription className="text-muted-foreground text-center text-sm">
                        {step === "input" && "Pague boletos usando crypto da sua carteira"}
                        {step === "quote" && "Revise os valores antes de confirmar"}
                        {step === "confirm" && "Confirme para enviar o pagamento"}
                        {step === "success" && "O admin processará o pagamento do boleto"}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {/* STEP 1: Input */}
                    {step === "input" && (
                        <div className="w-full space-y-4">
                            {/* Barcode input */}
                            <div className="space-y-2">
                                <label className="text-muted-foreground text-sm flex items-center gap-2">
                                    <Receipt className="w-4 h-4" />
                                    Código de barras (linha digitável)
                                </label>
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                                    className="w-full px-4 text-sm bg-muted border border-border text-foreground h-12 rounded-xl focus:border-[#FFB300]/50 focus:ring-2 focus:ring-[#6F00FF]/20 focus:outline-none placeholder:text-muted-foreground/50"
                                />
                            </div>

                            {/* Amount input */}
                            <div className="space-y-2">
                                <label className="text-muted-foreground text-sm">Valor do boleto (BRL)</label>
                                <div className="relative cursor-pointer" onClick={handleAmountClick}>
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                                        R$
                                    </span>
                                    <input
                                        ref={amountInputRef}
                                        type="number"
                                        step="0.01"
                                        min={1}
                                        value={boletoAmount}
                                        onChange={(e) => setBoletoAmount(e.target.value)}
                                        readOnly={!amountActive}
                                        onFocus={() => setAmountActive(true)}
                                        placeholder="0,00"
                                        className={`w-full pl-12 pr-4 text-sm bg-muted border border-border text-foreground h-12 rounded-xl focus:border-[#FFB300]/50 focus:ring-2 focus:ring-[#6F00FF]/20 focus:outline-none placeholder:text-muted-foreground/50 ${!amountActive ? "cursor-pointer" : ""}`}
                                    />
                                </div>
                            </div>

                            {/* Crypto currency selector */}
                            <div className="space-y-2">
                                <label className="text-muted-foreground text-sm">Moeda de pagamento</label>
                                <div className="flex gap-2">
                                    {availableCurrencies.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => handleCryptoSelect(c)}
                                            className={`flex-1 py-3 px-4 rounded-xl border transition font-medium text-sm ${
                                                cryptoCurrency === c
                                                    ? "border-[#6F00FF] bg-[#FFB300]/20 text-[#6F00FF] dark:text-[#8B2FFF]"
                                                    : "border-border bg-muted text-muted-foreground hover:border-[#FFB300]/30"
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wallet selector */}
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Selecione a carteira
                                </p>

                                {walletsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-[#6F00FF] animate-spin" />
                                    </div>
                                ) : wallets.length > 0 ? (
                                    <div className="space-y-2 max-h-36 overflow-y-auto">
                                        {wallets.map((wallet, index) => {
                                            const isMain = wallet.isMain || index === 0;
                                            return (
                                                <button
                                                    key={wallet.id}
                                                    onClick={() => setSelectedWalletId(wallet.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                                                        selectedWalletId === wallet.id
                                                            ? "border-[#FFB300]/50 bg-[#FFB300]/20"
                                                            : "border-border bg-muted hover:border-[#FFB300]/30"
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                        <Wallet className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-foreground font-medium text-sm truncate">
                                                                {wallet.label || `Carteira ${index + 1}`}
                                                            </p>
                                                            {isMain && (
                                                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-white/70 text-xs shrink-0">
                                                                    <Star className="w-3 h-3" />
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-muted-foreground text-xs truncate">
                                                            {wallet.network} &bull; {wallet.externalAddress?.slice(0, 8)}...{wallet.externalAddress?.slice(-6)}
                                                        </p>
                                                    </div>
                                                    {selectedWalletId === wallet.id && (
                                                        <Check className="w-5 h-5 text-[#6F00FF] shrink-0" />
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
                                                className="border-[#FFB300]/30 text-[#6F00FF] hover:bg-[#FFB300]/10"
                                            >
                                                Cadastrar Carteira
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Description (optional) */}
                            <div className="space-y-2">
                                <label className="text-muted-foreground text-sm">Descrição (opcional)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Conta de luz, boleto bancário..."
                                    className="w-full px-4 text-sm bg-muted border border-border text-foreground h-12 rounded-xl focus:border-[#FFB300]/50 focus:ring-2 focus:ring-[#6F00FF]/20 focus:outline-none placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <Button
                                onClick={handleGetQuote}
                                disabled={!barcode.trim() || numAmount < 1 || !selectedWalletId || loading}
                                className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Buscando cotação...
                                    </>
                                ) : (
                                    <>
                                        Ver Cotação
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* STEP 2: Quote */}
                    {step === "quote" && quote && (
                        <div className="w-full space-y-5">
                            <button
                                onClick={handleBack}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                            >
                                &larr; Voltar
                            </button>

                            <div className="bg-muted border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                                            <Receipt className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Valor do boleto</p>
                                            <p className="text-foreground font-bold">{formatBRL(quote.boletoAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[#6F00FF]" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs text-right">Débito em crypto</p>
                                            <p className="text-white font-bold">
                                                {formatCrypto(quote.cryptoAmount, quote.cryptoCurrency)}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Valor do boleto</span>
                                        <span className="text-foreground">{formatBRL(quote.boletoAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Taxa de serviço ({quote.serviceFeePct}%)
                                        </span>
                                        <span className="text-foreground">{formatBRL(quote.serviceFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-muted-foreground">Total em BRL</span>
                                        <span className="text-foreground">{formatBRL(quote.totalBrl)}</span>
                                    </div>
                                    <div className="border-t border-border pt-2 mt-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Cotação</span>
                                        <span className="text-foreground">
                                            1 {quote.cryptoCurrency} = {formatBRL(quote.exchangeRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-muted-foreground">Valor a debitar</span>
                                        <span className="text-white">
                                            {formatCrypto(quote.cryptoAmount, quote.cryptoCurrency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Carteira</span>
                                        <span className="text-foreground text-xs truncate max-w-[180px]">
                                            {selectedWallet?.label || "Carteira"} &bull;{" "}
                                            {selectedWallet?.externalAddress?.slice(0, 8)}...
                                            {selectedWallet?.externalAddress?.slice(-6)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Confirmar Pagamento"
                                )}
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Ao confirmar, o valor em crypto será reservado da sua carteira.
                                O boleto será processado pelo administrador.
                            </p>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === "success" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-bold text-lg">Pagamento enviado!</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Seu pedido de pagamento de boleto foi registrado.
                                    O administrador processará o pagamento.
                                </p>
                            </div>

                            {quote && (
                                <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Valor do boleto</span>
                                        <span className="text-foreground font-medium">
                                            {formatBRL(quote.boletoAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Crypto debitado</span>
                                        <span className="text-white font-medium">
                                            {formatCrypto(quote.cryptoAmount, quote.cryptoCurrency)}
                                        </span>
                                    </div>
                                    {paymentId && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">ID</span>
                                            <button
                                                className="text-[#6F00FF] text-xs font-mono hover:underline flex items-center gap-1"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(paymentId);
                                                    toast.success("ID copiado!");
                                                }}
                                            >
                                                {paymentId.slice(0, 8)}...
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 rounded-xl p-4">
                                <p className="text-[#6F00FF] text-sm text-center">
                                    Acompanhe o status na seção &quot;Meus Boletos&quot;.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Link href="/customer/boleto" onClick={handleClose} className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full border-border text-foreground rounded-xl py-6"
                                    >
                                        Ver Meus Boletos
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleClose}
                                    className="flex-1 bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6"
                                >
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}
