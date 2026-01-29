"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";
import { useAuth } from "@/contexts/auth-context";

type CobrancaResponse = {
    qrCode: string;
    qrCodeImage: string;
    expiresAt: string;
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function DepositModal() {
    const { user } = useAuth();
    const { open, closeModal, triggerRefresh } = useUiModals();
    const [step, setStep] = React.useState<"amount" | "qrcode">("amount");
    const [cents, setCents] = React.useState(0);
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopiaECola, setPixCopiaECola] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

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

    function handleQuickAmount(reais: number) {
        setCents(reais * 100);
    }

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
            
            const res = await http.post<CobrancaResponse>("/pix/transactions/qr/static", {
                accountHolderId: customerId,
                amount: valorDecimal,
                description: `Depósito via PIX - ${formatCurrency(cents)}`
            });

            const pixCode = res.data.qrCode;
            setPixCopiaECola(pixCode);

            if (res.data.qrCodeImage) {
                setQrCodeUrl(res.data.qrCodeImage);
            } else if (pixCode) {
                const url = await QRCode.toDataURL(pixCode, {
                    width: 240,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                });
                setQrCodeUrl(url);
            }

            setStep("qrcode");
        } catch (err: any) {
            console.error("Error generating PIX:", err);
            const message = err?.response?.data?.message || err?.response?.data?.error || "Erro ao gerar QR Code PIX. Tente novamente.";
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
        } catch (err) {
            toast.error("Erro ao copiar");
        }
    }

    function handleClose() {
        if (step === "qrcode" && pixCopiaECola) {
            triggerRefresh();
        }
        closeModal("deposit");
        setStep("amount");
        setCents(0);
        setQrCodeUrl(null);
        setPixCopiaECola(null);
        setCopied(false);
        setError(null);
    }

    function handleBack() {
        setStep("amount");
        setQrCodeUrl(null);
        setPixCopiaECola(null);
        setError(null);
    }

    const displayAmount = formatCurrency(cents);
    const inputValue = formatDisplayValue(cents);

    return (
        <Dialog open={open.deposit} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-[#6F00FF]/50/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center flex items-center justify-center gap-2">
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
                        {step === "amount" ? "Depositar via PIX" : "Pague com PIX"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "amount" 
                            ? "Escolha ou digite o valor do depósito"
                            : "Escaneie o QR Code ou copie o código"
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "amount" ? (
                        <div className="w-full space-y-5">
                            <div className="text-center py-4 bg-gradient-to-b from-[#6F00FF]/50/10 to-transparent rounded-2xl">
                                <p className="text-5xl font-bold bg-gradient-to-r from-[#6F00FF]/50 to-[#6F00FF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
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
                                    className="w-full pl-12 pr-4 text-center text-xl bg-muted border border-border text-foreground h-14 rounded-xl focus:border-[#6F00FF]/50/50 focus:ring-2 focus:ring-[#6F00FF]/50/20 focus:outline-none placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-[#6F00FF]/50/30 bg-[#6F00FF]/50/10 text-[#6F00FF] dark:text-[#6F00FF]/30 hover:bg-[#6F00FF]/50/20 hover:border-[#6F00FF]/50/50 transition-colors"
                                    >
                                        R$ {value}
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleGenerateQrCode}
                                disabled={cents < 100 || loading}
                                className="w-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-[#6F00FF]/50/25"
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
                    ) : loading ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#6F00FF]/50/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 className="h-12 w-12 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF] relative" />
                            </div>
                            <p className="text-muted-foreground text-sm mt-6">Gerando QR Code...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="bg-red-500/10 rounded-full p-4 mb-4">
                                <QrCode className="h-12 w-12 text-red-400/60" />
                            </div>
                            <p className="text-muted-foreground text-sm text-center mb-4">{error}</p>
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#6F00FF]/50/30 bg-[#6F00FF]/50/10 text-[#6F00FF] dark:text-[#6F00FF]/30 hover:bg-[#6F00FF]/50/20 hover:border-[#6F00FF]/50/50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Tentar novamente
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm">Valor do depósito</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-[#6F00FF]/50 to-[#6F00FF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-[#6F00FF]/50/20">
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
                                    className="w-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#6F00FF]/50/25"
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
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
