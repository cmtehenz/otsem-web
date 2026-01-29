"use client";

import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { toast } from "sonner";
import { Copy, Shield, Wallet, RefreshCw, Plus, ExternalLink, Loader2, Star, Trash2, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type WalletKeys = {
    publicKey: string;
    secretKey: string;
};

type WalletType = {
    id: string;
    customerId: string;
    currency: string;
    network: string;
    balance: string;
    externalAddress: string;
    createdAt: string;
    updatedAt: string;
    label?: string;
    isMain?: boolean;
};

type NetworkType = "SOLANA" | "TRON";

const NETWORKS: { id: NetworkType; name: string; icon: string; color: string }[] = [
    { id: "SOLANA", name: "Solana", icon: "◎", color: "text-green-600 dark:text-green-400 bg-green-500/20" },
    { id: "TRON", name: "Tron (TRC20)", icon: "◈", color: "text-red-600 dark:text-red-400 bg-red-500/20" },
];

function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) return err.response?.data?.message || fallback;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
}

export default function WalletPage() {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [creating, setCreating] = useState(false);
    const [walletKeys, setWalletKeys] = useState<WalletKeys | null>(null);
    const [editWallet, setEditWallet] = useState<WalletType | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [deleteWallet, setDeleteWallet] = useState<WalletType | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addMode, setAddMode] = useState<"create" | "import">("create");
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>("SOLANA");
    const [importAddress, setImportAddress] = useState("");
    const [importLabel, setImportLabel] = useState("");
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, []);

    async function fetchWallets() {
        setLoadingWallets(true);
        try {
            const res = await http.get<WalletType[]>("/wallet");
            setWallets(res.data);
        } catch {
            setWallets([]);
        } finally {
            setLoadingWallets(false);
        }
    }

    async function syncAllWallets() {
        try {
            await http.post("/wallet/sync-all");
            await fetchWallets();
            toast.success("Saldos sincronizados!");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao sincronizar saldos"));
        }
    }

    async function syncWallet(walletId: string) {
        try {
            await http.post(`/wallet/${walletId}/sync`);
            await fetchWallets();
            toast.success("Saldo atualizado!");
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao sincronizar saldo"));
        }
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
                } else {
                    toast.error(data?.message || "Erro ao criar carteira.");
                }
            } else {
                toast.error(res.data?.message || "Erro ao criar carteira.");
            }
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao criar carteira."));
        } finally {
            setCreating(false);
        }
    }

    async function handleImportWallet() {
        if (!importAddress.trim()) {
            toast.error("Digite o endereço da carteira");
            return;
        }
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
                setImportAddress("");
                setImportLabel("");
                fetchWallets();
            } else {
                toast.error(res.data?.message || "Erro ao adicionar carteira.");
            }
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao adicionar carteira."));
        } finally {
            setImporting(false);
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

    async function handleSaveLabel() {
        if (!editWallet) return;
        try {
            await http.patch(`/wallet/${editWallet.id}/label`, { label: editLabel });
            toast.success("Carteira renomeada!");
            setEditWallet(null);
            fetchWallets();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao renomear carteira."));
        }
    }

    async function handleSetMain(wallet: WalletType) {
        try {
            await http.patch(`/wallet/${wallet.id}/set-main`);
            toast.success("Carteira definida como principal!");
            fetchWallets();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao definir carteira principal."));
        }
    }

    async function handleDeleteWallet() {
        if (!deleteWallet) return;
        setDeleting(true);
        try {
            await http.delete(`/wallet/${deleteWallet.id}`);
            toast.success("Carteira excluída!");
            setDeleteWallet(null);
            fetchWallets();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao excluir carteira."));
        } finally {
            setDeleting(false);
        }
    }

    function formatAddress(address: string) {
        if (address.length <= 16) return address;
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    }

    function getExplorerUrl(wallet: WalletType) {
        if (wallet.network === "TRON") {
            return `https://tronscan.org/#/address/${wallet.externalAddress}`;
        }
        return `https://solscan.io/account/${wallet.externalAddress}`;
    }

    function getExplorerName(wallet: WalletType) {
        return wallet.network === "TRON" ? "Tronscan" : "Solscan";
    }

    function openAddModal() {
        setShowAddModal(true);
        setAddMode("create");
        setSelectedNetwork("SOLANA");
        setImportAddress("");
        setImportLabel("");
    }

    if (loadingWallets) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                <p className="text-sm text-muted-foreground mt-4">Carregando carteiras...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Carteiras</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gerencie suas carteiras USDT (Solana e Tron)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={syncAllWallets}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sincronizar Saldos
                    </Button>
                    <Button
                        onClick={openAddModal}
                        className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Carteira
                    </Button>
                </div>
            </div>

            {wallets.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <div className="p-4 rounded-full bg-[#6F00FF]/50/20 inline-block mb-4">
                        <Wallet className="w-8 h-8 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Nenhuma carteira encontrada
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Adicione sua primeira carteira para receber USDT. Você pode criar uma nova ou importar uma existente.
                    </p>
                    <Button
                        onClick={openAddModal}
                        className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold px-8"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Carteira
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {wallets.map((wallet, index) => {
                        const networkInfo = NETWORKS.find(n => n.id === wallet.network) || NETWORKS[0];
                        return (
                            <div
                                key={wallet.id}
                                className={`bg-card border rounded-2xl p-5 transition ${wallet.isMain
                                    ? "border-[#6F00FF]/50/50 shadow-lg shadow-[#6F00FF]/50/10"
                                    : "border-border hover:border-[#6F00FF]/50/30"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${wallet.isMain
                                            ? "bg-linear-to-br from-[#6F00FF]/50/30 to-[#6F00FF]/30"
                                            : "bg-linear-to-br from-[#6F00FF]/50/20 to-[#6F00FF]/20"
                                            }`}>
                                            <Wallet className="w-6 h-6 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-foreground font-semibold">
                                                    {wallet.label || `Carteira ${index + 1}`}
                                                </span>
                                                {wallet.isMain && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-[#6F00FF]/50/20 text-[#6F00FF] dark:text-[#6F00FF] rounded-full flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        Principal
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${networkInfo.color}`}>
                                                    {networkInfo.icon} {wallet.network || "SOLANA"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-muted-foreground text-sm font-mono">
                                                    {formatAddress(wallet.externalAddress)}
                                                </code>
                                                <button
                                                    onClick={() => onCopy(wallet.externalAddress)}
                                                    className="p-1 hover:bg-accent rounded transition"
                                                >
                                                    <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-foreground">
                                                {Number(wallet.balance).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 4,
                                                })}
                                                <span className="text-muted-foreground text-base ml-1">USDT</span>
                                            </p>
                                            <p className="text-muted-foreground text-xs mt-1">
                                                Criada em {new Date(wallet.createdAt).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card border-border">
                                                <DropdownMenuItem
                                                    onClick={() => syncWallet(wallet.id)}
                                                    className="text-foreground/70 hover:text-foreground hover:bg-accent cursor-pointer"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Sincronizar Saldo
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onCopy(wallet.externalAddress)}
                                                    className="text-foreground/70 hover:text-foreground hover:bg-accent cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copiar Endereço
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(wallet)}
                                                    className="text-foreground/70 hover:text-foreground hover:bg-accent cursor-pointer"
                                                >
                                                    Renomear
                                                </DropdownMenuItem>
                                                {!wallet.isMain && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleSetMain(wallet)}
                                                        className="text-foreground/70 hover:text-foreground hover:bg-accent cursor-pointer"
                                                    >
                                                        <Star className="w-4 h-4 mr-2" />
                                                        Definir como Principal
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => window.open(getExplorerUrl(wallet), "_blank")}
                                                    className="text-foreground/70 hover:text-foreground hover:bg-accent cursor-pointer"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Ver no {getExplorerName(wallet)}
                                                </DropdownMenuItem>
                                                {!wallet.isMain && wallets.length > 1 && (
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteWallet(wallet)}
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Excluir Carteira
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-sm">Importante</p>
                    <p className="text-muted-foreground text-sm mt-1">
                        Envie <strong className="text-foreground">apenas USDT</strong> na rede correta (Solana SPL ou Tron TRC20).
                        Envios em redes diferentes serão perdidos permanentemente.
                    </p>
                </div>
            </div>

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="bg-card border border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Adicionar Carteira</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Escolha a rede e como deseja adicionar sua carteira
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5">
                        <div>
                            <Label className="text-muted-foreground mb-2 block">Rede</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {NETWORKS.map((network) => (
                                    <button
                                        key={network.id}
                                        onClick={() => setSelectedNetwork(network.id)}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition ${selectedNetwork === network.id
                                            ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/20"
                                            : "border-border bg-muted hover:border-border"
                                            }`}
                                    >
                                        <span className="text-xl">{network.icon}</span>
                                        <span className="text-foreground font-medium">{network.name}</span>
                                        {selectedNetwork === network.id && (
                                            <Check className="w-4 h-4 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground mb-2 block">Tipo</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setAddMode("create")}
                                    className={`p-4 rounded-xl border transition text-left ${addMode === "create"
                                        ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/20"
                                        : "border-border bg-muted hover:border-border"
                                        }`}
                                >
                                    <p className="text-foreground font-medium">Criar Nova</p>
                                    <p className="text-muted-foreground text-xs mt-1">Gerar carteira automaticamente</p>
                                </button>
                                <button
                                    onClick={() => setAddMode("import")}
                                    className={`p-4 rounded-xl border transition text-left ${addMode === "import"
                                        ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/20"
                                        : "border-border bg-muted hover:border-border"
                                        }`}
                                >
                                    <p className="text-foreground font-medium">Importar</p>
                                    <p className="text-muted-foreground text-xs mt-1">Usar carteira existente</p>
                                </button>
                            </div>
                        </div>

                        {addMode === "import" && (
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-muted-foreground">Endereço da Carteira</Label>
                                    <Input
                                        value={importAddress}
                                        onChange={(e) => setImportAddress(e.target.value)}
                                        placeholder={selectedNetwork === "SOLANA" ? "Ex: 7xKXt..." : "Ex: TJYs..."}
                                        className="border-border bg-background text-foreground mt-1 font-mono"
                                    />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Nome (opcional)</Label>
                                    <Input
                                        value={importLabel}
                                        onChange={(e) => setImportLabel(e.target.value)}
                                        placeholder="Ex: Minha Carteira Binance"
                                        className="border-border bg-background text-foreground mt-1"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 bg-muted border border-border text-foreground hover:bg-accent"
                            >
                                Cancelar
                            </Button>
                            {addMode === "create" ? (
                                <Button
                                    onClick={handleCreateWallet}
                                    disabled={creating}
                                    className="flex-1 bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        "Criar Carteira"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleImportWallet}
                                    disabled={importing || !importAddress.trim()}
                                    className="flex-1 bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        "Importar Carteira"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!walletKeys} onOpenChange={() => setWalletKeys(null)}>
                <DialogContent className="bg-card border border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Carteira Criada!</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mb-1">Atenção!</p>
                            <p className="text-muted-foreground text-sm">
                                Salve sua chave privada em local seguro. Ela <strong className="text-foreground">não será armazenada</strong> pelo OtsemPay.
                            </p>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Chave Pública</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    readOnly
                                    value={walletKeys?.publicKey || ""}
                                    className="border-border bg-muted text-foreground font-mono text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onCopy(walletKeys?.publicKey)}
                                    className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Chave Privada</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    readOnly
                                    value={walletKeys?.secretKey || ""}
                                    className="border-border bg-muted text-foreground font-mono text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onCopy(walletKeys?.secretKey)}
                                    className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={() => setWalletKeys(null)}
                            className="w-full bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold mt-2"
                        >
                            Já salvei minha chave privada
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editWallet} onOpenChange={() => setEditWallet(null)}>
                <DialogContent className="bg-card border border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Renomear Carteira</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">Endereço</Label>
                            <Input
                                readOnly
                                value={editWallet?.externalAddress || ""}
                                className="border-border bg-muted text-muted-foreground font-mono text-sm mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-muted-foreground">Nome da Carteira</Label>
                            <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                placeholder="Ex: Carteira Principal"
                                className="border-border bg-background text-foreground mt-1"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditWallet(null)}
                                className="flex-1 bg-muted border border-border text-foreground hover:bg-accent"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveLabel}
                                className="flex-1 bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold"
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteWallet} onOpenChange={() => setDeleteWallet(null)}>
                <AlertDialogContent className="bg-card border border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Excluir Carteira</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Tem certeza que deseja excluir esta carteira? Esta ação não pode ser desfeita.
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                                <code className="text-muted-foreground text-sm font-mono">
                                    {deleteWallet?.externalAddress}
                                </code>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted border border-border text-foreground hover:bg-accent">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteWallet}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            {deleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
