"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
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

type WalletType = {
    id: string;
    customerId: string;
    currency: string;
    balance: string;
    externalAddress: string;
    createdAt: string;
    updatedAt: string;
};

function getValueColor(value: number) {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-white";
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
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [walletsLoading, setWalletsLoading] = React.useState(true);
    const [usdtBalance, setUsdtBalance] = React.useState<number | null>(null);
    const [usdtBalanceLoading, setUsdtBalanceLoading] = React.useState(true);

    const { rate: usdtRate, loading: usdtLoading, updatedAt } = useUsdtRate();
    const [timer, setTimer] = React.useState(15);

    const customerSpread = user?.spreadValue ?? 0.95;
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;

    React.useEffect(() => {
        setTimer(15);
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

    React.useEffect(() => {
        async function fetchWallets() {
            setWalletsLoading(true);
            try {
                const res = await http.get<WalletType[]>("/wallet/usdt");
                setWallets(res.data);
            } catch (err) {
                setWallets([]);
            } finally {
                setWalletsLoading(false);
            }
        }
        fetchWallets();
    }, []);

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

    const saldoBRL = account?.balance ?? 0;
    const saldoUsdt = account && usdtRate ? account.balance / usdtRate : 0;

    const [showBuyModal, setShowBuyModal] = React.useState(false);
    const [buyValue, setBuyValue] = React.useState(10);
    const minValue = 10;

    const usdtAmount = usdtRateWithSpread ? buyValue / usdtRateWithSpread : 0;

    async function handleBuyUsdt(e: React.FormEvent) {
        e.preventDefault();
        if (buyValue < minValue || !usdtRate) {
            toast.error("Valor mínimo não atingido ou cotação indisponível.");
            return;
        }
        try {
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
            <div className="flex h-96 flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader2 className="relative mb-4 h-10 w-10 animate-spin text-violet-400" />
                </div>
                <p className="text-sm text-white/60 mt-4">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 min-h-screen">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                        <p className="text-sm text-white/50 mt-1">
                            Gerencie seu saldo e acompanhe a cotação USDT em tempo real
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        className="gap-2 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full blur-2xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <Wallet className="w-4 h-4 text-green-400" />
                                </div>
                                Saldo em Reais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {formatCurrency(saldoBRL)}
                            </div>
                            <div className="mt-3 text-xs text-white/40">
                                {account?.updatedAt ? `Atualizado: ${new Date(account.updatedAt).toLocaleString("pt-BR")}` : "--"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-2xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Wallet className="w-4 h-4 text-amber-400" />
                                </div>
                                Saldo em USDT
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {usdtBalanceLoading
                                    ? <Loader2 className="inline-block animate-spin text-violet-400" />
                                    : typeof usdtBalance === "number"
                                        ? usdtBalance.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + " USDT"
                                        : "0.0000 USDT"}
                            </div>
                            <div className="mt-3 text-xs text-white/40 truncate">
                                {wallets[0]?.externalAddress
                                    ? `${wallets[0].externalAddress.slice(0, 12)}...${wallets[0].externalAddress.slice(-8)}`
                                    : "Nenhuma carteira encontrada"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden md:col-span-2 lg:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-full blur-2xl"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/60 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-violet-500/20">
                                    <TrendingUp className="w-4 h-4 text-violet-400" />
                                </div>
                                Cotação USDT/BRL
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-white">
                                        {usdtLoading ? "..." : formatCurrency(usdtRateWithSpread ?? 0, 4)}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-white/40">
                                            Atualiza em {timer}s
                                        </span>
                                        <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000"
                                                style={{ width: `${(timer / 15) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25"
                                    onClick={() => setShowBuyModal(true)}
                                >
                                    Comprar USDT
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
                    <DialogContent className="bg-[#0a0118] border border-white/10 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-white text-xl">Comprar USDT</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBuyUsdt} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/70">
                                    Valor em reais (mínimo R$ 10,00)
                                </label>
                                <Input
                                    type="number"
                                    min={minValue}
                                    step={0.01}
                                    value={buyValue}
                                    onChange={e => setBuyValue(Number(e.target.value))}
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-white/60">Você receberá aproximadamente:</p>
                                <p className="text-2xl font-bold text-violet-400 mt-1">
                                    {usdtRateWithSpread ? usdtAmount.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : "--"} USDT
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowBuyModal(false)}
                                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5 hover:text-white rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={buyValue < minValue || !usdtRate}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
                                >
                                    Confirmar Compra
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                                <ArrowDownLeft className="w-4 h-4 text-violet-400" />
                            </div>
                            Histórico de Transações Pix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-white/50 font-medium">Data</TableHead>
                                        <TableHead className="text-white/50 font-medium">Valor</TableHead>
                                        <TableHead className="text-white/50 font-medium">Pagador</TableHead>
                                        <TableHead className="text-white/50 font-medium">Banco</TableHead>
                                        <TableHead className="text-white/50 font-medium">Descrição</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {account?.payments && account.payments.length > 0 ? (
                                        account.payments.map((p) => (
                                            <TableRow key={p.id} className="border-white/5 hover:bg-white/5">
                                                <TableCell className="text-white/70">
                                                    {new Date(p.paymentDate).toLocaleString("pt-BR")}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-bold ${getValueColor(Number(p.bankPayload.valor))}`}>
                                                        {formatCurrency(Number(p.bankPayload.valor))}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-white/70">
                                                    {p.bankPayload.detalhes.nomePagador}
                                                </TableCell>
                                                <TableCell className="text-white/70">
                                                    {p.bankPayload.detalhes.nomeEmpresaPagador}
                                                </TableCell>
                                                <TableCell className="text-white/70">
                                                    {p.bankPayload.titulo}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={5} className="text-center text-sm text-white/40 py-12">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="p-4 rounded-full bg-white/5">
                                                        <ArrowDownLeft className="w-6 h-6 text-white/20" />
                                                    </div>
                                                    <p>Nenhuma transação Pix encontrada</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-xs text-white/30">
                    OtsemPay — Sua plataforma de pagamentos digitais
                </p>
            </div>
        </div>
    );
}
