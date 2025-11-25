"use client";

import React, { useState, useEffect } from "react";
import http from "@/lib/http";
import { toast } from "sonner";
import { Copy, Shield, Wallet, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type WalletKeys = {
    publicKey: string;
    secretKey: string;
};

type Wallet = {
    id: string;
    customerId: string;
    currency: string;
    balance: string;
    externalAddress: string;
    createdAt: string;
    updatedAt: string;
};


export default function SolanaWalletPage() {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [creating, setCreating] = useState(false);
    const [walletKeys, setWalletKeys] = useState<WalletKeys | null>(null);
    const [editWallet, setEditWallet] = useState<Wallet | null>(null);
    const [editLabel, setEditLabel] = useState("");

    useEffect(() => {
        async function fetchWallets() {
            setLoadingWallets(true);
            try {
                const res = await http.get<Wallet[]>("/wallet/usdt");
                setWallets(res.data);
            } catch (err) {
                setWallets([]);
                console.error("Erro ao buscar carteiras:", err);
            } finally {
                setLoadingWallets(false);
            }
        }
        fetchWallets();
    }, []);

    async function handleCreateWallet() {
        setCreating(true);
        try {
            const res = await http.post("/wallet/create-solana");

            // Verifica se a resposta tem os dados esperados
            if (
                (res.status === 200 || res.status === 201) &&
                res.data &&
                typeof res.data.publicKey === "string" &&
                typeof res.data.secretKey === "string" &&
                res.data.wallet
            ) {
                const { publicKey, secretKey, wallet } = res.data;
                setWalletKeys({ publicKey, secretKey });
                toast.success("Carteira Solana criada com sucesso!");
                setWallets((prev) => [wallet, ...prev]);
            } else {
                toast.error(res.data?.message || "Erro ao criar carteira.");
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao criar carteira."
            );
        } finally {
            setCreating(false);
        }
    }

    async function onCopy(text?: string) {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência");
    }

    // Endereço principal (primeira carteira)
    const mainWallet = wallets && wallets.length > 0 ? wallets[0] : null;

    // Atualiza as carteiras sempre que o modal de chaves é fechado
    useEffect(() => {
        if (!walletKeys) {
            // Atualiza a lista de carteiras
            const fetchWallets = async () => {
                try {
                    const res = await http.get<Wallet[]>("/wallet/usdt");
                    setWallets(res.data);
                } catch (err) {
                    console.error("Erro ao buscar carteiras:", err);
                }
            };
            fetchWallets();
        }
    }, [walletKeys]);

    // Função para atualizar as carteiras manualmente
    async function refreshWallets() {
        setLoadingWallets(true);
        try {
            const res = await http.get<Wallet[]>("/wallet/usdt");
            setWallets(res.data);
            console.log("wallets:", res.data);
        } catch (err) {
            setWallets([]);
            console.error("Erro ao buscar carteiras:", err);
        } finally {
            setLoadingWallets(false);
        }
    }

    // Função para abrir o modal de edição
    function handleEdit(wallet: Wallet) {
        setEditWallet(wallet);
        setEditLabel(""); // ou algum campo real, se houver
    }

    // Função para salvar a edição (exemplo: PATCH no backend)
    async function handleSaveEdit() {
        try {
            // Exemplo de PATCH (ajuste para seu backend)
            await http.patch(`/wallet/usdt/${editWallet?.id}`, { label: editLabel });
            toast.success("Carteira atualizada!");
            setEditWallet(null);
            refreshWallets();
        } catch {
            toast.error("Erro ao editar carteira.");
        }
    }

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[#b852ff]">
                        Carteira USDT Solana
                    </h1>
                    <p className="text-sm text-[#000000]/70">
                        Receba USDT (SPL) diretamente na sua carteira Otsem. Se ainda
                        não possui uma carteira, crie agora!
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={refreshWallets}
                        className="gap-2 text-[#b852ff] hover:bg-[#f8bc07]/20"
                    >
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                    <Link href="/dashboard">
                        <Button
                            variant="outline"
                            className="gap-2 border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff]"
                        >
                            <Wallet className="size-4" /> Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-2xl bg-[#faffff] border border-[#b852ff]/20">
                <CardHeader>
                    <CardTitle className="text-[#b852ff]">
                        Endereço Solana (SPL)
                    </CardTitle>
                    <CardDescription>
                        Receba USDT na rede Solana. Endereços são base58.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!mainWallet ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <p className="text-sm text-[#000000]">
                                Você ainda não possui uma carteira Solana.
                            </p>
                            <Button
                                onClick={handleCreateWallet}
                                disabled={creating}
                                className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition font-semibold"
                            >
                                <Plus className="size-4 mr-2" />
                                {creating
                                    ? "Criando..."
                                    : "Criar Carteira Solana"}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Label>Endereço de depósito USDT (SPL)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input readOnly value={mainWallet.externalAddress} />
                                <Button
                                    variant="secondary"
                                    onClick={() => onCopy(mainWallet.externalAddress)}
                                    className="shrink-0"
                                >
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                            <div className="mt-2 text-xs text-[#000000]/70">
                                Padrão de rede:{" "}
                                <Badge variant="secondary">SPL</Badge>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Tabela de wallets reais */}
            <Card className="rounded-2xl bg-[#faffff] border border-[#b852ff]/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#b852ff]">
                        Carteiras USDT Solana
                    </CardTitle>
                    <CardDescription>
                        Veja suas carteiras USDT na rede Solana.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#b852ff]/10">
                                <th className="text-left px-2 py-2 text-[#000000]">
                                    Endereço
                                </th>
                                <th className="text-left px-2 py-2 text-[#000000]">
                                    Saldo
                                </th>
                                <th className="text-left px-2 py-2 text-[#000000]">
                                    Criada em
                                </th>
                                <th className="text-left px-2 py-2 text-[#000000]">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingWallets ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center py-6 text-[#000000]/60"
                                    >
                                        Carregando...
                                    </td>
                                </tr>
                            ) : wallets && wallets.length > 0 ? (
                                wallets.map((wallet) => (
                                    <tr key={wallet.id} className="hover:bg-[#b852ff]/5">
                                        <td className="px-2 py-2 font-mono">
                                            {wallet.externalAddress}
                                        </td>
                                        <td className="px-2 py-2">
                                            {Number(wallet.balance)
                                                .toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 4,
                                                })}
                                            {" "}
                                            USDT
                                        </td>
                                        <td className="px-2 py-2">
                                            {new Date(wallet.createdAt).toLocaleString(
                                                "pt-BR"
                                            )}
                                        </td>
                                        <td className="px-2 py-2 flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => onCopy(wallet.externalAddress)}
                                                className="gap-1"
                                            >
                                                <Copy className="size-4" /> Copiar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(wallet)}
                                                className="gap-1 border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff]"
                                            >
                                                Editar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center py-6 text-[#000000]/60"
                                    >
                                        Nenhuma carteira encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Modal para exibir as chaves após criação */}
            {walletKeys && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-[#faffff] rounded-2xl p-6 max-w-md w-full border border-[#b852ff]/20 shadow-lg">
                        <h2 className="text-lg font-bold text-[#b852ff] mb-2">
                            Carteira Solana criada!
                        </h2>
                        <p className="text-sm text-[#000000] mb-4">
                            <b>Salve sua chave privada em local seguro.</b> Ela{" "}
                            <span className="text-[#b852ff] font-semibold">
                                NÃO será armazenada
                            </span>{" "}
                            pelo Otsem.<br />
                            <span className="text-[#f8bc07] font-semibold">
                                Não nos responsabilizamos pela perda da chave privada.
                            </span>
                        </p>
                        <div className="mb-3">
                            <Label>Chave Pública</Label>
                            <Input
                                readOnly
                                value={walletKeys.publicKey}
                                className="mb-2"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onCopy(walletKeys.publicKey)}
                            >
                                <Copy className="size-4" /> Copiar Pública
                            </Button>
                        </div>
                        <div className="mb-3">
                            <Label>Chave Privada</Label>
                            <Input
                                readOnly
                                value={walletKeys.secretKey}
                                className="mb-2"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onCopy(walletKeys.secretKey)}
                            >
                                <Copy className="size-4" /> Copiar Privada
                            </Button>
                        </div>
                        <Button
                            className="w-full mt-4 bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition font-semibold"
                            onClick={() => setWalletKeys(null)}
                        >
                            Já salvei minha chave privada
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal de edição da carteira */}
            {editWallet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-[#faffff] rounded-2xl p-6 max-w-md w-full border border-[#b852ff]/20 shadow-lg">
                        <h2 className="text-lg font-bold text-[#b852ff] mb-2">
                            Editar Carteira
                        </h2>
                        <div className="mb-3">
                            <Label>Endereço</Label>
                            <Input
                                readOnly
                                value={editWallet.externalAddress}
                                className="mb-2"
                            />
                        </div>
                        <div className="mb-3">
                            <Label>Nome da Carteira</Label>
                            <Input
                                value={editLabel}
                                onChange={e => setEditLabel(e.target.value)}
                                placeholder="Novo nome"
                                className="mb-2"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setEditWallet(null)}
                                className="border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff]"
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-xs text-[#b852ff] flex items-center gap-2">
                <Shield className="size-4" /> Envie{" "}
                <b className="mx-1">apenas USDT</b> na rede Solana (SPL). Envios em
                redes diferentes serão <b className="mx-1">perdidos</b>.
            </div>
        </div>
    );
}
