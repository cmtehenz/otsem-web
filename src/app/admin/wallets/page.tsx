"use client";

import * as React from "react";
import { Loader2, Wallet, RefreshCw, CheckCircle2, XCircle, Copy, MoreHorizontal, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type CryptoWallet = {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    address: string;
    network: "SOLANA" | "TRON";
    label: string | null;
    okxWhitelisted: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type WalletsResponse = {
    data: CryptoWallet[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

function truncateAddress(address: string): string {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

const networkConfig: Record<string, { label: string; className: string }> = {
    SOLANA: { label: "Solana", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-[#8B2FFF]" },
    TRON: { label: "Tron (TRC20)", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function AdminWalletsPage() {
    const [loading, setLoading] = React.useState(true);
    const [wallets, setWallets] = React.useState<CryptoWallet[]>([]);
    const [updating, setUpdating] = React.useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = React.useState<{
        open: boolean;
        wallet: CryptoWallet | null;
        action: "whitelist" | "remove";
    }>({ open: false, wallet: null, action: "whitelist" });

    const loadWallets = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await http.get<WalletsResponse>("/admin/wallets");
            setWallets(response.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar carteiras");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadWallets();
    }, [loadWallets]);

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        toast.success("Endereço copiado!");
    };

    const handleWhitelistToggle = async (wallet: CryptoWallet, whitelisted: boolean) => {
        try {
            setUpdating(wallet.id);
            await http.patch(`/admin/wallets/${wallet.id}/okx-whitelist`, {
                whitelisted,
            });
            setWallets((prev) =>
                prev.map((w) =>
                    w.id === wallet.id ? { ...w, okxWhitelisted: whitelisted } : w
                )
            );
            toast.success(
                whitelisted
                    ? "Carteira marcada como whitelistada"
                    : "Whitelist removida da carteira"
            );
        } catch {
            toast.error("Falha ao atualizar carteira");
        } finally {
            setUpdating(null);
            setConfirmDialog({ open: false, wallet: null, action: "whitelist" });
        }
    };

    const handleToggleActive = async (wallet: CryptoWallet) => {
        try {
            setUpdating(wallet.id);
            await http.patch(`/admin/wallets/${wallet.id}/toggle-active`);
            setWallets((prev) =>
                prev.map((w) =>
                    w.id === wallet.id ? { ...w, isActive: !w.isActive } : w
                )
            );
            toast.success(wallet.isActive ? "Carteira desativada" : "Carteira ativada");
        } catch {
            toast.error("Falha ao atualizar carteira");
        } finally {
            setUpdating(null);
        }
    };

    const openConfirmDialog = (wallet: CryptoWallet, action: "whitelist" | "remove") => {
        setConfirmDialog({ open: true, wallet, action });
    };

    const whitelistedCount = wallets.filter((w) => w.okxWhitelisted).length;
    const activeCount = wallets.filter((w) => w.isActive).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Carteiras USDT</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie as carteiras de cripto dos clientes
                    </p>
                </div>
                <Button variant="outline" onClick={loadWallets} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                            <Wallet className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{wallets.length}</p>
                            <p className="text-xs text-muted-foreground">Total de Carteiras</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{whitelistedCount}</p>
                            <p className="text-xs text-muted-foreground">Whitelistadas (OKX)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                            <Shield className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeCount}</p>
                            <p className="text-xs text-muted-foreground">Ativas</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Carteiras</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : wallets.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">Nenhuma carteira cadastrada</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Endereço</TableHead>
                                        <TableHead>Rede</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead className="text-center">Whitelist OKX</TableHead>
                                        <TableHead className="text-center">Ativa</TableHead>
                                        <TableHead>Cadastro</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wallets.map((wallet) => {
                                        const networkInfo = networkConfig[wallet.network] || networkConfig.SOLANA;

                                        return (
                                            <TableRow key={wallet.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{wallet.customerName || "—"}</p>
                                                        <p className="text-sm text-muted-foreground">{wallet.customerEmail}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <code className="rounded bg-muted px-2 py-1 text-xs">
                                                            {truncateAddress(wallet.address)}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => copyAddress(wallet.address)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${networkInfo.className}`}>
                                                        {networkInfo.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{wallet.label || "—"}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Switch
                                                            checked={wallet.okxWhitelisted}
                                                            disabled={updating === wallet.id}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    openConfirmDialog(wallet, "whitelist");
                                                                } else {
                                                                    openConfirmDialog(wallet, "remove");
                                                                }
                                                            }}
                                                        />
                                                        {wallet.okxWhitelisted ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={wallet.isActive ? "default" : "secondary"}>
                                                        {wallet.isActive ? "Sim" : "Não"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(wallet.createdAt)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => copyAddress(wallet.address)}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                Copiar endereço
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {wallet.okxWhitelisted ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirmDialog(wallet, "remove")}
                                                                    className="text-amber-600"
                                                                >
                                                                    <ShieldOff className="mr-2 h-4 w-4" />
                                                                    Remover da Whitelist
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => openConfirmDialog(wallet, "whitelist")}
                                                                    className="text-green-600"
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    Adicionar à Whitelist
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleActive(wallet)}
                                                                disabled={updating === wallet.id}
                                                            >
                                                                {wallet.isActive ? (
                                                                    <>
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Desativar carteira
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                        Ativar carteira
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmDialog.action === "whitelist"
                                ? "Adicionar à Whitelist OKX?"
                                : "Remover da Whitelist OKX?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.action === "whitelist" ? (
                                <>
                                    <strong>Importante:</strong> Certifique-se de que este endereço já foi
                                    adicionado à whitelist da OKX antes de marcar aqui.
                                    <br /><br />
                                    Endereço: <code className="rounded bg-muted px-1">{confirmDialog.wallet?.address}</code>
                                </>
                            ) : (
                                <>
                                    A carteira não poderá mais receber saques automáticos até ser
                                    adicionada novamente à whitelist.
                                    <br /><br />
                                    Endereço: <code className="rounded bg-muted px-1">{confirmDialog.wallet?.address}</code>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                confirmDialog.wallet &&
                                handleWhitelistToggle(
                                    confirmDialog.wallet,
                                    confirmDialog.action === "whitelist"
                                )
                            }
                            className={
                                confirmDialog.action === "whitelist"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-amber-600 hover:bg-amber-700"
                            }
                        >
                            {confirmDialog.action === "whitelist" ? "Confirmar Whitelist" : "Remover"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
