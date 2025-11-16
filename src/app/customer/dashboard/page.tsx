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

    const { rate: usdtRate, loading: usdtLoading, updatedAt } = useUsdtRate();
    const [timer, setTimer] = React.useState(15);

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

            {/* Cotação USDT e Saldo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#000000] flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#b852ff]" />
                            Cotação USDT
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {usdtLoading ? "..." : formatCurrency(usdtRate ?? 0, 4)}
                        </div>
                        <div className="mt-2 text-xs text-[#000000] opacity-60">
                            Atualização em {timer}s
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-sm bg-[#faffff] border border-[#b852ff]/30">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-[#000000] flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-[#f8bc07]" />
                            Saldo na Conta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${getValueColor(account?.balance ?? 0)}`}>
                            {formatCurrency(account?.balance ?? 0)}
                        </div>
                        <div className="mt-2 text-xs text-[#000000] opacity-60">
                            Atualizado em: {account?.updatedAt ? new Date(account.updatedAt).toLocaleString("pt-BR") : "--"}
                        </div>
                    </CardContent>
                </Card>
            </div>

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
