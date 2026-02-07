"use client";

import * as React from "react";
import { Loader2, RefreshCw, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
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

const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 380, damping: 30, mass: 0.8 },
    },
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
        } catch (err: unknown) {
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
            <div className="flex h-[60dvh] flex-col items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-[#6F00FF]" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Carregando dashboard...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-5 sm:space-y-6 pb-8"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
            <motion.div
                variants={fadeIn}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F00FF]/10">
                        <LayoutDashboard className="h-5 w-5 text-[#6F00FF]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Dashboard</h1>
                        {data?.timestamp && (
                            <p className="text-xs text-muted-foreground">
                                Atualizado em {new Date(data.timestamp).toLocaleString("pt-BR")}
                            </p>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="gap-2 self-end sm:self-auto rounded-xl"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </motion.div>

            <motion.div variants={fadeIn}>
                <BalanceCards balances={data?.balances ?? null} />
            </motion.div>

            <motion.div variants={fadeIn}>
                <KPICards kpis={data?.kpis ?? null} />
            </motion.div>

            <motion.div variants={fadeIn} className="grid gap-5 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartsSection charts={data?.charts ?? null} />
                </div>
                <div>
                    <AlertsSection alerts={data?.alerts ?? []} />
                </div>
            </motion.div>

            <motion.div variants={fadeIn}>
                <RecentTransactions transactions={data?.recentTransactions ?? []} />
            </motion.div>

            <motion.div variants={fadeIn}>
                <QuickActions />
            </motion.div>
        </motion.div>
    );
}
