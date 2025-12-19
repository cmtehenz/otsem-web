"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Loader2, ArrowLeft, Send, AlertCircle, CheckCircle2, Building2, User } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";

type KeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";

type PrecheckResponse = {
    valid: boolean;
    recipientName: string;
    recipientCpf?: string;
    recipientCnpj?: string;
    recipientBank: string;
    recipientAccountType: string;
};

type SendPixResponse = {
    transactionId: string;
    amount: number;
    status: string;
    endToEndId: string;
    createdAt: string;
};

const KEY_TYPE_LABELS: Record<KeyType, string> = {
    CPF: "CPF",
    CNPJ: "CNPJ",
    EMAIL: "E-mail",
    PHONE: "Telefone",
    EVP: "Chave Aleatória",
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function WithdrawModal() {
    const { open, closeModal, triggerRefresh } = useUiModals();
    const { user } = useAuth();
    const [step, setStep] = React.useState<"key" | "amount" | "confirm" | "success">("key");
    const [keyType, setKeyType] = React.useState<KeyType>("CPF");
    const [keyValue, setKeyValue] = React.useState("");
    const [cents, setCents] = React.useState(0);
    const [recipient, setRecipient] = React.useState<PrecheckResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [txResult, setTxResult] = React.useState<SendPixResponse | null>(null);

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

    function formatKeyValue(value: string, type: KeyType): string {
        const digits = value.replace(/\D/g, "");
        
        if (type === "CPF") {
            return digits
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }
        if (type === "CNPJ") {
            return digits
                .slice(0, 14)
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1/$2")
                .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
        }
        if (type === "PHONE") {
            if (digits.length <= 2) return `+${digits}`;
            if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
            if (digits.length <= 9) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
            return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
        }
        return value;
    }

    function handleKeyValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (keyType === "EMAIL" || keyType === "EVP") {
            setKeyValue(value);
        } else {
            setKeyValue(formatKeyValue(value, keyType));
        }
    }

    function getCleanKeyValue(): string {
        if (keyType === "EMAIL" || keyType === "EVP") {
            return keyValue.trim();
        }
        return keyValue.replace(/\D/g, "");
    }

    async function handlePrecheck() {
        if (!keyValue.trim()) {
            toast.error("Digite a chave PIX");
            return;
        }

        if (!user?.customerId) {
            toast.error("Usuário não autenticado");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cleanKey = getCleanKeyValue();
            const res = await http.get<PrecheckResponse>(
                `/pix/transactions/account-holders/${user.customerId}/precheck`,
                { params: { keyType, keyValue: cleanKey } }
            );

            if (res.data.valid) {
                setRecipient(res.data);
                setStep("amount");
            } else {
                setError("Chave PIX não encontrada ou inválida");
            }
        } catch (err: any) {
            console.error("Precheck error:", err);
            const message = err?.response?.data?.message || "Chave PIX não encontrada";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function handleContinueToConfirm() {
        if (cents < 100) {
            toast.error("Valor mínimo: R$ 1,00");
            return;
        }
        setStep("confirm");
    }

    async function handleSendPix() {
        if (!user?.customerId || !recipient) return;

        setLoading(true);
        setError(null);

        try {
            const valorDecimal = Number((cents / 100).toFixed(2));
            const cleanKey = getCleanKeyValue();

            const res = await http.post<SendPixResponse>(
                `/pix/transactions/account-holders/${user.customerId}/send`,
                {
                    amount: valorDecimal,
                    description: `Transferência para ${recipient.recipientName}`,
                    recipientKeyType: keyType,
                    recipientKeyValue: cleanKey,
                }
            );

            setTxResult(res.data);
            setStep("success");
            triggerRefresh();
            toast.success("PIX enviado com sucesso!");
        } catch (err: any) {
            console.error("Send PIX error:", err);
            const message = err?.response?.data?.message || "Erro ao enviar PIX";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        closeModal("withdraw");
        resetState();
    }

    function resetState() {
        setStep("key");
        setKeyType("CPF");
        setKeyValue("");
        setCents(0);
        setRecipient(null);
        setError(null);
        setTxResult(null);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("key");
            setCents(0);
        } else if (step === "confirm") {
            setStep("amount");
        }
        setError(null);
    }

    const displayAmount = formatCurrency(cents);

    return (
        <Dialog open={open.withdraw} onOpenChange={handleClose}>
            <DialogContent className="bg-[#0a0118] border border-violet-500/20 max-w-sm shadow-2xl shadow-violet-500/10">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl text-center flex items-center justify-center gap-2">
                        {(step === "amount" || step === "confirm") && (
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-4 text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {step === "key" && "Transferir via PIX"}
                        {step === "amount" && "Valor da Transferência"}
                        {step === "confirm" && "Confirmar Transferência"}
                        {step === "success" && "PIX Enviado!"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-center text-sm">
                        {step === "key" && "Digite a chave PIX do destinatário"}
                        {step === "amount" && "Escolha ou digite o valor"}
                        {step === "confirm" && "Revise os dados antes de enviar"}
                        {step === "success" && "Sua transferência foi realizada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "key" && (
                        <div className="w-full space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(KEY_TYPE_LABELS) as KeyType[]).slice(0, 3).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => { setKeyType(type); setKeyValue(""); }}
                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                                            keyType === type
                                                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                        }`}
                                    >
                                        {KEY_TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(KEY_TYPE_LABELS) as KeyType[]).slice(3).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => { setKeyType(type); setKeyValue(""); }}
                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                                            keyType === type
                                                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                        }`}
                                    >
                                        {KEY_TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>

                            <input
                                type={keyType === "EMAIL" ? "email" : "text"}
                                value={keyValue}
                                onChange={handleKeyValueChange}
                                placeholder={
                                    keyType === "CPF" ? "000.000.000-00" :
                                    keyType === "CNPJ" ? "00.000.000/0000-00" :
                                    keyType === "EMAIL" ? "email@exemplo.com" :
                                    keyType === "PHONE" ? "+55 (00) 00000-0000" :
                                    "Chave aleatória"
                                }
                                className="w-full px-4 text-center text-lg bg-white/5 border border-white/10 text-white h-14 rounded-xl focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none placeholder:text-white/30"
                                autoFocus
                            />

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handlePrecheck}
                                disabled={!keyValue.trim() || loading}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-violet-500/25"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    "Continuar"
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "amount" && recipient && (
                        <div className="w-full space-y-5">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{recipient.recipientName}</p>
                                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                                            <Building2 className="w-3 h-3" />
                                            <span>{recipient.recipientBank}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    type="text"
                                    inputMode="numeric"
                                    value={formatDisplayValue(cents)}
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
                                onClick={handleContinueToConfirm}
                                disabled={cents < 100}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-violet-500/25"
                            >
                                Continuar
                            </Button>

                            <p className="text-white/40 text-xs text-center">
                                Valor mínimo: R$ 1,00
                            </p>
                        </div>
                    )}

                    {step === "confirm" && recipient && (
                        <div className="w-full space-y-5">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{recipient.recipientName}</p>
                                        <div className="flex items-center gap-1.5 text-white/50 text-xs">
                                            <Building2 className="w-3 h-3" />
                                            <span>{recipient.recipientBank}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/50 text-sm">Chave PIX</span>
                                        <span className="text-white text-sm font-mono">{keyValue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-6 bg-gradient-to-b from-violet-500/10 to-transparent rounded-2xl">
                                <p className="text-white/50 text-sm mb-1">Valor a transferir</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleSendPix}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-green-500/25"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Confirmar e Enviar
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {step === "success" && txResult && (
                        <div className="w-full space-y-5">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                                <p className="text-white/50 text-sm mt-1">
                                    enviado para {recipient?.recipientName}
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Status</span>
                                    <span className="text-amber-400">Processando</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">ID</span>
                                    <span className="text-white/80 font-mono text-xs">{txResult.transactionId}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl py-6 shadow-lg shadow-violet-500/25"
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
