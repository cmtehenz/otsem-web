// src/app/(app)/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Wallet } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type AccountSummary = {
    id: string;
    balance: number;
    status: string;
    pixKey: string;
    pixKeyType: string;
    dailyLimit: number;
    monthlyLimit: number;
    blockedAmount: number;
    createdAt: string;
    updatedAt: string;
    payments: Payment[];
};

type Payment = {
    id: string;
    paymentValue: number;
    paymentDate: string;
    receiverPixKey: string;
    endToEnd: string;
    bankPayload: BankPayload;
};

type BankPayload = {
    valor: string;
    titulo: string;
    detalhes: {
        txId: string;
        endToEndId: string;
        nomePagador: string;
        tipoDetalhe: string;
        descricaoPix: string;
        cpfCnpjPagador: string;
        chavePixRecebedor: string;
        nomeEmpresaPagador: string;
    };
    descricao: string;
    idTransacao: string;
    dataInclusao: string;
    tipoOperacao: string;
    dataTransacao: string;
    tipoTransacao: string;
    numeroDocumento: string;
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

function getValueColor(value: number) {
    if (value > 0) return "text-blue-600";
    if (value < 0) return "text-red-600";
    return "text-[#000000]";
}

function formatCurrency(value: number, decimals = 2): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);
    const [wallets, setWallets] = React.useState<Wallet[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(true);
    const [usdtBalance, setUsdtBalance] = React.useState<number | null>(null);
    const [usdtBalanceLoading, setUsdtBalanceLoading] = React.useState(true);

    const { rate: usdtRate, loading: usdtLoading, updatedAt } = useUsdtRate();
    const [timer, setTimer] = React.useState(15);

    const customerSpread = user?.spreadValue ?? 0.95;

    // Cotação USDT com spread
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;


    React.useEffect(() => {
        setTimer(15); // reinicia o timer quando updatedAt muda
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [updatedAt]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                const customerId = user?.id;
                if (!customerId) {
                    toast.error("Usuário não encontrado");
                    return;
                }

                const res = await http.get<AccountSummary>(
                    `/accounts/${customerId}/summary`
                );
                if (!cancelled) setAccount(res.data);

            } catch (err: any) {
                if (!cancelled) {
                    console.error(err);
                    toast.error("Falha ao carregar dados da conta");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // Buscar carteiras do usuário
    React.useEffect(() => {
        async function fetchWallets() {
            setWalletsLoading(true);
            try {
                const res = await http.get<Wallet[]>("/wallet/usdt");
                setWallets(res.data);
            } catch (err) {
                setWallets([]);
            } finally {
                setWalletsLoading(false);
            }
        }
        fetchWallets();
    }, []);

    // Buscar saldo USDT da carteira Solana principal
    React.useEffect(() => {
        async function fetchUsdtBalance() {
            setUsdtBalanceLoading(true);
            try {
                const solanaAddress = wallets[0]?.externalAddress;
                if (solanaAddress) {
                    const res = await http.get(
                        `/wallet/solana-usdt-balance?address=${solanaAddress}`
                    );
                    setUsdtBalance(res.data);
                } else {
                    setUsdtBalance(null);
                }
            } catch (err) {
                setUsdtBalance(null);
            } finally {
                setUsdtBalanceLoading(false);
            }
        }
        if (wallets.length > 0) fetchUsdtBalance();
    }, [wallets]);

    // Saldo em reais (já vem do usuário)
    const saldoBRL = account?.balance ?? 0;
    // Saldo em USDT (convertido)
    const saldoUsdt = account && usdtRate ? account.balance / usdtRate : 0;

    // Modal compra USDT
    const [showBuyModal, setShowBuyModal] = React.useState(false);
    const [buyValue, setBuyValue] = React.useState(10);
    const minValue = 10;

    // Usar usdtRateWithSpread para calcular o valor de USDT na compra
    const usdtAmount = usdtRateWithSpread ? buyValue / usdtRateWithSpread : 0;

    async function handleBuyUsdt(e: React.FormEvent) {
        e.preventDefault();
        if (buyValue < minValue || !usdtRate) {
            toast.error("Valor mínimo não atingido ou cotação indisponível.");
            return;
        }
        try {
            // Exemplo de chamada para API real:
            // const res = await http.post("/wallet/buy-usdt", {
            //     amountBRL: buyValue,
            //     amountUSDT: usdtAmount,
            //     walletAddress: wallets[0]?.externalAddress,
            // });
            // if (res.data.success) {
            //     toast.success("Compra de USDT realizada com sucesso!");
            // } else {
            //     toast.error(res.data.message || "Erro ao comprar USDT.");
            // }

            // Simulação:
            toast.success(
                `Compra de USDT solicitada: R$ ${buyValue} ≈ ${usdtAmount.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USDT`
            );
            setShowBuyModal(false);
            setBuyValue(minValue);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao comprar USDT"
            );
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center bg-[#faffff]">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#b852ff]" />
                <p className="text-sm text-[#b852ff]">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 min-h-screen bg-[#faffff]">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#000000]">Dashboard</h1>
                    <p className="text-sm text-[#000000] opacity-70">
                        Saldo e cotação USDT da sua conta.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        className="gap-2 text-[#b852ff] hover:bg-[#f8bc07]/20"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {/* Cards de saldo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Saldo BRL */}
                <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#000000] flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#b852ff]" />
                            Saldo em Reais (BRL)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#b852ff]">
                            {formatCurrency(saldoBRL)}
                        </div>
                        <div className="mt-2 text-xs text-[#000000] opacity-60">
                            {account?.updatedAt ? `Atualizado em: ${new Date(account.updatedAt).toLocaleString("pt-BR")}` : "--"}
                        </div>
                    </CardContent>
                </Card>
                {/* Saldo USDT */}
                <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#000000] flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#f8bc07]" />
                            Saldo em USDT
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-[#b852ff]">
                            {usdtBalanceLoading
                                ? <Loader2 className="inline-block animate-spin mr-2" />
                                : typeof usdtBalance === "number"
                                    ? usdtBalance.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + " USDT"
                                    : "..."}
                        </div>
                        <div className="mt-2 text-xs text-[#000000] opacity-60">
                            {wallets[0]?.externalAddress
                                ? `Endereço: ${wallets[0].externalAddress}`
                                : "Nenhuma carteira Solana encontrada"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Card Cotação USDT + Botão Comprar */}
            <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30 mb-6">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-[#000000] flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#b852ff]" />
                        Cotação USDT
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <div className="text-3xl font-bold text-blue-600">
                                {usdtLoading ? "..." : formatCurrency(usdtRateWithSpread ?? 0, 4)}
                            </div>
                            <div className="mt-2 text-xs text-[#000000] opacity-60">
                                Atualização em {timer}s
                            </div>
                        </div>
                        <Button
                            className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition font-semibold"
                            size="lg"
                            onClick={() => setShowBuyModal(true)}
                        >
                            Comprar USDT
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de compra USDT */}
            <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
                <DialogContent className="bg-[#faffff] border border-[#b852ff]/10">
                    <DialogHeader>
                        <DialogTitle className="text-[#b852ff]">Comprar USDT</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBuyUsdt} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[#000000]">
                                Valor em reais (mínimo R$ 10,00)
                            </label>
                            <Input
                                type="number"
                                min={minValue}
                                step={0.01}
                                value={buyValue}
                                onChange={e => setBuyValue(Number(e.target.value))}
                                className="border-[#b852ff]/30 bg-[#faffff] text-[#000000]"
                                required
                            />
                        </div>
                        <div className="text-sm text-[#000000]">
                            Você receberá: <span className="font-bold text-[#b852ff]">
                                {usdtRateWithSpread ? usdtAmount.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "--"} USDT
                            </span>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowBuyModal(false)}
                                className="border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={buyValue < minValue || !usdtRate}
                                className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                            >
                                Comprar USDT
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Histórico de transações Pix */}
            <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30">
                <CardHeader>
                    <CardTitle className="text-[#b852ff] font-semibold text-base">Histórico Pix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-[#f8bc07]/10 z-10">
                                <TableRow>
                                    <TableHead className="text-[#000000] font-semibold">Data</TableHead>
                                    <TableHead className="text-[#000000] font-semibold">Valor</TableHead>
                                    <TableHead className="text-[#000000] font-semibold">Pagador</TableHead>
                                    <TableHead className="text-[#000000] font-semibold">Banco</TableHead>
                                    <TableHead className="text-[#000000] font-semibold">Descrição</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {account?.payments && account.payments.length > 0 ? (
                                    account.payments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                {new Date(p.paymentDate).toLocaleString("pt-BR")}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${getValueColor(Number(p.bankPayload.valor))}`}>
                                                    {formatCurrency(Number(p.bankPayload.valor))}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {p.bankPayload.detalhes.nomePagador}
                                            </TableCell>
                                            <TableCell>
                                                {p.bankPayload.detalhes.nomeEmpresaPagador}
                                            </TableCell>
                                            <TableCell>
                                                {p.bankPayload.titulo}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-sm text-[#b852ff] py-8">
                                            Nenhuma transação Pix encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-[#b852ff] opacity-70">
                OtsemBank — MVP • UI preview
            </p>
        </div>
    );
}
