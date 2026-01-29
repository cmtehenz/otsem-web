"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
import { Loader2, ArrowLeft, Send, AlertCircle, CheckCircle2, KeyRound, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

function isLimitExceededError(message?: string): boolean {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes("limite") && (lower.includes("excedido") || lower.includes("upgrade"));
}

type PixKey = {
    id: string;
    keyType: string;
    keyValue: string;
    validated: boolean;
};

type SendPixResponse = {
    transactionId: string;
    amount: number;
    status: string;
    endToEndId: string;
    createdAt: string;
};

const KEY_TYPE_LABELS: Record<string, string> = {
    CPF: "CPF",
    CNPJ: "CNPJ",
    EMAIL: "E-mail",
    PHONE: "Telefone",
    RANDOM: "Aleatória",
    EVP: "Aleatória",
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export function WithdrawModal() {
    const router = useRouter();
    const { user } = useAuth();
    const customerId = user?.customerId;
    const { open, closeModal, triggerRefresh } = useUiModals();
    const [step, setStep] = React.useState<"loading" | "nokeys" | "select" | "amount" | "confirm" | "success">("loading");
    const [pixKeys, setPixKeys] = React.useState<PixKey[]>([]);
    const [selectedKey, setSelectedKey] = React.useState<PixKey | null>(null);
    const [cents, setCents] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [txResult, setTxResult] = React.useState<SendPixResponse | null>(null);

    React.useEffect(() => {
        if (open.withdraw && customerId) {
            loadPixKeys();
        }
    }, [open.withdraw, customerId]);

    async function loadPixKeys() {
        if (!customerId) return;
        setStep("loading");
        try {
            const res = await http.get<{ keys: PixKey[] }>(`/pix/keys/account-holders/${customerId}`);
            const keys = res.data.keys || [];
            setPixKeys(keys);

            if (keys.length === 0) {
                setStep("nokeys");
            } else {
                setStep("select");
            }
        } catch {
            setPixKeys([]);
            setStep("nokeys");
        }
    }

    async function handleSendPix() {
        if (!selectedKey || !customerId) return;

        setLoading(true);
        setError(null);

        try {
            const valorDecimal = Number((cents / 100).toFixed(2));

            const res = await http.post<SendPixResponse>(`/pix/transactions/account-holders/${customerId}/send`, {
                amount: valorDecimal,
                description: `Transferência PIX para ${selectedKey.keyValue}`,
                recipientKeyType: selectedKey.keyType,
                recipientKeyValue: selectedKey.keyValue
            });

            setTxResult(res.data);
            setStep("success");
            triggerRefresh();
            toast.success("PIX enviado com sucesso!");
        } catch (err: unknown) {
            console.error("Send PIX error:", err);
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            const fallbackMessage = message || "Erro ao enviar PIX";
            setError(fallbackMessage);
            if (!isLimitExceededError(message)) {
                toast.error(fallbackMessage);
            }
        } finally {
            setLoading(false);
        }
    }

    function handleGoToPixPage() {
        closeModal("withdraw");
        router.push("/customer/pix");
    }

    function handleClose() {
        closeModal("withdraw");
        resetState();
    }

    function resetState() {
        setStep("loading");
        setSelectedKey(null);
        setCents(0);
        setError(null);
        setTxResult(null);
        setPixKeys([]);
    }

    function handleBack() {
        if (step === "amount") {
            setStep("select");
            setCents(0);
            setSelectedKey(null);
        } else if (step === "confirm") {
            setStep("amount");
        }
        setError(null);
    }

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

    function handleSelectKey(key: PixKey) {
        setSelectedKey(key);
        setStep("amount");
    }

    async function handleContinueToConfirm() {
        if (cents < 100) {
            toast.error("Valor mínimo: R$ 1,00");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Realiza o precheck conforme API spec
            const res = await http.get(`/pix/transactions/account-holders/${customerId}/precheck`, {
                params: {
                    keyType: selectedKey?.keyType,
                    keyValue: selectedKey?.keyValue
                }
            });
            
            if (res.data && res.data.valid) {
                // Se desejar, pode salvar o recipientName retornado no precheck para exibir no confirm
                // setRecipientName(res.data.recipientName);
                setStep("confirm");
            } else {
                setError("Chave Pix inválida ou não encontrada");
            }
        } catch (err) {
            console.error("Precheck error:", err);
            setError("Não foi possível validar o destinatário. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    const displayAmount = formatCurrency(cents);

    return (
        <Dialog open={open.withdraw} onOpenChange={handleClose}>
            <DialogContent className="bg-card border border-[#6F00FF]/50/20 max-w-sm shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl text-center flex items-center justify-center gap-2">
                        {(step === "amount" || step === "confirm") && (
                            <Button
                                onClick={handleBack}
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {step === "loading" && "Carregando..."}
                        {step === "nokeys" && "Nenhuma Chave PIX"}
                        {step === "select" && "Transferir via PIX"}
                        {step === "amount" && "Valor da Transferência"}
                        {step === "confirm" && "Confirmar Transferência"}
                        {step === "success" && "PIX Enviado!"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-center text-sm">
                        {step === "loading" && "Buscando suas chaves PIX..."}
                        {step === "nokeys" && "Cadastre uma chave para transferir"}
                        {step === "select" && "Selecione a chave PIX de destino"}
                        {step === "amount" && "Escolha ou digite o valor"}
                        {step === "confirm" && "Revise os dados antes de enviar"}
                        {step === "success" && "Sua transferência foi realizada"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5 py-4">
                    {step === "loading" && (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="w-10 h-10 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                            <p className="text-muted-foreground text-sm mt-4">Carregando chaves PIX...</p>
                        </div>
                    )}

                    {step === "nokeys" && (
                        <div className="w-full space-y-5 text-center">
                            <div className="p-4 rounded-full bg-[#6F00FF]/50/20 inline-block">
                                <KeyRound className="w-10 h-10 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                            </div>
                            <div>
                                <p className="text-foreground font-medium mb-2">
                                    Você ainda não tem chaves PIX cadastradas
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Para transferir, primeiro cadastre uma chave PIX vinculada ao seu CPF ou CNPJ.
                                </p>
                            </div>
                            <Button
                                onClick={handleGoToPixPage}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#6F00FF]/50/25"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Cadastrar Chave PIX
                            </Button>
                        </div>
                    )}

                    {step === "select" && (
                        <div className="w-full space-y-3">
                            {pixKeys.map((key) => (
                                <button
                                    key={key.id}
                                    onClick={() => handleSelectKey(key)}
                                    className="w-full bg-muted border border-border rounded-xl p-4 hover:border-[#6F00FF]/50/50 hover:bg-[#6F00FF]/50/10 transition text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-foreground font-medium">
                                                    {KEY_TYPE_LABELS[key.keyType] || key.keyType}
                                                </span>
                                                {key.validated && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </div>
                                            <code className="text-muted-foreground text-sm font-mono">
                                                {key.keyValue}
                                            </code>
                                        </div>
                                        <div className="text-[#6F00FF]/50 dark:text-[#6F00FF]">
                                            <ArrowLeft className="w-5 h-5 rotate-180" />
                                        </div>
                                    </div>
                                </button>
                            ))}

                            <button
                                onClick={handleGoToPixPage}
                                className="w-full border border-dashed border-border rounded-xl p-4 hover:border-[#6F00FF]/50/50 hover:bg-[#6F00FF]/50/5 transition flex items-center justify-center gap-2 text-muted-foreground hover:text-[#6F00FF] dark:hover:text-[#6F00FF]/30"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Cadastrar nova chave</span>
                            </button>
                        </div>
                    )}

                    {step === "amount" && selectedKey && (
                        <div className="w-full space-y-5">
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#6F00FF]/50/20 flex items-center justify-center">
                                        <KeyRound className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-medium">
                                            {KEY_TYPE_LABELS[selectedKey.keyType] || selectedKey.keyType}
                                        </p>
                                        <code className="text-muted-foreground text-xs font-mono">
                                            {selectedKey.keyValue}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-4 bg-linear-to-b from-[#6F00FF]/50/10 to-transparent rounded-2xl">
                                <p className="text-5xl font-bold bg-linear-to-r from-[#6F00FF]/50 to-[#6F00FF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
                                    R$
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatDisplayValue(cents)}
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
                                onClick={handleContinueToConfirm}
                                disabled={cents < 100}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-[#6F00FF]/50/25"
                            >
                                Continuar
                            </Button>

                            <p className="text-muted-foreground text-xs text-center">
                                Valor mínimo: R$ 1,00
                            </p>
                        </div>
                    )}

                    {step === "confirm" && selectedKey && (
                        <div className="w-full space-y-5">
                            <div className="bg-muted border border-border rounded-xl p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#6F00FF]/50/20 flex items-center justify-center">
                                        <KeyRound className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-medium">
                                            {KEY_TYPE_LABELS[selectedKey.keyType] || selectedKey.keyType}
                                        </p>
                                        <code className="text-muted-foreground text-xs font-mono">
                                            {selectedKey.keyValue}
                                        </code>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-6 bg-linear-to-b from-[#6F00FF]/50/10 to-transparent rounded-2xl">
                                <p className="text-muted-foreground text-sm mb-1">Valor a transferir</p>
                                <p className="text-4xl font-bold bg-linear-to-r from-[#6F00FF]/50 to-[#6F00FF] dark:from-[#6F00FF] dark:to-[#8B2FFF] bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                            </div>

                            {error && (
                                isLimitExceededError(error) ? (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">{error}</p>
                                            <Link href="/customer/kyc" onClick={handleClose}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                                >
                                                    Ver meus limites
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )
                            )}

                            <Button
                                onClick={handleSendPix}
                                disabled={loading || isLimitExceededError(error ?? "")}
                                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl py-6 disabled:opacity-50 shadow-lg shadow-green-500/25"
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
                                    <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-3xl font-bold bg-linear-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                    {displayAmount}
                                </p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    transferido com sucesso
                                </p>
                            </div>

                            <div className="bg-muted border border-border rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="text-amber-500">Processando</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ID</span>
                                    <span className="text-foreground/80 font-mono text-xs">{txResult.transactionId}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold rounded-xl py-6 shadow-lg shadow-[#6F00FF]/50/25"
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
