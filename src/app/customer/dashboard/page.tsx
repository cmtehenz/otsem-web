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

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [account, setAccount] = React.useState<AccountSummary | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                // Buscar dados do customer
                const customerId = user?.id;
                if (!customerId) {
                    toast.error("Usuário não encontrado");
                    return;
                }

                // Buscar resumo da conta
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
            <div className="flex h-96 flex-col items-center justify-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#b852ff]" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Saldo, limites e histórico Pix da sua conta.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="gap-2" onClick={() => window.location.reload()}>
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {/* Saldo e limites */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saldo disponível
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">
                            {formatCurrency(account?.balance ?? 0)}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Atualizado em: {account?.updatedAt ? new Date(account.updatedAt).toLocaleString("pt-BR") : "--"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Limite diário Pix
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {formatCurrency(account?.dailyLimit ?? 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Limite mensal Pix
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {formatCurrency(account?.monthlyLimit ?? 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Histórico de transações Pix */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Histórico Pix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Pagador</TableHead>
                                    <TableHead>Banco</TableHead>
                                    <TableHead>Descrição</TableHead>
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
                                                {formatCurrency(Number(p.bankPayload.valor))}
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
                                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
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
            <p className="mt-6 text-center text-xs text-muted-foreground">
                OtsemBank — MVP • UI preview
            </p>
        </div>
    );
}
