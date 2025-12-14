"use client";

import * as React from "react";
import { Loader2, Wallet, ArrowDownLeft, ArrowRightLeft, ArrowUpRight, TrendingUp, RefreshCw } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useUsdtRate } from "@/lib/useUsdtRate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUiModals } from "@/stores/ui-modals";

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

function formatCurrency(value: number, decimals = 2): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatUSD(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
        return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Ontem, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    }
}

export default function Dashboard() {
    const { user } = useAuth();
    const { openModal } = useUiModals();
    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
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

                const customerId = user?.customerId;
                if (!customerId) {
                    return;
                }

                const res = await http.get<AccountSummary>(
                    `/accounts/${customerId}/summary`
                );
                if (!cancelled) setAccount(res.data);

            } catch (err: any) {
                if (!cancelled) {
                    console.error(err);
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
            try {
                const res = await http.get<WalletType[]>("/wallet");
                setWallets(res.data);
            } catch (err) {
                setWallets([]);
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
    const saldoUSDT = usdtBalance ?? 0;
    const saldoTotal = saldoBRL + (saldoUSDT * usdtRateWithSpread);

    const [showConvertModal, setShowConvertModal] = React.useState(false);
    const [convertValue, setConvertValue] = React.useState(100);
    const minValue = 10;

    const usdtAmount = usdtRateWithSpread ? convertValue / usdtRateWithSpread : 0;

    async function handleConvert(e: React.FormEvent) {
        e.preventDefault();
        if (convertValue < minValue || !usdtRate) {
            toast.error("Valor mínimo não atingido ou cotação indisponível.");
            return;
        }
        toast.success(
            `Conversão solicitada: R$ ${convertValue} → ${usdtAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        );
        setShowConvertModal(false);
        setConvertValue(100);
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Loader2 className="relative h-10 w-10 animate-spin text-violet-400" />
                </div>
                <p className="text-sm text-white/60 mt-4">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-white/50 text-sm mt-1">Gerencie seu saldo e transações</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => window.location.reload()}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 shadow-xl shadow-violet-500/20">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-white/80 text-sm">Saldo total estimado</p>
                    <Wallet className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-4xl font-bold text-white mb-6">
                    {formatCurrency(saldoTotal)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <p className="text-white/60 text-xs mb-1">BRL</p>
                        <p className="text-white font-bold text-xl">{formatCurrency(saldoBRL)}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <p className="text-white/60 text-xs mb-1">USDT</p>
                        <p className="text-white font-bold text-xl">
                            {usdtBalanceLoading ? "..." : formatUSD(saldoUSDT)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => setShowConvertModal(true)}
                    className="bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl py-6 text-base"
                >
                    <ArrowRightLeft className="w-5 h-5 mr-2" />
                    Converter
                </Button>
                <Button
                    onClick={() => openModal("deposit")}
                    className="bg-[#1a1025] border border-white/10 hover:bg-[#2a2035] text-white font-semibold rounded-xl py-6 text-base"
                >
                    <ArrowDownLeft className="w-5 h-5 mr-2" />
                    Depositar
                </Button>
            </div>

            <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-400" />
                        <span className="text-white/60 text-sm">Cotação USDT</span>
                    </div>
                    <span className="text-xs text-white/40">Atualiza em {timer}s</span>
                </div>
                <p className="text-2xl font-bold text-white">
                    {usdtLoading ? "..." : formatCurrency(usdtRateWithSpread, 4)}
                </p>
            </div>

            <div className="bg-[#1a1025] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-white font-semibold">Últimas transações</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {account?.payments && account.payments.length > 0 ? (
                        account.payments.slice(0, 6).map((p) => {
                            const value = Number(p.bankPayload.valor);
                            const isPositive = value > 0;
                            
                            return (
                                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition">
                                    <div className={`p-2.5 rounded-full ${isPositive ? "bg-green-500/20" : "bg-violet-500/20"}`}>
                                        {isPositive ? (
                                            <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4 text-violet-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {p.bankPayload.titulo || "Depósito PIX"}
                                        </p>
                                        <p className="text-white/40 text-sm">
                                            {formatDate(p.paymentDate)}
                                        </p>
                                    </div>
                                    <span className={`font-bold ${isPositive ? "text-green-400" : "text-white"}`}>
                                        {isPositive ? "+" : ""}{formatCurrency(value)}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12">
                            <div className="p-4 rounded-full bg-white/5 inline-block mb-3">
                                <ArrowDownLeft className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-white/40">Nenhuma transação encontrada</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
                <DialogContent className="bg-[#1a1025] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Converter BRL → USDT</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleConvert} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/70">
                                Valor em BRL
                            </label>
                            <Input
                                type="number"
                                min={minValue}
                                step={0.01}
                                value={convertValue}
                                onChange={e => setConvertValue(Number(e.target.value))}
                                className="border-white/10 bg-white/5 text-white rounded-xl"
                                required
                            />
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-white/60">Você receberá:</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">
                                {usdtRateWithSpread ? formatUSD(usdtAmount) : "--"} USDT
                            </p>
                            <p className="text-xs text-white/40 mt-2">
                                Cotação: {formatCurrency(usdtRateWithSpread, 4)} / USDT
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowConvertModal(false)}
                                className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={convertValue < minValue || !usdtRate}
                                className="flex-1 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl"
                            >
                                Converter
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
