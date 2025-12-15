"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2, ArrowLeft } from "lucide-react";
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

export function DepositModal() {
    const { open, closeModal } = useUiModals();
    const [step, setStep] = React.useState<"amount" | "qrcode">("amount");
    const [amount, setAmount] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopiaECola, setPixCopiaECola] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    function formatCurrency(value: string) {
        const numbers = value.replace(/\D/g, "");
        const cents = parseInt(numbers || "0", 10);
        return (cents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.replace(/\D/g, "");
        setAmount(value);
    }

    async function handleGenerateQrCode() {
        const cents = parseInt(amount || "0", 10);
        if (cents < 100) {
            toast.error("Valor mínimo: R$ 1,00");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const valorDecimal = (cents / 100).toFixed(2);
            
            const res = await http.post<CobrancaResponse>("/inter/pix/cobrancas", {
                valor: valorDecimal,
                expiracao: 86400
            });

            const pixCode = res.data.pixCopiaECola;
            setPixCopiaECola(pixCode);

            if (pixCode) {
                const url = await QRCode.toDataURL(pixCode, {
                    width: 220,
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
            const message = err?.response?.data?.message || "Erro ao gerar QR Code PIX";
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
        closeModal("deposit");
        setStep("amount");
        setAmount("");
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

    const displayAmount = formatCurrency(amount);
    const cents = parseInt(amount || "0", 10);

    return (
        <Dialog open={open.deposit} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1a1025] border border-white/10 max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center">
                        {step === "amount" ? "Depositar via PIX" : "QR Code PIX"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        {step === "amount" 
                            ? "Informe o valor do depósito"
                            : "Escaneie o QR Code ou copie o código para depositar"
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    {step === "amount" ? (
                        <>
                            <div className="w-full space-y-4">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-white mb-2">
                                        {displayAmount}
                                    </p>
                                    <p className="text-white/40 text-sm">
                                        Digite o valor do depósito
                                    </p>
                                </div>

                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0"
                                    className="text-center text-2xl bg-white/5 border-white/10 text-white h-14 rounded-xl"
                                    autoFocus
                                />

                                <Button
                                    onClick={handleGenerateQrCode}
                                    disabled={cents < 100 || loading}
                                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        "Gerar QR Code"
                                    )}
                                </Button>

                                <p className="text-white/40 text-xs text-center">
                                    Valor mínimo: R$ 1,00
                                </p>
                            </div>
                        </>
                    ) : loading ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                            <p className="text-white/60 text-sm mt-4">Gerando QR Code...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-8">
                            <QrCode className="h-16 w-16 text-white/20" />
                            <p className="text-white/60 text-sm mt-4 text-center">{error}</p>
                            <Button
                                onClick={handleBack}
                                variant="outline"
                                className="mt-4 border-white/20 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="sm"
                                className="absolute left-4 top-4 text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            <div className="text-center">
                                <p className="text-white/60 text-sm">Valor do depósito</p>
                                <p className="text-2xl font-bold text-white">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code PIX"
                                        className="w-52 h-52"
                                    />
                                ) : (
                                    <div className="w-52 h-52 flex items-center justify-center">
                                        <QrCode className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full space-y-3">
                                <p className="text-white/60 text-sm text-center">
                                    Escaneie o QR Code ou copie o código abaixo
                                </p>

                                {pixCopiaECola && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                        <p className="text-white/40 text-xs mb-1">PIX Copia e Cola</p>
                                        <p className="text-white text-xs font-mono break-all line-clamp-3">
                                            {pixCopiaECola}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleCopy}
                                    disabled={!pixCopiaECola}
                                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6"
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

                                <p className="text-white/40 text-xs text-center">
                                    Este QR Code expira em 24 horas.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
