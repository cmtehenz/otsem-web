"use client";

import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { toast } from "sonner";
import { Loader2, Send, ExternalLink } from "lucide-react";
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

type WalletType = {
    id: string;
    network: string;
    balance: string;
    externalAddress: string;
    label?: string;
    isMain?: boolean;
    encryptedPrivateKey?: string | null;
};

function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) return err.response?.data?.message || fallback;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
}

export default function SendUsdtModal() {
    const { open, closeModal } = useUiModals();
    const isOpen = open.sendUsdt;

    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedWalletId, setSelectedWalletId] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [txResult, setTxResult] = useState<{ txId: string; network: string } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchWallets();
            setSelectedWalletId("");
            setToAddress("");
            setAmount("");
            setTxResult(null);
            setShowConfirm(false);
        }
    }, [isOpen]);

    async function fetchWallets() {
        setLoading(true);
        try {
            const res = await http.get<WalletType[]>("/wallet");
            const custodial = res.data.filter((w) => Number(w.balance) > 0);
            setWallets(custodial);
            if (custodial.length === 1) {
                setSelectedWalletId(custodial[0].id);
            }
        } catch {
            setWallets([]);
        } finally {
            setLoading(false);
        }
    }

    const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

    function validateAddress(address: string, network?: string): string | null {
        const trimmed = address.trim();
        if (!trimmed) return "Endereço é obrigatório";
        if (network === "TRON") {
            if (!/^T[a-zA-Z0-9]{33}$/.test(trimmed)) return "Endereço Tron inválido (deve começar com T e ter 34 caracteres)";
        } else if (network === "SOLANA") {
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) return "Endereço Solana inválido (Base58, 32-44 caracteres)";
        }
        return null;
    }

    function handleReviewSend() {
        if (!selectedWalletId || !toAddress.trim() || !amount.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }
        const addrError = validateAddress(toAddress, selectedWallet?.network);
        if (addrError) {
            toast.error(addrError);
            return;
        }
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Valor inválido");
            return;
        }
        if (selectedWallet && numAmount > Number(selectedWallet.balance)) {
            toast.error("Saldo insuficiente");
            return;
        }
        setShowConfirm(true);
    }

    async function handleSend() {
        setSending(true);
        try {
            const res = await http.post("/wallet/send-usdt", {
                walletId: selectedWalletId,
                toAddress: toAddress.trim(),
                amount: Number(amount),
            });
            setTxResult({ txId: res.data.txId, network: res.data.network });
            setShowConfirm(false);
            toast.success("USDT enviado com sucesso!");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao enviar USDT"));
        } finally {
            setSending(false);
        }
    }

    function getExplorerTxUrl(txId: string, network: string) {
        if (network === "TRON") return `https://tronscan.org/#/transaction/${txId}`;
        return `https://solscan.io/tx/${txId}`;
    }

    function handleClose() {
        closeModal("sendUsdt");
    }

    return (
        <BottomSheet open={isOpen} onOpenChange={handleClose}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle className="text-foreground text-xl flex items-center gap-2">
                        <Send className="w-5 h-5 text-[#6F00FF]" />
                        Enviar USDT
                    </BottomSheetTitle>
                    <BottomSheetDescription className="text-muted-foreground">
                        Envie USDT de uma carteira custodial para qualquer endereço
                    </BottomSheetDescription>
                </BottomSheetHeader>

                {txResult ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <p className="text-white font-semibold text-lg mb-1">
                                Transação enviada!
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {amount} USDT enviados para
                            </p>
                            <code className="text-muted-foreground text-xs font-mono break-all">
                                {toAddress}
                            </code>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-border text-foreground hover:bg-accent"
                            onClick={() => window.open(getExplorerTxUrl(txResult.txId, txResult.network), "_blank")}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver no {txResult.network === "TRON" ? "Tronscan" : "Solscan"}
                        </Button>

                        <Button
                            onClick={handleClose}
                            className="w-full bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold"
                        >
                            Fechar
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#6F00FF]" />
                    </div>
                ) : wallets.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm">
                            Nenhuma carteira custodial com saldo disponível.
                        </p>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="mt-4 text-muted-foreground hover:text-foreground"
                        >
                            Fechar
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground mb-2 block">Carteira de Origem</Label>
                            <select
                                value={selectedWalletId}
                                onChange={(e) => setSelectedWalletId(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2.5 text-sm"
                            >
                                <option value="">Selecione uma carteira</option>
                                {wallets.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.label || w.network} — {Number(w.balance).toFixed(2)} USDT ({w.network})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-muted-foreground mb-1 block">Endereço de Destino</Label>
                            <Input
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                placeholder={
                                    selectedWallet?.network === "TRON"
                                        ? "Ex: TJYs..."
                                        : selectedWallet?.network === "SOLANA"
                                            ? "Ex: 7xKXt..."
                                            : "Selecione uma carteira primeiro"
                                }
                                className="border-border bg-background text-foreground font-mono text-sm"
                            />
                            {selectedWallet && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Rede: {selectedWallet.network === "TRON" ? "Tron (TRC20)" : "Solana (SPL)"}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label className="text-muted-foreground">Valor (USDT)</Label>
                                {selectedWallet && (
                                    <button
                                        type="button"
                                        onClick={() => setAmount(selectedWallet.balance)}
                                        className="text-xs text-[#6F00FF] hover:underline"
                                    >
                                        Máx: {Number(selectedWallet.balance).toFixed(2)}
                                    </button>
                                )}
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="border-border bg-background text-foreground text-sm"
                            />
                        </div>

                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-white/70 text-xs font-medium">
                                Certifique-se de que o endereço de destino é da mesma rede da carteira.
                                Envios para redes diferentes resultam em perda permanente.
                            </p>
                        </div>

                        {showConfirm ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-white/5 border border-amber-500/30 rounded-xl">
                                    <p className="text-amber-400 text-sm font-semibold mb-2">Confirmar envio</p>
                                    <div className="space-y-1.5 text-sm">
                                        <p className="text-white"><span className="text-muted-foreground">Valor:</span> {amount} USDT</p>
                                        <p className="text-white"><span className="text-muted-foreground">Rede:</span> {selectedWallet?.network === "TRON" ? "Tron (TRC20)" : "Solana (SPL)"}</p>
                                        <p className="text-white break-all"><span className="text-muted-foreground">Para:</span> {toAddress}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1 bg-muted border border-border text-foreground hover:bg-accent">
                                        Voltar
                                    </Button>
                                    <Button onClick={handleSend} disabled={sending} className="flex-1 bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold">
                                        {sending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>) : (<><Send className="w-4 h-4 mr-2" />Confirmar Envio</>)}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3 pt-2">
                                <Button variant="ghost" onClick={handleClose} className="flex-1 bg-muted border border-border text-foreground hover:bg-accent">
                                    Cancelar
                                </Button>
                                <Button onClick={handleReviewSend} disabled={!selectedWalletId || !toAddress.trim() || !amount.trim()} className="flex-1 bg-linear-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold">
                                    <Send className="w-4 h-4 mr-2" />
                                    Revisar Envio
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </BottomSheetContent>
        </BottomSheet>
    );
}
