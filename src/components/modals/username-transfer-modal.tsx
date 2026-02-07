"use client";

import React, { useState, useEffect, useCallback } from "react";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { toast } from "sonner";
import { Loader2, UserRoundSearch, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
} from "@/components/ui/bottom-sheet";
import { useUiModals } from "@/stores/ui-modals";

type RecipientInfo = {
    id: string;
    name: string;
    username: string;
};

type TransferResult = {
    id: string;
    amount: number;
    description: string;
    status: string;
    createdAt: string;
    sender: { name: string; username: string };
    receiver: { name: string; username: string };
};

type Step = "username" | "confirm" | "success";

function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data?.message === "string") return data.message;
        if (Array.isArray(data?.message)) return data.message[0];
    }
    if (err instanceof Error) return err.message || fallback;
    return fallback;
}

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function UsernameTransferModal() {
    const { open, closeModal, triggerRefresh } = useUiModals();
    const isOpen = open.usernameTransfer;

    const [step, setStep] = useState<Step>("username");
    const [username, setUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState("");
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<TransferResult | null>(null);

    const resetState = useCallback(() => {
        setStep("username");
        setUsername("");
        setAmount("");
        setDescription("");
        setRecipient(null);
        setLookupLoading(false);
        setLookupError("");
        setSending(false);
        setResult(null);
    }, []);

    useEffect(() => {
        if (isOpen) {
            resetState();
        }
    }, [isOpen, resetState]);

    async function handleLookup() {
        const cleaned = username.trim().toLowerCase().replace(/^@/, "");
        if (!cleaned) {
            toast.error("Digite um nome de usuário");
            return;
        }

        setLookupLoading(true);
        setLookupError("");
        setRecipient(null);

        try {
            const res = await http.get<RecipientInfo>(
                `/customers/by-username/${encodeURIComponent(cleaned)}`
            );
            setRecipient(res.data);
            setUsername(cleaned);
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response?.status === 404) {
                setLookupError("Usuário não encontrado");
            } else {
                setLookupError(getErrorMessage(err, "Erro ao buscar usuário"));
            }
        } finally {
            setLookupLoading(false);
        }
    }

    function handleProceed() {
        if (!recipient) return;
        setStep("confirm");
    }

    async function handleTransfer() {
        const numAmount = parseFloat(amount.replace(",", "."));
        if (isNaN(numAmount) || numAmount < 0.01) {
            toast.error("Valor mínimo de R$ 0,01");
            return;
        }

        setSending(true);
        try {
            const res = await http.post<{ transfer: TransferResult }>("/transfers", {
                username: recipient!.username,
                amount: numAmount,
                ...(description.trim() ? { description: description.trim() } : {}),
            });
            setResult(res.data.transfer);
            setStep("success");
            triggerRefresh();
            toast.success("Transferência enviada!");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao enviar transferência"));
        } finally {
            setSending(false);
        }
    }

    function handleClose() {
        closeModal("usernameTransfer");
    }

    return (
        <BottomSheet open={isOpen} onOpenChange={handleClose}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle className="text-white text-xl flex items-center gap-2">
                        <UserRoundSearch className="w-5 h-5 text-[#6F00FF]" />
                        Enviar para usuário
                    </BottomSheetTitle>
                    <BottomSheetDescription className="text-white/60">
                        {step === "username" && "Envie BRL para outro usuário Otsem Pay"}
                        {step === "confirm" && "Confirme os dados da transferência"}
                        {step === "success" && "Transferência concluída"}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                {/* ── Step 1: Username lookup ── */}
                {step === "username" && (
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/60 mb-2 block">
                                Nome de usuário
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                                        @
                                    </span>
                                    <Input
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value.replace(/^@/, ""));
                                            setLookupError("");
                                            setRecipient(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleLookup();
                                        }}
                                        placeholder="joaosilva"
                                        className="border-white/10 bg-white/5 text-white text-sm pl-7"
                                    />
                                </div>
                                <Button
                                    onClick={handleLookup}
                                    disabled={lookupLoading || !username.trim()}
                                    className="bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold px-4"
                                >
                                    {lookupLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Buscar"
                                    )}
                                </Button>
                            </div>
                            {lookupError && (
                                <p className="text-xs text-red-400 mt-1.5">{lookupError}</p>
                            )}
                        </div>

                        {recipient && (
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-white font-semibold text-[15px]">
                                    {recipient.name}
                                </p>
                                <p className="text-white/60 text-sm">
                                    @{recipient.username}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleProceed}
                                disabled={!recipient}
                                className="flex-1 bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold"
                            >
                                Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Amount + Confirmation ── */}
                {step === "confirm" && recipient && (
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-white/60 text-xs mb-1">Enviar para</p>
                            <p className="text-white font-semibold text-[15px]">
                                {recipient.name}
                            </p>
                            <p className="text-white/60 text-sm">
                                @{recipient.username}
                            </p>
                        </div>

                        <div>
                            <Label className="text-white/60 mb-1 block">
                                Valor (BRL)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0,00"
                                className="border-white/10 bg-white/5 text-white text-sm"
                                autoFocus
                            />
                        </div>

                        <div>
                            <Label className="text-white/60 mb-1 block">
                                Descrição (opcional)
                            </Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Pagamento do almoço"
                                maxLength={140}
                                className="border-white/10 bg-white/5 text-white text-sm"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("username")}
                                className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
                            >
                                Voltar
                            </Button>
                            <Button
                                onClick={handleTransfer}
                                disabled={sending || !amount.trim()}
                                className="flex-1 bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Confirmar Transferência"
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Success ── */}
                {step === "success" && result && (
                    <div className="space-y-4">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-xl text-center">
                            <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-3" />
                            <p className="text-white font-semibold text-lg mb-1">
                                Transferência enviada!
                            </p>
                            <p className="text-white/60 text-sm">
                                {formatBRL(result.amount)} para @{result.receiver.username}
                            </p>
                            {result.description && (
                                <p className="text-white/60 text-xs mt-2">
                                    {result.description}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleClose}
                            className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold"
                        >
                            Fechar
                        </Button>
                    </div>
                )}
            </BottomSheetContent>
        </BottomSheet>
    );
}
