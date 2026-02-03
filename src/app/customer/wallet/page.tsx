"use client";

import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import http from "@/lib/http";
import { toast } from "sonner";
import {
    Copy, Shield, Wallet, RefreshCw, Plus, ExternalLink, Loader2,
    Star, Trash2, MoreVertical, Check, Send,
} from "lucide-react";
import { useUiModals } from "@/stores/ui-modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetDescription } from "@/components/ui/bottom-sheet";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type WalletKeys = { publicKey: string; secretKey: string };
type WalletType = {
    id: string; customerId: string; currency: string; network: string;
    balance: string; externalAddress: string; createdAt: string; updatedAt: string;
    label?: string; isMain?: boolean;
};
type NetworkType = "SOLANA" | "TRON";

const NETWORKS: { id: NetworkType; name: string; icon: string; color: string; badge: string }[] = [
    { id: "SOLANA", name: "Solana", icon: "◎", color: "text-green-500", badge: "bg-green-500/12 text-green-500" },
    { id: "TRON", name: "Tron (TRC20)", icon: "◈", color: "text-red-500", badge: "bg-red-500/12 text-red-500" },
];

function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) return err.response?.data?.message || fallback;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

export default function WalletPage() {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [creating, setCreating] = useState(false);
    const [walletKeys, setWalletKeys] = useState<WalletKeys | null>(null);
    const [editWallet, setEditWallet] = useState<WalletType | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [deleteWallet, setDeleteWallet] = useState<WalletType | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { openModal } = useUiModals();
    const [showAddModal, setShowAddModal] = useState(false);
    const [addMode, setAddMode] = useState<"create" | "import">("create");
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("SOLANA");
    const [importAddress, setImportAddress] = useState("");
    const [importLabel, setImportLabel] = useState("");
    const [importing, setImporting] = useState(false);

    useEffect(() => { fetchWallets(); }, []);

    async function fetchWallets() {
        setLoadingWallets(true);
        try {
            const res = await http.get<WalletType[]>("/wallet");
            setWallets(res.data);
        } catch { setWallets([]); }
        finally { setLoadingWallets(false); }
    }

    async function syncAllWallets() {
        try {
            await http.post("/wallet/sync-all");
            await fetchWallets();
            toast.success("Saldos sincronizados!");
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao sincronizar saldos")); }
    }

    async function syncWallet(walletId: string) {
        try {
            await http.post(`/wallet/${walletId}/sync`);
            await fetchWallets();
            toast.success("Saldo atualizado!");
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao sincronizar saldo")); }
    }

    async function handleCreateWallet() {
        setCreating(true);
        try {
            const endpoint = selectedNetwork === "SOLANA" ? "/wallet/create-solana" : "/wallet/create-tron";
            const res = await http.post(endpoint);
            if (res.status === 200 || res.status === 201) {
                const data = res.data;
                const publicKey = data.publicKey || data.address || data.externalAddress || data.wallet?.externalAddress;
                const secretKey = data.secretKey || data.privateKey;
                if (publicKey && secretKey) {
                    setWalletKeys({ publicKey, secretKey });
                    toast.success("Carteira criada com sucesso!");
                    setShowAddModal(false);
                    fetchWallets();
                } else { toast.error(data?.message || "Erro ao criar carteira."); }
            } else { toast.error(res.data?.message || "Erro ao criar carteira."); }
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao criar carteira.")); }
        finally { setCreating(false); }
    }

    async function handleImportWallet() {
        if (!importAddress.trim()) { toast.error("Digite o endereço da carteira"); return; }
        setImporting(true);
        try {
            const res = await http.post("/wallet/import", {
                externalAddress: importAddress.trim(),
                network: selectedNetwork,
                label: importLabel.trim() || undefined,
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("Carteira adicionada com sucesso!");
                setShowAddModal(false);
                setImportAddress(""); setImportLabel("");
                fetchWallets();
            } else { toast.error(res.data?.message || "Erro ao adicionar carteira."); }
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao adicionar carteira.")); }
        finally { setImporting(false); }
    }

    async function onCopy(text?: string) {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    }

    function handleEdit(wallet: WalletType) { setEditWallet(wallet); setEditLabel(wallet.label || ""); }

    async function handleSaveLabel() {
        if (!editWallet) return;
        try {
            await http.patch(`/wallet/${editWallet.id}/label`, { label: editLabel });
            toast.success("Carteira renomeada!");
            setEditWallet(null); fetchWallets();
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao renomear carteira.")); }
    }

    async function handleSetMain(wallet: WalletType) {
        try {
            await http.patch(`/wallet/${wallet.id}/set-main`);
            toast.success("Carteira definida como principal!");
            fetchWallets();
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao definir carteira principal.")); }
    }

    async function handleDeleteWallet() {
        if (!deleteWallet) return;
        setDeleting(true);
        try {
            await http.delete(`/wallet/${deleteWallet.id}`);
            toast.success("Carteira excluída!");
            setDeleteWallet(null); fetchWallets();
        } catch (err: unknown) { toast.error(getErrorMessage(err, "Erro ao excluir carteira.")); }
        finally { setDeleting(false); }
    }

    function formatAddress(address: string) {
        if (address.length <= 16) return address;
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

    function getExplorerUrl(wallet: WalletType) {
        return wallet.network === "TRON"
            ? `https://tronscan.org/#/address/${wallet.externalAddress}`
            : `https://solscan.io/account/${wallet.externalAddress}`;
    }

    function getExplorerName(wallet: WalletType) {
        return wallet.network === "TRON" ? "Tronscan" : "Solscan";
    }

    function openAddModal() {
        setShowAddModal(true); setAddMode("create");
        setSelectedNetwork("SOLANA"); setImportAddress(""); setImportLabel("");
    }

    // Total USDT balance
    const totalUsdt = wallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);

    if (loadingWallets) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#6F00FF]/30 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="relative h-8 w-8 animate-spin text-[#6F00FF]" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-5 pb-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-white">Carteiras</h1>
                    <p className="text-[13px] text-white/60 mt-0.5">Gerencie suas carteiras USDT</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={syncAllWallets}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 active:scale-95 transition-transform"
                    >
                        <RefreshCw className="w-4.5 h-4.5 text-white/60" strokeWidth={2} />
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00FF] active:scale-95 transition-transform"
                    >
                        <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </motion.div>

            {/* Total balance card */}
            {wallets.length > 0 && (
                <motion.div variants={fadeUp}>
                    <div className="relative overflow-hidden rounded-[20px] p-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/80 via-blue-600/80 to-purple-600/80" />
                        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative">
                            <p className="text-white/60 text-[12px] font-medium mb-1">Total USDT</p>
                            <p className="text-white text-[28px] font-bold tracking-tight">
                                $ {totalUsdt.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </p>
                            <p className="text-white/50 text-[12px] mt-1">
                                {wallets.length} carteira{wallets.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Wallets list */}
            {wallets.length === 0 ? (
                <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5 !p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#6F00FF]/10 flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-7 h-7 text-[#6F00FF]" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">Nenhuma carteira</h2>
                    <p className="text-[13px] text-white/60 mb-5 max-w-xs mx-auto">
                        Adicione sua primeira carteira para receber e enviar USDT.
                    </p>
                    <motion.button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6F00FF] text-white font-semibold text-[14px]"
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Carteira
                    </motion.button>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {wallets.map((wallet, index) => {
                        const networkInfo = NETWORKS.find(n => n.id === wallet.network) || NETWORKS[0];
                        return (
                            <motion.div
                                key={wallet.id}
                                variants={fadeUp}
                                className="fintech-glass-card rounded-[20px] p-5 !p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`flex items-center justify-center w-11 h-11 rounded-2xl ${networkInfo.badge} text-lg shrink-0`}>
                                            {networkInfo.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[15px] font-semibold text-white truncate">
                                                    {wallet.label || `Carteira ${index + 1}`}
                                                </span>
                                                {wallet.isMain && (
                                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-[#6F00FF]/12 text-[#6F00FF] dark:text-[#8B2FFF] rounded-full">
                                                        <Star className="w-2.5 h-2.5" />
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`text-[11px] font-medium ${networkInfo.badge} px-1.5 py-0.5 rounded-full`}>
                                                    {wallet.network || "SOLANA"}
                                                </span>
                                                <code className="text-[12px] text-white/60 font-mono">
                                                    {formatAddress(wallet.externalAddress)}
                                                </code>
                                                <button onClick={() => onCopy(wallet.externalAddress)} className="p-0.5 active:scale-90 transition-transform">
                                                    <Copy className="w-3 h-3 text-white/60" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[16px] font-bold text-white">
                                                {Number(wallet.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                            </p>
                                            <p className="text-[11px] text-white/60">USDT</p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex items-center justify-center w-8 h-8 rounded-full active:bg-white/10 transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-white/60" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/60 backdrop-blur-xl border-white/15 min-w-[180px]">
                                                {Number(wallet.balance) > 0 && (
                                                    <DropdownMenuItem onClick={() => openModal("sendUsdt")} className="text-white/70 hover:text-white cursor-pointer">
                                                        <Send className="w-4 h-4 mr-2" /> Enviar USDT
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => syncWallet(wallet.id)} className="text-white/70 hover:text-white cursor-pointer">
                                                    <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onCopy(wallet.externalAddress)} className="text-white/70 hover:text-white cursor-pointer">
                                                    <Copy className="w-4 h-4 mr-2" /> Copiar Endereço
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(wallet)} className="text-white/70 hover:text-white cursor-pointer">
                                                    Renomear
                                                </DropdownMenuItem>
                                                {!wallet.isMain && (
                                                    <DropdownMenuItem onClick={() => handleSetMain(wallet)} className="text-white/70 hover:text-white cursor-pointer">
                                                        <Star className="w-4 h-4 mr-2" /> Definir Principal
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => window.open(getExplorerUrl(wallet), "_blank")} className="text-white/70 hover:text-white cursor-pointer">
                                                    <ExternalLink className="w-4 h-4 mr-2" /> {getExplorerName(wallet)}
                                                </DropdownMenuItem>
                                                {!wallet.isMain && wallets.length > 1 && (
                                                    <DropdownMenuItem onClick={() => setDeleteWallet(wallet)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Warning card */}
            <motion.div variants={fadeUp}>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/15 dark:border-amber-500/20">
                    <Shield className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                        <p className="text-amber-600 dark:text-amber-400 font-semibold text-[13px]">Importante</p>
                        <p className="text-white/60 text-[12px] mt-0.5 leading-relaxed">
                            Envie <strong className="text-white">apenas USDT</strong> na rede correta. Envios em redes diferentes serão perdidos.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Add Modal ── */}
            <BottomSheet open={showAddModal} onOpenChange={setShowAddModal}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle className="text-white text-lg">Adicionar Carteira</BottomSheetTitle>
                        <BottomSheetDescription className="text-white/60 text-[13px]">
                            Escolha a rede e como adicionar
                        </BottomSheetDescription>
                    </BottomSheetHeader>
                    <div className="space-y-5">
                        <div>
                            <Label className="text-white/60 text-[13px] mb-2 block">Rede</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {NETWORKS.map((network) => (
                                    <button
                                        key={network.id}
                                        onClick={() => setSelectedNetwork(network.id)}
                                        className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all active:scale-[0.97] ${
                                            selectedNetwork === network.id
                                                ? "border-[#6F00FF]/50 bg-[#6F00FF]/10"
                                                : "border-white/15 bg-white/10 hover:border-white/25"
                                        }`}
                                    >
                                        <span className="text-lg">{network.icon}</span>
                                        <span className="text-[14px] font-medium text-white">{network.name}</span>
                                        {selectedNetwork === network.id && (
                                            <Check className="w-4 h-4 text-[#6F00FF]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-white/60 text-[13px] mb-2 block">Tipo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setAddMode("create")}
                                    className={`p-3.5 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                                        addMode === "create"
                                            ? "border-[#6F00FF]/50 bg-[#6F00FF]/10"
                                            : "border-white/15 bg-white/10 hover:border-white/25"
                                    }`}
                                >
                                    <p className="text-[14px] font-medium text-white">Criar Nova</p>
                                    <p className="text-white/60 text-[11px] mt-0.5">Gerar automaticamente</p>
                                </button>
                                <button
                                    onClick={() => setAddMode("import")}
                                    className={`p-3.5 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                                        addMode === "import"
                                            ? "border-[#6F00FF]/50 bg-[#6F00FF]/10"
                                            : "border-white/15 bg-white/10 hover:border-white/25"
                                    }`}
                                >
                                    <p className="text-[14px] font-medium text-white">Importar</p>
                                    <p className="text-white/60 text-[11px] mt-0.5">Carteira existente</p>
                                </button>
                            </div>
                        </div>

                        {addMode === "import" && (
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-white/60 text-[13px]">Endereço</Label>
                                    <Input
                                        value={importAddress}
                                        onChange={(e) => setImportAddress(e.target.value)}
                                        placeholder={selectedNetwork === "SOLANA" ? "Ex: 7xKXt..." : "Ex: TJYs..."}
                                        className="border-white/15 bg-white/10 text-white mt-1 font-mono text-[13px]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/60 text-[13px]">Nome (opcional)</Label>
                                    <Input
                                        value={importLabel}
                                        onChange={(e) => setImportLabel(e.target.value)}
                                        placeholder="Ex: Minha Carteira Binance"
                                        className="border-white/15 bg-white/10 text-white mt-1 text-[13px]"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <Button
                                variant="ghost"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 bg-white/10 border border-white/15 text-white hover:bg-white/15 rounded-2xl h-12"
                            >
                                Cancelar
                            </Button>
                            {addMode === "create" ? (
                                <Button
                                    onClick={handleCreateWallet}
                                    disabled={creating}
                                    className="flex-1 bg-[#6F00FF] hover:bg-[#6F00FF]/80 text-white font-semibold rounded-2xl h-12"
                                >
                                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</> : "Criar Carteira"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleImportWallet}
                                    disabled={importing || !importAddress.trim()}
                                    className="flex-1 bg-[#6F00FF] hover:bg-[#6F00FF]/80 text-white font-semibold rounded-2xl h-12"
                                >
                                    {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando...</> : "Importar"}
                                </Button>
                            )}
                        </div>
                    </div>
                </BottomSheetContent>
            </BottomSheet>

            {/* ── Keys Modal ── */}
            <BottomSheet open={!!walletKeys} onOpenChange={() => setWalletKeys(null)}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle className="text-white text-lg">Carteira Criada!</BottomSheetTitle>
                    </BottomSheetHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <p className="text-amber-600 dark:text-amber-400 text-[13px] font-semibold mb-0.5">Atenção!</p>
                            <p className="text-white/60 text-[12px]">
                                Salve sua chave privada. Ela <strong className="text-white">não será armazenada</strong>.
                            </p>
                        </div>
                        <div>
                            <Label className="text-white/60 text-[12px]">Chave Pública</Label>
                            <div className="flex gap-2 mt-1">
                                <Input readOnly value={walletKeys?.publicKey || ""} className="border-white/15 bg-white/10 text-white font-mono text-[12px]" />
                                <Button variant="ghost" size="icon" onClick={() => onCopy(walletKeys?.publicKey)} className="shrink-0">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label className="text-white/60 text-[12px]">Chave Privada</Label>
                            <div className="flex gap-2 mt-1">
                                <Input readOnly value={walletKeys?.secretKey || ""} className="border-white/15 bg-white/10 text-white font-mono text-[12px]" />
                                <Button variant="ghost" size="icon" onClick={() => onCopy(walletKeys?.secretKey)} className="shrink-0">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={() => setWalletKeys(null)} className="w-full bg-[#6F00FF] hover:bg-[#6F00FF]/80 text-white font-semibold rounded-2xl h-12">
                            Já salvei minha chave privada
                        </Button>
                    </div>
                </BottomSheetContent>
            </BottomSheet>

            {/* ── Edit Label Modal ── */}
            <BottomSheet open={!!editWallet} onOpenChange={() => setEditWallet(null)}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle className="text-white text-lg">Renomear</BottomSheetTitle>
                    </BottomSheetHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/60 text-[12px]">Endereço</Label>
                            <Input readOnly value={editWallet?.externalAddress || ""} className="border-white/15 bg-white/10 text-white/60 font-mono text-[12px] mt-1" />
                        </div>
                        <div>
                            <Label className="text-white/60 text-[12px]">Nome</Label>
                            <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Ex: Carteira Principal" className="border-white/15 bg-white/10 text-white mt-1 text-[13px]" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setEditWallet(null)} className="flex-1 bg-white/10 border border-white/15 text-white rounded-2xl h-12">Cancelar</Button>
                            <Button onClick={handleSaveLabel} className="flex-1 bg-[#6F00FF] hover:bg-[#6F00FF]/80 text-white font-semibold rounded-2xl h-12">Salvar</Button>
                        </div>
                    </div>
                </BottomSheetContent>
            </BottomSheet>

            {/* ── Delete Dialog ── */}
            <AlertDialog open={!!deleteWallet} onOpenChange={() => setDeleteWallet(null)}>
                <AlertDialogContent className="bg-black/60 backdrop-blur-xl border border-white/15 max-w-sm mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Excluir Carteira</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60 text-[13px]">
                            Esta ação não pode ser desfeita.
                            <div className="mt-2 p-3 bg-white/10 rounded-xl">
                                <code className="text-white/60 text-[12px] font-mono break-all">{deleteWallet?.externalAddress}</code>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border border-white/15 text-white rounded-2xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWallet} disabled={deleting} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl">
                            {deleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
