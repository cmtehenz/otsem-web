"use client";

import * as React from "react";
import { Loader2, RefreshCw, Wallet, ArrowDownLeft, ArrowRightLeft, QrCode, Plus } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
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
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }
}

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);
    const [wallets, setWallets] = React.useState<WalletType[]>([]);
    const [usdtBalance, setUsdtBalance] = React.useState<number | null>(null);
    const [usdtBalanceLoading, setUsdtBalanceLoading] = React.useState(true);

    const { rate: usdtRate, loading: usdtLoading } = useUsdtRate();

    const customerSpread = user?.spreadValue ?? 0.95;
    const usdtRateWithSpread = usdtRate ? usdtRate * (1 + customerSpread / 100) : 0;

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
            try {
                const res = await http.get<WalletType[]>("/wallet/usdt");
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
        <div className="min-h-[80vh] flex flex-col items-center justify-start py-8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-violet-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto px-4">
                <div className="relative mx-auto" style={{ maxWidth: "320px" }}>
                    <div className="absolute -inset-4 bg-gradient-to-b from-violet-500/40 via-purple-500/20 to-transparent rounded-[3rem] blur-xl"></div>
                    
                    <div className="relative bg-[#1a1025] border-4 border-violet-500/50 rounded-[2.5rem] p-6 shadow-2xl shadow-violet-500/20">
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full"></div>
                        
                        <div className="mt-6 space-y-6">
                            <div className="text-center">
                                <p className="text-white/60 text-sm mb-1">Saldo total</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl font-bold text-white">
                                        {formatCurrency(saldoTotal)}
                                    </span>
                                    <button className="p-2 bg-violet-600 rounded-full hover:bg-violet-500 transition">
                                        <Wallet className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#2a2035] rounded-xl p-4 border border-white/10">
                                    <p className="text-white/50 text-xs mb-1">BRL</p>
                                    <p className="text-white font-bold text-lg">
                                        {formatCurrency(saldoBRL)}
                                    </p>
                                </div>
                                <div className="bg-[#2a2035] rounded-xl p-4 border border-white/10">
                                    <p className="text-white/50 text-xs mb-1">USDT</p>
                                    <p className="text-white font-bold text-lg">
                                        {usdtBalanceLoading ? "..." : formatUSD(saldoUSDT)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => setShowConvertModal(true)}
                                    className="bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl py-3"
                                >
                                    Converter
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-[#2a2035] border-white/10 text-white hover:bg-[#3a3045] font-semibold rounded-xl py-3"
                                >
                                    Depositar
                                </Button>
                            </div>

                            <div>
                                <p className="text-white/60 text-sm mb-3">Últimas transações</p>
                                <div className="space-y-3">
                                    {account?.payments && account.payments.length > 0 ? (
                                        account.payments.slice(0, 4).map((p) => {
                                            const value = Number(p.bankPayload.valor);
                                            const isPositive = value > 0;
                                            
                                            return (
                                                <div key={p.id} className="flex items-center gap-3 bg-[#2a2035] rounded-xl p-3 border border-white/5">
                                                    <div className={`p-2 rounded-full ${isPositive ? "bg-green-500/20" : "bg-violet-500/20"}`}>
                                                        {isPositive ? (
                                                            <ArrowDownLeft className={`w-4 h-4 ${isPositive ? "text-green-400" : "text-violet-400"}`} />
                                                        ) : (
                                                            <ArrowRightLeft className="w-4 h-4 text-violet-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {p.bankPayload.titulo || "Depósito PIX"}
                                                        </p>
                                                        <p className="text-white/40 text-xs">
                                                            {formatDate(p.paymentDate)}
                                                        </p>
                                                    </div>
                                                    <span className={`font-bold text-sm ${isPositive ? "text-green-400" : "text-white"}`}>
                                                        {isPositive ? "+" : ""}{formatCurrency(value)}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="p-3 rounded-full bg-white/5 inline-block mb-2">
                                                <ArrowDownLeft className="w-5 h-5 text-white/30" />
                                            </div>
                                            <p className="text-white/40 text-sm">Nenhuma transação</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                    variant="outline"
                                    onClick={() => setShowConvertModal(false)}
                                    className="flex-1 border-white/10 text-white/70 hover:bg-white/5 rounded-xl"
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
        </div>
    );
}
