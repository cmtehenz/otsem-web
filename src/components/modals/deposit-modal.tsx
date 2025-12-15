"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";

type QrCodeEstaticoResponse = {
    chave: string;
    valor: number | null;
    valorAberto: boolean;
    descricao: string;
    pixCopiaECola: string;
    expiracao: null;
    message: string;
};

export function DepositModal() {
    const { open, closeModal } = useUiModals();
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopiaECola, setPixCopiaECola] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function generateQrCode() {
            if (!open.deposit) return;

            setLoading(true);
            setError(null);

            try {
                const res = await http.post<QrCodeEstaticoResponse>("/inter/pix/qrcode-estatico", {
                    expiracao: 31536000
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
            } catch (err: any) {
                console.error("Error generating PIX:", err);
                const message = err?.response?.data?.message || "Erro ao gerar QR Code PIX";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        }

        generateQrCode();
    }, [open.deposit]);

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
        setQrCodeUrl(null);
        setPixCopiaECola(null);
        setCopied(false);
        setError(null);
    }

    return (
        <Dialog open={open.deposit} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1a1025] border border-white/10 max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center">
                        Depositar via PIX
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        Escaneie o QR Code ou copie o código para depositar
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                            <p className="text-white/60 text-sm mt-4">Gerando QR Code...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center py-8">
                            <QrCode className="h-16 w-16 text-white/20" />
                            <p className="text-white/60 text-sm mt-4 text-center">{error}</p>
                            <Button
                                onClick={() => {
                                    handleClose();
                                    setTimeout(() => useUiModals.getState().openModal("deposit"), 300);
                                }}
                                variant="outline"
                                className="mt-4 border-white/20 text-white hover:bg-white/10"
                            >
                                Tentar novamente
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <p className="text-white/60 text-sm">Valor aberto</p>
                                <p className="text-lg font-medium text-white/80">
                                    O pagador escolhe o valor
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
                                    Válido por 1 ano. Pode receber múltiplos pagamentos.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
