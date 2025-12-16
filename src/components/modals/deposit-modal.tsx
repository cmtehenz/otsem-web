"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";

type CobrancaResponse = {
    txid: string;
    calendario: {
        criacao: string;
        expiracao: number;
    };
    devedor?: {
        cpf?: string;
        cnpj?: string;
        nome?: string;
    };
    valor: {
        original: string;
    };
    chave: string;
    solicitacaoPagador?: string;
    pixCopiaECola: string;
    loc?: {
        id: number;
        location: string;
        tipoCob: string;
    };
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function DepositModal() {
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
        if (cents < 100) {
            toast.error("Valor mínimo: R$ 1,00");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const valorDecimal = Number((cents / 100).toFixed(2));
            
            const res = await http.post<CobrancaResponse>("/inter/pix/cobrancas", {
                valor: valorDecimal,
                expiracao: 86400
            });

            const pixCode = res.data.pixCopiaECola;
            setPixCopiaECola(pixCode);

            if (pixCode) {
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
            <DialogContent className="bg-[#0a0118] border border-violet-500/20 max-w-sm shadow-2xl shadow-violet-500/10">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center flex items-center justify-center gap-2">
                        {step === "qrcode" && (
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-4 text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {step === "amount" ? "Depositar via PIX" : "Pague com PIX"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        {step === "amount" 
                            ? "Escolha ou digite o valor do depósito"
                            : "Escaneie o QR Code ou copie o código"
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "amount" ? (
                        <div className="w-full space-y-5">
                            <div className="text-center py-4 bg-gradient-to-b from-violet-500/10 to-transparent rounded-2xl">
                                <p className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl">
                                    R$
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="0,00"
                                    className="w-full pl-12 pr-4 text-center text-xl bg-white/5 border border-white/10 text-white h-14 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none placeholder:text-white/30"
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {QUICK_AMOUNTS.map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleQuickAmount(value)}
                                        className="px-4 py-2 text-sm font-medium rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 hover:text-violet-200 transition-colors"
                                    >
                                        R$ {value}
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleGenerateQrCode}
                                disabled={cents < 100 || loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-violet-500/25"
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

                            <p className="text-white/40 text-xs text-center">
                                Valor mínimo: R$ 1,00
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
                                <Loader2 className="h-12 w-12 animate-spin text-violet-400 relative" />
                            </div>
                            <p className="text-white/60 text-sm mt-6">Gerando QR Code...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-8">
                            <div className="bg-red-500/10 rounded-full p-4 mb-4">
                                <QrCode className="h-12 w-12 text-red-400/60" />
                            </div>
                            <p className="text-white/60 text-sm text-center mb-4">{error}</p>
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Tentar novamente
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="text-white/50 text-sm">Valor do depósito</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-violet-500/20">
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
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                        <p className="text-white/40 text-xs mb-1">PIX Copia e Cola</p>
                                        <p className="text-white/80 text-xs font-mono break-all line-clamp-2">
                                            {pixCopiaECola}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCopy}
                                    disabled={!pixCopiaECola}
                                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 shadow-lg shadow-violet-500/25"
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

                                <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
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
