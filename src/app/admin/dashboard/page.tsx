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

type DashboardStats = {
    summary: {
        customers: {
            total: number;
            pending: number;
            approved: number;
            rejected: number;
        };
        transactions: {
            total: number;
            volume: number;
        };
    };
    interBalance: {
        disponivel: number;
        bloqueadoCheque: number;
        bloqueadoJudicialmente: number;
        bloqueadoAdministrativo: number;
        limite: number;
        total: number;
    };
    latestUsers: Array<{
        id: string;
        name: string;
        email: string;
        status: string;
        createdAt: string;
    }>;
    latestTransactions: any[];
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
                    totalUsers: stats.summary.customers.total,
                    activeToday: stats.summary.customers.approved,
                    volumeBRL: stats.summary.transactions.volume,
                    pixKeys: 0, // não disponível no novo endpoint
                    cardTxs: stats.summary.transactions.total,
                    chargebacks: 0, // não disponível no novo endpoint
                };

                const convertedBalance: Balance = {
                    accountHolderId: "master", // placeholder
                    availableBalance: stats.interBalance.disponivel,
                    blockedBalance:
                        stats.interBalance.bloqueadoCheque +
                        stats.interBalance.bloqueadoJudicialmente +
                        stats.interBalance.bloqueadoAdministrativo,
                    totalBalance: stats.interBalance.total,
                    currency: "BRL",
                    updatedAt: new Date().toISOString(),
                };

                const convertedUsers: User[] = stats.latestUsers.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    accountStatus: user.status,
                }));

                setSummary(convertedSummary);
                setBalance(convertedBalance);
                setRecentUsers(convertedUsers);
                setRecentTxs(stats.latestTransactions);

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
