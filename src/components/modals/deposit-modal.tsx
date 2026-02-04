"use client";

import * as React from "react";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetDescription } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { pixPost, pixGet } from "@/lib/pix";
import QRCode from "qrcode";
import { useAuth } from "@/contexts/auth-context";

// Response from POST /pix/cobrancas (expanded to capture IDs for polling)
type PixCobrancaResponse = {
    pixCopiaECola: string;
    txId?: string;
    id?: string;
    cobrancaId?: string;
    locationId?: string;
    status?: string;
};

// Response from GET /pix/cobrancas/{txId}
type PixCobrancaStatus = {
    status: string;
    txId?: string;
    [key: string]: unknown;
};

type DepositStatus = "WAITING" | "RECEIVED" | "CONFIRMED";

const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
    WAITING: "Aguardando pagamento PIX...",
    RECEIVED: "Pagamento detectado!",
    CONFIRMED: "Depósito confirmado!",
};

const DEPOSIT_STATUS_ORDER: DepositStatus[] = ["WAITING", "RECEIVED", "CONFIRMED"];


export function DepositModal() {
    const { user } = useAuth();
    const { open, closeModal, triggerRefresh, triggerDepositBoost } = useUiModals();
    const [step, setStep] = React.useState<"amount" | "qrcode" | "processing" | "success">("amount");
    const [cents, setCents] = React.useState(0);
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopiaECola, setPixCopiaECola] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Polling state
    const [cobrancaTxId, setCobrancaTxId] = React.useState<string | null>(null);
    const [depositStatus, setDepositStatus] = React.useState<DepositStatus>("WAITING");
    const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

    // Cleanup polling on unmount
    React.useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    function formatDisplayValue(centValue: number): string {
        if (centValue === 0) return "";
        return (centValue / 100).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function formatCurrency(centValue: number): string {
        return (centValue / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const rawValue = e.target.value.replace(/\D/g, "");
        const newCents = parseInt(rawValue || "0", 10);
        setCents(newCents);
    }

    // ── Polling logic ────────────────────────────────────────

    async function pollCobrancaStatus(txId: string) {
        try {
            const res = await pixGet<PixCobrancaStatus>(`cobrancas/${txId}`);
            const status = (res.data.status || "").toUpperCase();

            if (status === "CONCLUIDA" || status === "COMPLETED") {
                // PIX payment received by the bank
                setDepositStatus("RECEIVED");

                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }

                setStep("processing");

                // Brief delay then confirm
                setTimeout(() => {
                    setDepositStatus("CONFIRMED");
                    setTimeout(() => {
                        setStep("success");
                        triggerRefresh();
                        triggerDepositBoost();
                    }, 1500);
                }, 1500);
            }
        } catch {
            // Transient errors — keep polling
        }
    }

    function startPolling(txId: string) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollCobrancaStatus(txId);
        pollingRef.current = setInterval(() => pollCobrancaStatus(txId), 5000);
    }

    function stopPolling() {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }

    // ── Handlers ─────────────────────────────────────────────

    async function handleGenerateQrCode() {
        const customerId = user?.customerId;
        if (!customerId) {
            toast.error("Erro ao identificar usuário");
            return;
        }

        if (cents < 100) {
            toast.error("Valor mínimo: R$ 1,00");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const valorDecimal = Number((cents / 100).toFixed(2));

            const res = await pixPost<PixCobrancaResponse>("cobrancas", {
                customerId: customerId,
                valor: valorDecimal,
                descricao: `Depósito via PIX - ${formatCurrency(cents)}`,
                expiracao: 86400,
            });

            const data = res.data;
            const pixCode = data.pixCopiaECola;
            setPixCopiaECola(pixCode);

            // Capture any ID for polling
            const txId = data.txId || data.id || data.cobrancaId || data.locationId || null;
            setCobrancaTxId(txId);

            if (pixCode) {
                const url = await QRCode.toDataURL(pixCode, {
                    width: 240,
                    margin: 2,
                    color: { dark: "#000000", light: "#ffffff" },
                });
                setQrCodeUrl(url);
            }

            setStep("qrcode");

            // Start polling if we have an ID
            if (txId) {
                startPolling(txId);
            }
        } catch (err: unknown) {
            console.error("Error generating PIX:", err);
            const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
            const message = axiosErr?.response?.data?.message || axiosErr?.response?.data?.error || "Erro ao gerar QR Code PIX. Tente novamente.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        if (!pixCopiaECola) return;

        try {
            await navigator.clipboard.writeText(pixCopiaECola);
            setCopied(true);
            toast.success("Código PIX copiado!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Erro ao copiar");
        }
    }

    function handleClose() {
        stopPolling();

        // Trigger refresh if user was past the amount step
        if (step !== "amount") {
            triggerRefresh();
            triggerDepositBoost();
        }

        closeModal("deposit");
        setStep("amount");
        setCents(0);
        setQrCodeUrl(null);
        setPixCopiaECola(null);
        setCopied(false);
        setError(null);
        setCobrancaTxId(null);
        setDepositStatus("WAITING");
    }

    function handleBack() {
        stopPolling();
        setStep("amount");
        setQrCodeUrl(null);
        setPixCopiaECola(null);
        setError(null);
        setCobrancaTxId(null);
        setDepositStatus("WAITING");
    }

    const displayAmount = formatCurrency(cents);
    const inputValue = formatDisplayValue(cents);

    // ── Header text ──────────────────────────────────────────
    const titles: Record<typeof step, string> = {
        amount: "Depositar via PIX",
        qrcode: "Pague com PIX",
        processing: "Processando Depósito",
        success: "Depósito Confirmado!",
    };

    const descriptions: Record<typeof step, string> = {
        amount: "Escolha ou digite o valor do depósito",
        qrcode: "Escaneie o QR Code ou copie o código",
        processing: "Acompanhe o progresso do seu depósito",
        success: "Seu depósito foi processado",
    };

    return (
        <BottomSheet open={open.deposit} onOpenChange={handleClose}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle className="text-foreground text-xl text-center flex items-center justify-center gap-2">
                        {step === "qrcode" && (
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {titles[step]}
                    </BottomSheetTitle>
                    <BottomSheetDescription className="text-muted-foreground text-center text-sm">
                        {descriptions[step]}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {/* ── Amount Step ── */}
                    {step === "amount" ? (
                        <div className="w-full space-y-5">
                            <div className="text-center py-4 bg-gradient-to-b from-[#6F00FF]/10 to-transparent rounded-2xl">
                                <p className="text-5xl font-bold bg-gradient-to-r from-[#6F00FF] to-[#8B2FFF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
                                    R$
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="0,00"
                                    className="w-full pl-12 pr-4 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-[#6F00FF]/50 focus:ring-2 focus:ring-[#6F00FF]/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus={false}
                                />
                            </div>

                            <Button
                                onClick={handleGenerateQrCode}
                                disabled={cents < 100 || loading}
                                className="w-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#5800CC] hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-[#6F00FF]/25"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Gerando QR Code...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-5 h-5 mr-2" />
                                        Gerar QR Code
                                    </>
                                )}
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Valor mínimo: R$ 1,00
                            </p>
                        </div>

                    /* ── Loading ── */
                    ) : step === "qrcode" && loading ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#6F00FF]/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 className="h-12 w-12 animate-spin text-[#6F00FF] dark:text-[#6F00FF] relative" />
                            </div>
                            <p className="text-muted-foreground text-sm mt-6">Gerando QR Code...</p>
                        </div>

                    /* ── Error ── */
                    ) : step === "qrcode" && error ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="bg-white/10 rounded-full p-4 mb-4">
                                <QrCode className="h-12 w-12 text-white/40" />
                            </div>
                            <p className="text-muted-foreground text-sm text-center mb-4">{error}</p>
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#6F00FF]/30 bg-[#6F00FF]/10 text-[#6F00FF] dark:text-[#A78BFA] hover:bg-[#6F00FF]/20 hover:border-[#6F00FF]/50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Tentar novamente
                            </button>
                        </div>

                    /* ── QR Code Step ── */
                    ) : step === "qrcode" ? (
                        <>
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">Valor do depósito</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-[#6F00FF] to-[#8B2FFF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-[#6F00FF]/20">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code PIX"
                                        className="w-56 h-56"
                                    />
                                ) : (
                                    <div className="w-56 h-56 flex items-center justify-center">
                                        <QrCode className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full space-y-3">
                                {pixCopiaECola && (
                                    <div className="bg-muted border border-border rounded-xl p-3">
                                        <p className="text-muted-foreground text-xs mb-1">PIX Copia e Cola</p>
                                        <p className="text-foreground/80 text-xs font-mono break-all line-clamp-2">
                                            {pixCopiaECola}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCopy}
                                    disabled={!pixCopiaECola}
                                    className="w-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#5800CC] hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#6F00FF]/25"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5 mr-2" />
                                            Copiar Código PIX
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Expira em 24 horas</span>
                                </div>

                                {cobrancaTxId && (
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Aguardando pagamento...</span>
                                    </div>
                                )}
                            </div>
                        </>

                    /* ── Processing Step ── */
                    ) : step === "processing" ? (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full border-4 border-[#6F00FF]/20 flex items-center justify-center">
                                    {depositStatus === "CONFIRMED" ? (
                                        <Check className="w-10 h-10 text-white" />
                                    ) : (
                                        <Loader2 className="w-10 h-10 text-[#6F00FF] animate-spin" />
                                    )}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-bold text-lg">
                                    {DEPOSIT_STATUS_LABELS[depositStatus]}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Aguarde enquanto confirmamos seu depósito
                                </p>
                            </div>

                            {/* Progress steps */}
                            <div className="bg-muted border border-border rounded-xl p-4 space-y-4">
                                {DEPOSIT_STATUS_ORDER.map((status, idx) => {
                                    const currentIdx = DEPOSIT_STATUS_ORDER.indexOf(depositStatus);
                                    const isCompleted = idx < currentIdx || depositStatus === "CONFIRMED";
                                    const isCurrent = status === depositStatus && depositStatus !== "CONFIRMED";

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
                                                {DEPOSIT_STATUS_LABELS[status]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Amount info */}
                            <div className="bg-muted border border-border rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Valor do depósito</span>
                                    <span className="text-foreground font-medium">{displayAmount}</span>
                                </div>
                            </div>

                            <div className="bg-[#6F00FF]/10 border border-[#6F00FF]/30 rounded-xl p-4">
                                <p className="text-[#6F00FF] dark:text-[#A78BFA] text-sm text-center">
                                    Você pode fechar esta janela. Seu saldo será atualizado automaticamente.
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

                    /* ── Success Step ── */
                    ) : step === "success" ? (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-muted-foreground text-sm mb-1">Depósito confirmado</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-[#6F00FF] to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Seu saldo foi atualizado
                                </p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#5800CC] hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#6F00FF]/25"
                            >
                                Fechar
                            </Button>
                        </div>
                    ) : null}
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}
