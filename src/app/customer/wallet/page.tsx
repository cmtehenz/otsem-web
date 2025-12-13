"use client";

import React, { useState, useEffect } from "react";
import http from "@/lib/http";
import { toast } from "sonner";
import { Copy, Shield, Wallet, RefreshCw, Plus, QrCode, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type WalletKeys = {
    publicKey: string;
    secretKey: string;
};

type WalletType = {
    id: string;
    customerId: string;
    currency: string;
    balance: string;
    externalAddress: string;
    createdAt: string;
    updatedAt: string;
    label?: string;
};

export default function WalletPage() {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [creating, setCreating] = useState(false);
    const [walletKeys, setWalletKeys] = useState<WalletKeys | null>(null);
    const [editWallet, setEditWallet] = useState<WalletType | null>(null);
    const [editLabel, setEditLabel] = useState("");

    useEffect(() => {
        fetchWallets();
    }, []);

    async function fetchWallets() {
        setLoadingWallets(true);
        try {
            const res = await http.get<WalletType[]>("/wallet/usdt");
            setWallets(res.data);
        } catch (err) {
            setWallets([]);
        } finally {
            setLoadingWallets(false);
        }
    }

    async function handleCreateWallet() {
        setCreating(true);
        try {
            const res = await http.post("/wallet/create-solana");

            if (
                (res.status === 200 || res.status === 201) &&
                res.data?.publicKey &&
                res.data?.secretKey &&
                res.data?.wallet
            ) {
                const { publicKey, secretKey, wallet } = res.data;
                setWalletKeys({ publicKey, secretKey });
                toast.success("Carteira criada com sucesso!");
                setWallets((prev) => [wallet, ...prev]);
            } else {
                toast.error(res.data?.message || "Erro ao criar carteira.");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Erro ao criar carteira.");
        } finally {
            setCreating(false);
        }
    }

    async function onCopy(text?: string) {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    }

    function handleEdit(wallet: WalletType) {
        setEditWallet(wallet);
        setEditLabel(wallet.label || "");
    }

    async function handleSaveEdit() {
        try {
            await http.patch(`/wallet/usdt/${editWallet?.id}`, { label: editLabel });
            toast.success("Carteira atualizada!");
            setEditWallet(null);
            fetchWallets();
        } catch {
            toast.error("Erro ao editar carteira.");
        }
    }

    function formatAddress(address: string) {
        if (address.length <= 16) return address;
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    }

    if (loadingWallets) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="text-sm text-white/60 mt-4">Carregando carteiras...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Carteiras</h1>
                    <p className="text-white/50 text-sm mt-1">
                        Gerencie suas carteiras USDT na rede Solana
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={fetchWallets}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button
                        onClick={handleCreateWallet}
                        disabled={creating}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {creating ? "Criando..." : "Nova Carteira"}
                    </Button>
                </div>
            </div>

            {wallets.length === 0 ? (
                <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-12 text-center">
                    <div className="p-4 rounded-full bg-violet-500/20 inline-block mb-4">
                        <Wallet className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Nenhuma carteira encontrada
                    </h2>
                    <p className="text-white/50 mb-6 max-w-md mx-auto">
                        Crie sua primeira carteira Solana para receber USDT. Você pode ter múltiplas carteiras para organizar seus fundos.
                    </p>
                    <Button
                        onClick={handleCreateWallet}
                        disabled={creating}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-8"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {creating ? "Criando..." : "Criar Primeira Carteira"}
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {wallets.map((wallet, index) => (
                        <div
                            key={wallet.id}
                            className="bg-[#1a1025] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                                        <Wallet className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-semibold">
                                                {wallet.label || `Carteira ${index + 1}`}
                                            </span>
                                            {index === 0 && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                                                    Principal
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-400 rounded-full">
                                                Solana
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-white/60 text-sm font-mono">
                                                {formatAddress(wallet.externalAddress)}
                                            </code>
                                            <button
                                                onClick={() => onCopy(wallet.externalAddress)}
                                                className="p-1 hover:bg-white/10 rounded transition"
                                            >
                                                <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">
                                        {Number(wallet.balance).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 4,
                                        })}
                                        <span className="text-white/50 text-base ml-1">USDT</span>
                                    </p>
                                    <p className="text-white/40 text-xs mt-1">
                                        Criada em {new Date(wallet.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCopy(wallet.externalAddress)}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar Endereço
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(wallet)}
                                    className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    Renomear
                                </Button>
                                <a
                                    href={`https://solscan.io/account/${wallet.externalAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/60 hover:text-white hover:bg-white/10"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Ver no Solscan
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-amber-400 font-medium text-sm">Importante</p>
                    <p className="text-white/60 text-sm mt-1">
                        Envie <strong className="text-white">apenas USDT</strong> na rede Solana (SPL). 
                        Envios em redes diferentes serão perdidos permanentemente.
                    </p>
                </div>
            </div>

            <Dialog open={!!walletKeys} onOpenChange={() => setWalletKeys(null)}>
                <DialogContent className="bg-[#1a1025] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Carteira Criada!</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-amber-400 text-sm font-medium mb-1">Atenção!</p>
                            <p className="text-white/70 text-sm">
                                Salve sua chave privada em local seguro. Ela <strong className="text-white">não será armazenada</strong> pelo OtsemPay.
                            </p>
                        </div>

                        <div>
                            <Label className="text-white/70">Chave Pública</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    readOnly
                                    value={walletKeys?.publicKey || ""}
                                    className="border-white/10 bg-white/5 text-white font-mono text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onCopy(walletKeys?.publicKey)}
                                    className="shrink-0 text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white/70">Chave Privada</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    readOnly
                                    value={walletKeys?.secretKey || ""}
                                    className="border-white/10 bg-white/5 text-white font-mono text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onCopy(walletKeys?.secretKey)}
                                    className="shrink-0 text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={() => setWalletKeys(null)}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold mt-2"
                        >
                            Já salvei minha chave privada
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editWallet} onOpenChange={() => setEditWallet(null)}>
                <DialogContent className="bg-[#1a1025] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Renomear Carteira</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/70">Endereço</Label>
                            <Input
                                readOnly
                                value={editWallet?.externalAddress || ""}
                                className="border-white/10 bg-white/5 text-white/60 font-mono text-sm mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-white/70">Nome da Carteira</Label>
                            <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                placeholder="Ex: Carteira Principal"
                                className="border-white/10 bg-white/5 text-white mt-1"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditWallet(null)}
                                className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
