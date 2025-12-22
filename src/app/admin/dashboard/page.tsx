"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import KPICards from "./KPICards";
import BalanceCards from "./BalanceCards";
import ChartsSection from "./ChartsSection";
import RecentTransactions from "./RecentTransactions";
import AlertsSection from "./AlertsSection";
import QuickActions from "./QuickActions";

export type DashboardData = {
    kpis: {
        totalUsers: number;
        usersToday: number;
        usersThisWeek: number;
        usersThisMonth: number;
        kycPending: number;
        kycApproved: number;
        kycRejected: number;
        totalTransactions: number;
        transactionsToday: number;
        volumeToday: number;
        volumeThisWeek: number;
        volumeThisMonth: number;
        conversionsToday: number;
        conversionsVolume: number;
    };
    balances: {
        brl: {
            inter: number;
            okx: number;
            fd: number;
            total: number;
        };
        usdt: {
            okx: number;
        };
        usdtRate: number;
    };
    charts: {
        transactionsLast7Days: { date: string; count: number; volume: number }[];
        usersLast30Days: { date: string; count: number }[];
        transactionsByType: { type: string; count: number; volume: number }[];
    };
    recentTransactions: {
        id: string;
        type: string;
        amount: number;
        currency: string;
        status: string;
        description: string;
        customerName: string;
        createdAt: string;
    }[];
    alerts: {
        id: string;
        type: "kyc_pending" | "high_value" | "error" | "warning";
        title: string;
        description: string;
        actionUrl?: string;
        createdAt: string;
    }[];
    timestamp: string;
};

export default function AdminDashboardPage(): React.JSX.Element {
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [data, setData] = React.useState<DashboardData | null>(null);

    const loadData = React.useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true);
            else setLoading(true);

            const response = await http.get<DashboardData>("/admin/dashboard/stats");
            setData(response.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Falha ao carregar dashboard");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-red-500" />
                <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    {data?.timestamp && (
                        <p className="text-sm text-muted-foreground">
                            Atualizado em {new Date(data.timestamp).toLocaleString("pt-BR")}
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            <BalanceCards balances={data?.balances ?? null} />

            <KPICards kpis={data?.kpis ?? null} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartsSection charts={data?.charts ?? null} />
                </div>
                <div>
                    <AlertsSection alerts={data?.alerts ?? []} />
                </div>
            </div>

            <RecentTransactions transactions={data?.recentTransactions ?? []} />

            <QuickActions />
        </div>
    );
}
