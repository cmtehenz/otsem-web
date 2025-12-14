"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { useAuth } from "@/contexts/auth-context";
import { Copy, Check, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import QRCode from "qrcode";

type AccountSummary = {
    id: string;
    pixKey: string;
    pixKeyType: string;
};

export function DepositModal() {
    const { open, closeModal } = useUiModals();
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
    const [pixKey, setPixKey] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchPixKey() {
            if (!open.deposit || !user?.customerId) return;
            
            setLoading(true);
            try {
                const res = await http.get<AccountSummary>(
                    `/accounts/${user.customerId}/summary`
                );
                const key = res.data.pixKey;
                setPixKey(key);

                if (key) {
                    const url = await QRCode.toDataURL(key, {
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
                console.error("Error fetching PIX key:", err);
                toast.error("Erro ao carregar chave PIX");
            } finally {
                setLoading(false);
            }
        }

        fetchPixKey();
    }, [open.deposit, user?.customerId]);

    async function handleCopy() {
        if (!pixKey) return;
        
        try {
            await navigator.clipboard.writeText(pixKey);
            setCopied(true);
            toast.success("Chave PIX copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Erro ao copiar");
        }
    }

    function handleClose() {
        closeModal("deposit");
        setCopied(false);
    }

    return (
        <Dialog open={open.deposit} onOpenChange={handleClose}>
            <DialogContent className="bg-[#1a1025] border border-white/10 max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center">
                        Depositar via PIX
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                            <p className="text-white/60 text-sm mt-4">Carregando...</p>
                        </div>
                    ) : pixKey ? (
                        <>
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
                                    Escaneie o QR Code ou copie a chave PIX abaixo
                                </p>
                                
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                                    <p className="text-white/40 text-xs mb-1">Chave PIX (Copia e Cola)</p>
                                    <p className="text-white text-sm font-mono break-all">
                                        {pixKey}
                                    </p>
                                </div>

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
                                            Copiar Chave PIX
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <QrCode className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">
                                Nenhuma chave PIX cadastrada
                            </p>
                            <p className="text-white/40 text-sm mt-2">
                                Entre em contato com o suporte para cadastrar sua chave PIX
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
