"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiModals } from "@/stores/ui-modals";
import { useAuth } from "@/contexts/auth-context";
import { Copy, Check, QrCode, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";

type DepositResponse = {
    qrCode: string;
    copyPaste: string;
    transactionId?: string;
    expiresAt?: string;
};

type Step = "amount" | "qrcode";

export function DepositModal() {
    const { open, closeModal } = useUiModals();
    const { user } = useAuth();
    const [step, setStep] = React.useState<Step>("amount");
    const [amount, setAmount] = React.useState<string>("100");
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopyPaste, setPixCopyPaste] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    const minAmount = 10;

    function resetModal() {
        setStep("amount");
        setAmount("100");
        setQrCodeUrl(null);
        setPixCopyPaste(null);
        setCopied(false);
    }

    async function handleGenerateQrCode(e: React.FormEvent) {
        e.preventDefault();
        
        const value = parseFloat(amount.replace(",", "."));
        if (isNaN(value) || value < minAmount) {
            toast.error(`Valor mínimo é R$ ${minAmount},00`);
            return;
        }

        setLoading(true);
        try {
            const res = await http.post<DepositResponse>("/fdbank/pix-transfer", {
                amount: value,
                customerId: user?.customerId,
            });

            const { qrCode, copyPaste } = res.data;
            setPixCopyPaste(copyPaste || qrCode);

            if (qrCode) {
                const url = await QRCode.toDataURL(qrCode, {
                    width: 200,
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
            const message = err?.response?.data?.message || "Erro ao gerar QR code PIX";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCopy() {
        if (!pixCopyPaste) return;
        
        try {
            await navigator.clipboard.writeText(pixCopyPaste);
            setCopied(true);
            toast.success("Código PIX copiado!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Erro ao copiar");
        }
    }

    function handleClose() {
        closeModal("deposit");
        setTimeout(resetModal, 300);
    }

    function formatCurrency(value: string): string {
        const num = parseFloat(value.replace(",", "."));
        if (isNaN(num)) return "R$ 0,00";
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    return (
        <Dialog open={open.deposit} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1a1025] border border-white/10 max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center flex items-center justify-center gap-2">
                        {step === "qrcode" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setStep("amount")}
                                className="absolute left-4 top-4 text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        Depositar via PIX
                    </DialogTitle>
                </DialogHeader>

                {step === "amount" && (
                    <form onSubmit={handleGenerateQrCode} className="space-y-6 py-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/70">
                                Valor do depósito
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                                    R$
                                </span>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-12 border-white/10 bg-white/5 text-white text-lg font-semibold rounded-xl h-14"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                            <p className="text-white/40 text-xs mt-2">
                                Valor mínimo: R$ {minAmount},00
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <QrCode className="w-5 h-5 mr-2" />
                                    Gerar QR Code
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {step === "qrcode" && (
                    <div className="flex flex-col items-center space-y-6 py-4">
                        <div className="text-center mb-2">
                            <p className="text-white/60 text-sm">Valor do depósito</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(amount)}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code PIX"
                                    className="w-48 h-48"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <QrCode className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-3">
                            <p className="text-white/60 text-sm text-center">
                                Escaneie o QR Code ou copie o código abaixo
                            </p>
                            
                            {pixCopyPaste && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-white/40 text-xs mb-1">PIX Copia e Cola</p>
                                    <p className="text-white text-xs font-mono break-all line-clamp-3">
                                        {pixCopyPaste}
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleCopy}
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
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
