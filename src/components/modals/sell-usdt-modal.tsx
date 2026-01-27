"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, TrendingDown, Wallet, Key, AlertTriangle, Check, Shield } from "lucide-react";
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

type TxDataResponse = {
    network: Network;
    fromAddress: string;
    toAddress: string;
    usdtAmount: number;
    usdtAmountRaw: number;
    contractAddress?: string;
    tokenMint?: string;
    tokenProgram?: string;
    decimals: number;
    fromAta?: string;
    toAta?: string;
    toAtaExists?: boolean;
    associatedTokenProgram?: string;
    quote: {
        brlToReceive: number;
        exchangeRate: number;
        spreadPercent: number;
    };
};

type SubmitResponse = {
    conversionId: string;
    status: string;
    message: string;
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
    const { rate: usdtRate, loading: rateLoading } = useUsdtRate();
    const [step, setStep] = React.useState<"wallet" | "amount" | "sign" | "processing" | "success">("wallet");
    const [amount, setAmount] = React.useState("");
    const [network, setNetwork] = React.useState<Network>("SOLANA");
    const [loading, setLoading] = React.useState(false);
    const [wallets, setWallets] = React.useState<WalletItem[]>([]);
    const [selectedWallet, setSelectedWallet] = React.useState<WalletItem | null>(null);
    const [privateKey, setPrivateKey] = React.useState("");
    const [txData, setTxData] = React.useState<TxDataResponse | null>(null);
    const [txHash, setTxHash] = React.useState<string | null>(null);
    const [walletsLoading, setWalletsLoading] = React.useState(false);
    const [signingStatus, setSigningStatus] = React.useState<string>("");
    const [conversionId, setConversionId] = React.useState<string | null>(null);
    const [conversionStatus, setConversionStatus] = React.useState<ConversionStatus>("PENDING");
    const [conversionDetail, setConversionDetail] = React.useState<ConversionDetail | null>(null);
    const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

    const numAmount = parseFloat(amount) || 0;
    const minAmount = 5;
    const estimatedBrl = usdtRate ? numAmount * usdtRate * 0.99 : 0;

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

    async function handleContinueToSign() {
        if (numAmount < minAmount) {
            toast.error(`Valor mínimo: ${formatUSDT(minAmount)}`);
            return;
        }
        setLoading(true);
        try {
            // Usa endpoint gasless que envia SOL/TRX automaticamente para taxas de gas
            const res = await http.get<TxDataResponse>("/wallet/gasless-sell-tx-data", {
                params: { 
                    walletId: selectedWallet?.id,
                    usdtAmount: numAmount, 
                    network 
                }
            });
            setTxData(res.data);
            setStep("sign");
        } catch (err) {
            console.error("Erro ao buscar dados da transação:", err);
            if (isAxiosError(err) && err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Erro ao preparar transação. Tente novamente.");
            }
            setStep("amount");
        } finally {
            setLoading(false);
        }
    }

    async function signAndSubmitTron(pk: string, data: TxDataResponse): Promise<string> {
        setSigningStatus("Inicializando TronWeb...");
        const TronWebModule = await import("tronweb");
        const TronWeb = TronWebModule.TronWeb || TronWebModule.default;
        
        const cleanPk = pk.startsWith("0x") ? pk.slice(2) : pk;
        const tronWeb = new TronWeb({
            fullHost: "https://api.trongrid.io",
            privateKey: cleanPk,
        });

        setSigningStatus("Construindo transação TRC20...");
        const contract = await tronWeb.contract().at(data.contractAddress!);
        
        setSigningStatus("Assinando e enviando...");
        const tx = await contract.methods
            .transfer(data.toAddress, data.usdtAmountRaw)
            .send();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = tx as any;
        return typeof result === "string" ? result : result.txid || result.transaction?.txID || "";
    }

    async function signAndSubmitSolana(pk: string, data: TxDataResponse): Promise<string> {
        setSigningStatus("Inicializando Solana...");
        const { 
            Connection, 
            Keypair, 
            PublicKey, 
            Transaction 
        } = await import("@solana/web3.js");
        const { 
            createTransferInstruction,
            createAssociatedTokenAccountInstruction,
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID
        } = await import("@solana/spl-token");

        const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/VorawLbwMvjW5ukY0rnl9", "confirmed");
        
        let secretKey: Uint8Array;
        const trimmedPk = pk.trim();
        
        if (trimmedPk.includes(",") || trimmedPk.startsWith("[")) {
            secretKey = new Uint8Array(JSON.parse(trimmedPk));
        } else if (/^[0-9a-fA-F]+$/.test(trimmedPk) && trimmedPk.length >= 64) {
            const bytes = [];
            for (let i = 0; i < trimmedPk.length; i += 2) {
                bytes.push(parseInt(trimmedPk.substring(i, i + 2), 16));
            }
            secretKey = new Uint8Array(bytes);
        } else {
            const bs58 = (await import("bs58")).default;
            secretKey = bs58.decode(trimmedPk);
        }
        const keypair = Keypair.fromSecretKey(secretKey);

        setSigningStatus("Preparando contas de token...");
        const USDT_MINT = new PublicKey(data.tokenMint!);
        const fromPubkey = new PublicKey(data.fromAddress);
        const toPubkey = new PublicKey(data.toAddress);

        const fromAta = new PublicKey(data.fromAta!);
        const toAta = new PublicKey(data.toAta!);

        setSigningStatus("Construindo transação SPL...");
        const transaction = new Transaction();

        if (data.toAtaExists === false) {
            setSigningStatus("Criando conta de token destino...");
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    keypair.publicKey,
                    toAta,
                    toPubkey,
                    USDT_MINT,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                )
            );
        }

        transaction.add(
            createTransferInstruction(
                fromAta,
                toAta,
                fromPubkey,
                BigInt(data.usdtAmountRaw)
            )
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;

        setSigningStatus("Assinando e enviando...");
        transaction.sign(keypair);
        const signature = await connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: "confirmed",
        });
        
        return signature;
    }

    async function handleSignAndSubmit() {
        if (!txData || !privateKey.trim() || !selectedWallet) {
            toast.error("Dados incompletos");
            return;
        }
        
        const tokenAddress = txData.network === "TRON" ? txData.contractAddress : txData.tokenMint;
        if (!tokenAddress || !txData.fromAddress || !txData.toAddress) {
            toast.error("Dados da transação inválidos. Volte e tente novamente.");
            setStep("amount");
            return;
        }

        setLoading(true);
        try {
            let hash: string;
            
            if (network === "TRON") {
                hash = await signAndSubmitTron(privateKey.trim(), txData);
            } else {
                hash = await signAndSubmitSolana(privateKey.trim(), txData);
            }

            setSigningStatus("Registrando venda...");
            const res = await http.post<SubmitResponse>("/wallet/submit-signed-sell", {
                walletId: selectedWallet.id,
                usdtAmount: numAmount,
                network,
                txHash: hash,
            });

            setTxHash(hash);
            setConversionId(res.data.conversionId);
            setConversionStatus("PENDING");
            setStep("processing");
            toast.success("Transação enviada! Acompanhe o progresso.");
            startPolling(res.data.conversionId);
        } catch (err: unknown) {
            console.error("Erro na transação:", err);
            const message = isAxiosError(err) 
                ? err.response?.data?.message 
                : err instanceof Error 
                    ? err.message 
                    : "Erro ao processar transação";
            toast.error(message);
        } finally {
            setLoading(false);
            setSigningStatus("");
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
            setTxData(null);
            setSelectedWallet(null);
            setTxHash(null);
            setPrivateKey("");
            setNetwork("SOLANA");
            setSigningStatus("");
            setConversionId(null);
            setConversionStatus("PENDING");
            setConversionDetail(null);
        }, 200);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("wallet");
        } else if (step === "sign") {
            setStep("amount");
            setPrivateKey("");
        }
    }

    const filteredWallets = wallets.filter(w => w.network === network);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-orange-500/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center">
                        {step === "wallet" && "Vender USDT"}
                        {step === "amount" && "Valor da Venda"}
                        {step === "sign" && "Assinar Transação"}
                        {step === "processing" && "Processando Venda"}
                        {step === "success" && "Venda Concluída!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "wallet" && "Escolha a rede e a carteira de origem"}
                        {step === "amount" && "Informe quanto USDT deseja vender"}
                        {step === "sign" && "Revise e assine a transação"}
                        {step === "processing" && "Acompanhe o progresso da sua venda"}
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
                                                ? "border-[#6F00FF] bg-[#6F00FF]/20 text-[#6F00FF] dark:text-[#8B2FFF]"
                                                : "border-border bg-muted text-muted-foreground hover:border-[#6F00FF]/30"
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
                                                <div className="flex items-center justify-between">
                                                    <p className="text-foreground font-medium text-sm">
                                                        {wallet.label || "Carteira"}
                                                    </p>
                                                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">
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
                                        {selectedWallet?.externalAddress ? `${selectedWallet.externalAddress.slice(0, 8)}...${selectedWallet.externalAddress.slice(-6)}` : "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-muted-foreground text-sm">Rede:</span>
                                    <span className={`text-sm font-medium ${network === "SOLANA" ? "text-[#6F00FF]" : "text-red-600"}`}>
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

                            <Button
                                onClick={handleContinueToSign}
                                disabled={numAmount < minAmount || loading}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Preparando...
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

                    {step === "sign" && txData && (
                        <div className="w-full space-y-5">
                            <button
                                onClick={handleBack}
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                            >
                                ← Voltar
                            </button>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <p className="text-green-600 dark:text-green-400 text-xs">
                                    Sua chave privada é processada localmente e nunca é enviada ao servidor
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                            💵
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Você envia</p>
                                            <p className="text-foreground font-bold">{formatUSDT(txData.usdtAmount)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-orange-500" />
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs text-right">Você recebe</p>
                                            <p className="text-green-600 dark:text-green-400 font-bold">
                                                {formatBRL(txData.quote.brlToReceive)}
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
                                            1 USDT = {formatBRL(txData.quote.exchangeRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rede</span>
                                        <span className={network === "SOLANA" ? "text-[#6F00FF]" : "text-red-600"}>
                                            {network}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">De</span>
                                        <span className="text-foreground text-xs font-mono">
                                            {txData.fromAddress ? `${txData.fromAddress.slice(0, 6)}...${txData.fromAddress.slice(-4)}` : "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Para (OKX)</span>
                                        <span className="text-foreground text-xs font-mono">
                                            {txData.toAddress ? `${txData.toAddress.slice(0, 6)}...${txData.toAddress.slice(-4)}` : "-"}
                                        </span>
                                    </div>
                                </div>
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
                                    disabled={loading}
                                />
                            </div>

                            {signingStatus && (
                                <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" />
                                    <p className="text-muted-foreground text-sm">{signingStatus}</p>
                                </div>
                            )}

                            <Button
                                onClick={handleSignAndSubmit}
                                disabled={!privateKey.trim() || loading}
                                className="w-full bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {signingStatus || "Processando..."}
                                    </>
                                ) : (
                                    <>
                                        <Key className="w-4 h-4 mr-2" />
                                        Assinar e Enviar
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
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
                                                    ? "bg-green-500" 
                                                    : isCurrent 
                                                        ? "bg-orange-500 animate-pulse" 
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
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {formatBRL(conversionDetail?.brlAmount || txData?.quote.brlToReceive || 0)}
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

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
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
                                    <span className="text-foreground font-medium">{formatUSDT(numAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor em BRL</span>
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        {formatBRL(conversionDetail?.brlAmount || txData?.quote.brlToReceive || 0)}
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

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <p className="text-green-600 dark:text-green-400 text-sm text-center">
                                    Valor creditado no seu saldo OTSEM!
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
