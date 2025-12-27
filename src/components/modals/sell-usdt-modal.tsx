"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingDown, Wallet, Key, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useUsdtRate } from "@/lib/useUsdtRate";

type SellUsdtModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

type Network = "SOLANA" | "TRON";

type WalletItem = {
    id: string;
    address: string;
    network: Network;
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
    usdtAmount: number;
    brlAmount: number;
    status: string;
    txHash?: string;
};

const QUICK_AMOUNTS = [10, 50, 100, 500];

export function SellUsdtModal({ open, onClose, onSuccess }: SellUsdtModalProps) {
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "confirm" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [network, setNetwork] = React.useState<Network>("SOLANA");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletItem[]>([]);
    const [selectedWallet, setSelectedWallet] = React.useState<WalletItem | null>(null);
    const [privateKey, setPrivateKey] = React.useState("");
    const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
    const [sellData, setSellData] = React.useState<SellResponse | null>(null);
    const [walletsLoading, setWalletsLoading] = React.useState(false);

    const numAmount = parseFloat(amount) || 0;
    const minAmount = 5;
    const estimatedBrl = usdtRate ? numAmount * usdtRate * 0.99 : 0;

    React.useEffect(() => {
        if (open) {
            fetchWallets();
        }
    }, [open]);

    async function fetchWallets() {
        setWalletsLoading(true);
        try {
            const res = await http.get<WalletItem[]>("/wallet/my-wallets");
            setWallets(res.data);
        } catch (err) {
            console.error("Erro ao buscar carteiras:", err);
            toast.error("Erro ao carregar suas carteiras");
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

    function handleSelectWallet(wallet: WalletItem) {
        setSelectedWallet(wallet);
        setNetwork(wallet.network);
    }

    function handleQuickAmount(value: number) {
        setAmount(value.toString());
    }

    function handleContinueToAmount() {
        if (!selectedWallet) {
            toast.error("Selecione uma carteira");
            return;
        }
        setStep("amount");
    }

    async function handleContinueToConfirm() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${formatUSDT(minAmount)}`);
            return;
        }
        if (!privateKey.trim()) {
            toast.error("Informe a chave privada da carteira");
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
        if (!selectedWallet || !privateKey.trim()) {
            toast.error("Dados incompletos");
            return;
        }
        setLoading(true);
        try {
            const res = await http.post<SellResponse>("/wallet/sell-usdt-to-brl", {
                walletId: selectedWallet.id,
                usdtAmount: numAmount,
                privateKey: privateKey.trim(),
                network,
            });
            setSellData(res.data);
            setStep("success");
            toast.success("Venda realizada com sucesso!");
            onSuccess?.();
        } catch (err: unknown) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao processar venda");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        onClose();
        setTimeout(() => {
            setStep("wallet");
            setAmount("");
            setQuote(null);
            setSelectedWallet(null);
            setSellData(null);
            setPrivateKey("");
            setNetwork("SOLANA");
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("wallet");
        } else if (step === "confirm") {
            setStep("amount");
        }
    }

    const filteredWallets = wallets.filter(w => w.network === network);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-orange-500/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "wallet" && "Vender USDT"}
                        {step === "amount" && "Valor e Chave Privada"}
                        {step === "confirm" && "Confirmar Venda"}
                        {step === "success" && "Venda Concluída!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "wallet" && "Escolha a rede e a carteira de origem"}
                        {step === "amount" && "Informe o valor e a chave privada"}
                        {step === "confirm" && "Revise os dados antes de confirmar"}
                        {step === "success" && "Sua venda foi processada com sucesso"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "wallet" && (
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
                                <p className="text-muted-foreground text-sm">Escolha a rede:</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setNetwork("SOLANA"); setSelectedWallet(null); }}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "SOLANA"
                                                ? "border-purple-500 bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                                : "border-border bg-muted text-muted-foreground hover:border-purple-500/30"
                                        }`}
                                    >
                                        Solana
                                    </button>
                                    <button
                                        onClick={() => { setNetwork("TRON"); setSelectedWallet(null); }}
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

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Selecione a carteira:
                                </p>
                                
                                {walletsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                    </div>
                                ) : filteredWallets.length === 0 ? (
                                    <div className="bg-muted border border-border rounded-xl p-4 text-center">
                                        <p className="text-muted-foreground text-sm">
                                            Nenhuma carteira {network} cadastrada
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {filteredWallets.map((wallet) => (
                                            <button
                                                key={wallet.id}
                                                onClick={() => handleSelectWallet(wallet)}
                                                className={`w-full p-3 rounded-xl border text-left transition ${
                                                    selectedWallet?.id === wallet.id
                                                        ? "border-orange-500 bg-orange-500/10"
                                                        : "border-border bg-muted hover:border-orange-500/30"
                                                }`}
                                            >
                                                <p className="text-foreground font-medium text-sm">
                                                    {wallet.label || "Carteira"}
                                                </p>
                                                <p className="text-muted-foreground text-xs font-mono mt-1">
                                                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedWallet || walletsLoading}
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
                                    <span className="text-muted-foreground text-sm">Carteira:</span>
                                    <span className="text-foreground text-xs font-mono">
                                        {selectedWallet?.address.slice(0, 8)}...{selectedWallet?.address.slice(-6)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-muted-foreground text-sm">Rede:</span>
                                    <span className={`text-sm font-medium ${network === "SOLANA" ? "text-purple-600" : "text-red-600"}`}>
                                        {network}
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

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-amber-500" />
                                    <p className="text-muted-foreground text-sm">Chave Privada:</p>
                                </div>
                                <input
                                    type="password"
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    placeholder="Cole sua chave privada aqui..."
                                    className="w-full px-4 text-sm bg-muted border border-border text-foreground h-12 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none placeholder:text-muted-foreground/50"
                                />
                                <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-amber-600 dark:text-amber-400 text-xs">
                                        Sua chave privada é usada apenas para assinar a transação e não é armazenada.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleContinueToConfirm}
                                disabled={numAmount < minAmount || !privateKey.trim() || loading}
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
                                        <span className="text-muted-foreground">Carteira origem</span>
                                        <span className="text-foreground text-xs font-mono">
                                            {selectedWallet?.address.slice(0, 6)}...{selectedWallet?.address.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
                                    Ao confirmar, <strong>{formatUSDT(numAmount)}</strong> serão transferidos da sua carteira para a OKX
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
                                        Processando transação...
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
                                <p className="text-foreground font-bold text-lg">
                                    Venda processada!
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Sua venda de <span className="text-foreground font-medium">{formatUSDT(numAmount)}</span> foi realizada com sucesso.
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor vendido</span>
                                    <span className="text-foreground font-medium">{formatUSDT(sellData?.usdtAmount || numAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor em BRL</span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {formatBRL(sellData?.brlAmount || quote?.brlAmount || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                        {sellData?.status === "completed" ? "Concluído" : "Processando PIX"}
                                    </span>
                                </div>
                                {sellData?.txHash && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">TX Hash</span>
                                        <span className="text-foreground text-xs font-mono">
                                            {sellData.txHash.slice(0, 10)}...{sellData.txHash.slice(-6)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-green-600 dark:text-green-400 text-sm text-center">
                                    O valor em BRL será creditado no seu saldo OTSEM em breve
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6"
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
