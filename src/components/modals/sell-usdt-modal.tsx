"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetDescription } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingDown, Wallet, Check } from "lucide-react";
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
    externalAddress: string;
    network: Network;
    label?: string | null;
    balance?: string;
    isActive?: boolean;
    okxWhitelisted?: boolean;
};

type CustodialSellResponse = {
    conversionId: string;
    status: string;
    message: string;
    txHash?: string;
};

type ConversionStatus = "PENDING" | "USDT_RECEIVED" | "USDT_SOLD" | "COMPLETED" | "FAILED";

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
    PENDING: "Aguardando confirmação do depósito",
    USDT_RECEIVED: "USDT recebido, vendendo...",
    USDT_SOLD: "USDT vendido, creditando saldo...",
    COMPLETED: "Concluído!",
    FAILED: "Falha na transação"
};

const STATUS_ORDER: ConversionStatus[] = ["PENDING", "USDT_RECEIVED", "USDT_SOLD", "COMPLETED"];

const QUICK_AMOUNTS = [10, 50, 100, 500];

export function SellUsdtModal({ open, onClose, onSuccess }: SellUsdtModalProps) {
    const { sellRate: usdtSellRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "processing" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [network, setNetwork] = React.useState<Network>("SOLANA");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletItem[]>([]);
    const [selectedWallet, setSelectedWallet] = React.useState<WalletItem | null>(null);
    const [txHash, setTxHash] = React.useState<string | null>(null);
    const [walletsLoading, setWalletsLoading] = React.useState(false);
    const [_conversionId, setConversionId] = React.useState<string | null>(null);
    const [conversionStatus, setConversionStatus] = React.useState<ConversionStatus>("PENDING");
    const [conversionDetail, setConversionDetail] = React.useState<ConversionDetail | null>(null);
    const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

    const numAmount = parseFloat(amount) || 0;
    const minAmount = 5;
    const estimatedBrl = usdtSellRate ? numAmount * usdtSellRate : 0;

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
            setConversionStatus(detail.status);
            if (detail.txHash) setTxHash(detail.txHash);
            
            if (detail.status === "COMPLETED") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                setTimeout(() => {
                    setStep("success");
                    onSuccess?.();
                }, 1500);
            } else if (detail.status === "FAILED") {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                toast.error("Falha no processamento da venda");
            }
        } catch (err) {
            console.error("Erro ao verificar status:", err);
        }
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
            const res = await http.get<WalletItem[]>("/wallet/usdt");
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

    async function handleSellCustodial() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${formatUSDT(minAmount)}`);
            return;
        }
        if (!selectedWallet) {
            toast.error("Selecione uma carteira");
            return;
        }

        setLoading(true);
        try {
            const res = await http.post<CustodialSellResponse>("/wallet/sell-usdt-custodial", {
                walletId: selectedWallet.id,
                usdtAmount: numAmount,
                network,
            });

            if (res.data.txHash) setTxHash(res.data.txHash);
            setConversionId(res.data.conversionId);
            setConversionStatus("PENDING");
            setStep("processing");
            toast.success("Venda iniciada! Acompanhe o progresso.");
            startPolling(res.data.conversionId);
        } catch (err: unknown) {
            console.error("Erro ao vender USDT:", err);
            const message = isAxiosError(err)
                ? err.response?.data?.message
                : err instanceof Error
                    ? err.message
                    : "Erro ao processar venda";
            toast.error(message);
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
            setSelectedWallet(null);
            setTxHash(null);
            setNetwork("SOLANA");
            setConversionId(null);
            setConversionStatus("PENDING");
            setConversionDetail(null);
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("wallet");
        }
    }

    const filteredWallets = wallets.filter(w => w.network === network);

    return (
        <BottomSheet open={open} onOpenChange={handleClose}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle className="text-foreground text-xl text-center">
                        {step === "wallet" && "Vender USDT"}
                        {step === "amount" && "Valor da Venda"}
                        {step === "processing" && "Processando Venda"}
                        {step === "success" && "Venda Concluída!"}
                    </BottomSheetTitle>
                    <BottomSheetDescription className="text-muted-foreground text-center text-sm">
                        {step === "wallet" && "Escolha a rede e a carteira de origem"}
                        {step === "amount" && "Informe quanto USDT deseja vender"}
                        {step === "processing" && "Acompanhe o progresso da sua venda"}
                        {step === "success" && "Sua venda foi processada com sucesso"}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "wallet" && (
                        <div className="w-full space-y-5">
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-white/70" />
                                    <span className="text-muted-foreground text-sm">Cotação atual</span>
                                </div>
                                <p className="text-foreground font-bold text-lg">
                                    {rateLoading ? "..." : `1 USDT = ${formatBRL(usdtSellRate || 0)}`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm">Escolha a rede:</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setNetwork("SOLANA"); setSelectedWallet(null); }}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "SOLANA"
                                                ? "border-[#6F00FF] bg-[#FFB300]/20 text-[#6F00FF] dark:text-[#8B2FFF]"
                                                : "border-border bg-muted text-muted-foreground hover:border-[#6F00FF]/30"
                                        }`}
                                    >
                                        Solana
                                    </button>
                                    <button
                                        onClick={() => { setNetwork("TRON"); setSelectedWallet(null); }}
                                        className={`flex-1 py-3 px-4 rounded-xl border transition font-medium ${
                                            network === "TRON"
                                                ? "border-[#6F00FF] bg-[#FFB300]/20 text-[#6F00FF] dark:text-[#8B2FFF]"
                                                : "border-border bg-muted text-muted-foreground hover:border-[#6F00FF]/30"
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
                                        <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
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
                                                        ? "border-[#6F00FF] bg-[#6F00FF]/10"
                                                        : "border-border bg-muted hover:border-[#6F00FF]/30"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-foreground font-medium text-sm">
                                                        {wallet.label || "Carteira"}
                                                    </p>
                                                    <p className="text-white text-sm font-medium">
                                                        {parseFloat(wallet.balance || "0").toFixed(2)} USDT
                                                    </p>
                                                </div>
                                                <p className="text-muted-foreground text-xs font-mono mt-1">
                                                    {wallet.externalAddress ? `${wallet.externalAddress.slice(0, 10)}...${wallet.externalAddress.slice(-8)}` : "Endereço indisponível"}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleContinueToAmount}
                                disabled={!selectedWallet || walletsLoading}
                                className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6 disabled:opacity-50"
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
                                        {selectedWallet?.externalAddress ? `${selectedWallet.externalAddress.slice(0, 8)}...${selectedWallet.externalAddress.slice(-6)}` : "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-muted-foreground text-sm">Rede:</span>
                                    <span className={`text-sm font-medium ${network === "SOLANA" ? "text-[#6F00FF]" : "text-[#6F00FF]"}`}>
                                        {network}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                                    💵
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/70" />
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
                                    className="w-full pl-10 pr-4 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-[#6F00FF]/50 focus:ring-2 focus:ring-[#6F00FF]/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-[#6F00FF]/30 bg-[#6F00FF]/10 text-[#6F00FF] dark:text-[#A78BFA] hover:bg-[#FFB300]/20 hover:border-[#6F00FF]/50 transition"
                                    >
                                        $ {value}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4">
                                <p className="text-muted-foreground text-sm">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {formatBRL(estimatedBrl)}
                                </p>
                            </div>

                            <Button
                                onClick={handleSellCustodial}
                                disabled={numAmount < minAmount || loading}
                                className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processando venda...
                                    </>
                                ) : (
                                    "Vender USDT"
                                )}
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Mínimo: {formatUSDT(minAmount)}
                            </p>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-[#6F00FF]/20 flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
                                    </div>
                                    {conversionStatus === "COMPLETED" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-card rounded-full">
                                            <Check className="w-10 h-10 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-bold text-lg">
                                    {STATUS_LABELS[conversionStatus] || "Processando..."}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Aguarde enquanto processamos sua venda
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
                                                    ? "bg-[#6F00FF]" 
                                                    : isCurrent 
                                                        ? "bg-[#6F00FF] animate-pulse" 
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
                                    <span className="text-muted-foreground">Valor vendido</span>
                                    <span className="text-foreground font-medium">{formatUSDT(numAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor em BRL</span>
                                    <span className="text-white font-medium">
                                        {formatBRL(conversionDetail?.brlAmount || estimatedBrl)}
                                    </span>
                                </div>
                                {txHash && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">TX Hash</span>
                                        <a 
                                            href={network === "TRON" 
                                                ? `https://tronscan.org/#/transaction/${txHash}`
                                                : `https://solscan.io/tx/${txHash}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#6F00FF] dark:text-[#6F00FF] text-xs font-mono hover:underline"
                                        >
                                            {txHash.slice(0, 10)}...{txHash.slice(-6)}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/70 text-sm text-center">
                                    Este processo leva aproximadamente 3-4 minutos. Você pode fechar esta janela.
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
                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-white" />
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
                                    <span className="text-foreground font-medium">{formatUSDT(numAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor em BRL</span>
                                    <span className="text-white font-medium">
                                        {formatBRL(conversionDetail?.brlAmount || estimatedBrl)}
                                    </span>
                                </div>
                                {txHash && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">TX Hash</span>
                                        <a 
                                            href={network === "TRON" 
                                                ? `https://tronscan.org/#/transaction/${txHash}`
                                                : `https://solscan.io/tx/${txHash}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#6F00FF] dark:text-[#6F00FF] text-xs font-mono hover:underline"
                                        >
                                            {txHash.slice(0, 10)}...{txHash.slice(-6)}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white text-sm text-center">
                                    Valor creditado no seu saldo OTSEM!
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold rounded-xl py-6"
                            >
                                Fechar
                            </Button>
                        </div>
                    )}
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}
