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
} from "@/components/ui/table";

type CustomerData = {
    id: string;
    name: string | null;
    email: string;
    accountStatus: string;
    externalClientId: string | null;
    externalAccredId: string | null;
};

type Balance = {
    available: number;
    blocked: number;
    total: number;
};

type Transaction = {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    status: string;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [customer, setCustomer] = React.useState<CustomerData | null>(null);
    const [balance, setBalance] = React.useState<Balance | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);

    const brl = balance?.available ?? 0;
    const usdt = 0;

    const totalBRL = React.useMemo(() => brl, [brl]);
    const totalUSDT = React.useMemo(() => usdt, [usdt]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                // 1. Buscar dados do customer
                const customerRes = await http.get<CustomerData>("/customers/me");
                if (cancelled) return;
                setCustomer(customerRes.data);

                // 2. Buscar saldo (se o customer tiver ID externo)
                if (customerRes.data.externalClientId) {
                    try {
                        const balanceRes = await http.get<Balance>(
                            `/customers/${customerRes.data.id}/balance`
                        );
                        if (!cancelled) setBalance(balanceRes.data);
                    } catch (err) {
                        console.log("Saldo ainda não disponível");
                    }

                    // 3. Buscar transações recentes
                    try {
                        const txRes = await http.get<{ data: Transaction[] }>(
                            `/customers/${customerRes.data.id}/statement?limit=5`
                        );
                        if (!cancelled) setTransactions(txRes.data.data || []);
                    } catch (err) {
                        console.log("Transações ainda não disponíveis");
                    }
                }

            } catch (err: any) {
                if (!cancelled) {
                    console.error(err);
                    toast.error("Falha ao carregar dados");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#b852ff]" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            not_requested: "Não solicitado",
            requested: "Em análise",
            in_review: "Em revisão",
            approved: "Aprovado",
            rejected: "Rejeitado",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            not_requested: "bg-gray-100 text-gray-700",
            requested: "bg-yellow-100 text-yellow-700",
            in_review: "bg-blue-100 text-blue-700",
            approved: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-6 p-6">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe saldos, adicione BRL via Pix e envie USDT on-chain.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary">
                        Carregar demo
                    </Button>
                    <Button variant="ghost" className="gap-2">
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {/* Status KYC */}
            {customer && customer.accountStatus !== "approved" && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Verificação de Conta</h3>
                                <p className="text-sm text-muted-foreground">
                                    Status: {" "}
                                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(customer.accountStatus)}`}>
                                        {getStatusLabel(customer.accountStatus)}
                                    </span>
                                </p>
                            </div>
                            {customer.accountStatus === "not_requested" && (
                                <Link
                                    href="/customer/kyc"
                                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                >
                                    Completar Verificação
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Saldos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saldo em Reais (BRL)
                        </CardTitle>
                        <Wallet className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{formatCurrency(totalBRL)}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Disponível para conversão
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Saldo em Dólar Tether (USDT)
                        </CardTitle>
                        <Wallet className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{fmtUSD(totalUSDT)}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            Disponível para envios on-chain
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Histórico de transações */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Últimas transações
                    </CardTitle>
                    <Link href="/transactions" className="text-xs underline">
                        Ver tudo
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quando</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Moeda</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead>Descrição</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* Adicione TableBody quando tiver dados */}
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
