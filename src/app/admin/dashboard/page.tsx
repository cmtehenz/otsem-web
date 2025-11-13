// src/app/(admin)/dashboard/page.tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import DashboardSummary from "./DashboardSummary";
import AccountBalance from "./AccountBalance";
import RecentTransactions from "./RecentTransactions";
import RecentUsers from "./RecentUsers";
import QuickActions from "./QuickActions";

type BankingTransaction = {
    dataEntrada: string;
    tipoTransacao: string;
    tipoOperacao: string;
    valor: string;
    titulo: string;
    descricao: string;
};

type DashboardStats = {
    customers: {
        total: number;
    };
    deposits: {
        total: number;
        pending: number;
        confirmed: number;
        totalValue: number;
    };
    payouts: {
        total: number;
        totalValue: number;
    };
    banking: {
        saldo: {
            bloqueadoCheque: number;
            disponivel: number;
            bloqueadoJudicialmente: number;
            bloqueadoAdministrativo: number;
            limite: number;
        };
        extrato: {
            transacoes: BankingTransaction[];
        };
        timestamp: string;
    };
    timestamp: string;
};

type Summary = {
    totalUsers: number;
    activeToday: number;
    volumeBRL: number;
    pixKeys: number;
    cardTxs: number;
    chargebacks: number;
};

type Balance = {
    accountHolderId: string;
    availableBalance: number;
    blockedBalance: number;
    totalBalance: number;
    currency: string;
    updatedAt: string;
};

type User = {
    id: string;
    name?: string;
    email: string;
    createdAt: string;
    accountStatus?: string;
};

export default function AdminDashboardPage(): React.JSX.Element {
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState<Summary | null>(null);
    const [balance, setBalance] = React.useState<Balance | null>(null);
    const [recentTxs, setRecentTxs] = React.useState<any[]>([]);
    const [recentUsers, setRecentUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                // Buscar dados do dashboard
                const statsRes = await http.get<DashboardStats>("/admin/dashboard/stats");
                if (cancelled) return;

                const stats = statsRes.data;

                // Converter os dados para o formato esperado pelos componentes
                const convertedSummary: Summary = {
                    totalUsers: stats.customers.total,
                    activeToday: stats.deposits.confirmed, // Usando depósitos confirmados como proxy
                    volumeBRL: stats.deposits.totalValue + stats.payouts.totalValue,
                    pixKeys: 0, // não disponível no novo endpoint
                    cardTxs: stats.deposits.total + stats.payouts.total,
                    chargebacks: 0, // não disponível no novo endpoint
                };

                const convertedBalance: Balance = {
                    accountHolderId: "master", // placeholder
                    availableBalance: stats.banking.saldo.disponivel,
                    blockedBalance:
                        stats.banking.saldo.bloqueadoCheque +
                        stats.banking.saldo.bloqueadoJudicialmente +
                        stats.banking.saldo.bloqueadoAdministrativo,
                    totalBalance:
                        stats.banking.saldo.disponivel +
                        stats.banking.saldo.bloqueadoCheque +
                        stats.banking.saldo.bloqueadoJudicialmente +
                        stats.banking.saldo.bloqueadoAdministrativo,
                    currency: "BRL",
                    updatedAt: stats.banking.timestamp,
                };

                // Converter transações bancárias para o formato esperado
                const convertedTransactions = stats.banking.extrato.transacoes.map((tx, index) => ({
                    id: `tx-${index}`,
                    type: tx.tipoOperacao === 'C' ? 'credit' : 'debit',
                    amount: parseFloat(tx.valor),
                    description: tx.descricao,
                    title: tx.titulo,
                    transactionType: tx.tipoTransacao,
                    createdAt: tx.dataEntrada,
                    status: 'completed',
                }));

                setSummary(convertedSummary);
                setBalance(convertedBalance);
                setRecentTxs(convertedTransactions);

                // Como não temos latestUsers no novo formato, deixamos vazio
                setRecentUsers([]);

            } catch (err: any) {
                if (!cancelled) {
                    console.error(err);
                    toast.error("Falha ao carregar dashboard");
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
                <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
            <AccountBalance balance={balance} />
            <DashboardSummary summary={summary} />
            <RecentTransactions transactions={recentTxs} />
            <RecentUsers users={recentUsers} />
            <QuickActions />
        </div>
    );
}
