"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Copy, Check, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";


type PixCobrancaResponse = {
    pixCopiaECola: string;
    location: string;
    status: string;
    valor: { original: string };
    calendario: { expiracao: number; criacao: string };
    txid: string;
    revisao: number;
    chave: string;
    solicitacaoPagador: string;
    infoAdicionais: any[];
};

type AccountSummary = {
    id: string;
    pixKey: string;
    pixKeyType: string;
};

export function DepositModal() {
    const { open, closeModal } = useUiModals();
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixCopiaECola, setPixCopiaECola] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function createPixCobranca() {
            if (!open.deposit || !user?.customerId) return;

            setLoading(true);
            setError(null);

            try {

                // Parâmetros fixos, pode ser customizado depois
                const body = {
                    valor: 10.0,
                    expiracao: 3600,
                    descricao: "Pagamento de teste"
                };
                const res = await http.post<PixCobrancaResponse>(
                    "/inter/pix/cobrancas",
                    body
                );
                const copiaCola = res.data.pixCopiaECola;
                setPixCopiaECola(copiaCola);
                if (copiaCola) {
                    const url = await QRCode.toDataURL(copiaCola, {
                        width: 200,
                        margin: 2,
                        color: {
                            dark: "#000000",
                            light: "#ffffff",
                        },
                    });
                    setQrCodeUrl(url);
                }

            } catch (err) {
                console.error("Error criando cobrança PIX:", err);
                toast.error("Erro ao criar cobrança PIX");
            } finally {
                setLoading(false);
            }
        }
        createPixCobranca();
    }, [open.deposit, user?.customerId]);

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

                    ) : pixCopiaECola ? (
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

                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-white/40 text-xs mb-1">PIX Copia e Cola</p>
                                    <p className="text-white text-sm font-mono break-all">
                                        {pixCopiaECola}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCopy}
                                    className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5 mr-2" />

                                            Copiar código PIX
                                        </>
                                    )}
                                </Button>

                                <p className="text-white/40 text-xs text-center">
                                    Este QR Code não expira e pode receber múltiplos pagamentos
                                </p>
                            </div>
                        </>

                    ) : (
                        <div className="text-center py-8">
                            <QrCode className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">
                                Nenhum código PIX disponível
                            </p>
                            <p className="text-white/40 text-sm mt-2">
                                Tente novamente ou contate o suporte
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
