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

type Summary = {
    totalUsers: number;
    activeToday: number;
    volumeBRL: number;
    pixKeys: number;
    cardTxs: number;
    chargebacks: number;
    accountHolderId?: string; // pode não existir
};

type Balance = {
    accountHolderId: string;
    availableBalance: number;
    blockedBalance: number;
    totalBalance: number;
    currency: string;
    updatedAt: string;
};

type Tx = {
    id: string;
    createdAt: string;
    type: "PIX" | "CARD" | "PAYOUT" | "CRYPTO";
    asset: string; // moeda (ex: BRL)
    amount: number;
    status: "pending" | "processing" | "completed" | "failed";
    description?: string;
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
    const [recentTxs, setRecentTxs] = React.useState<Tx[]>([]);
    const [recentUsers, setRecentUsers] = React.useState<User[]>([]);
    const [balanceHint, setBalanceHint] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                // 1) Resumo
                const summaryRes = await http.get<Summary>("/admin/dashboard/summary");
                if (cancelled) return;
                setSummary(summaryRes.data);

                // 2) Descobrir o accountHolderId (para rotas Pix)
                const envMasterId = process.env.NEXT_PUBLIC_MASTER_CUSTOMER_ID as string | undefined;
                const accountHolderId = summaryRes.data.accountHolderId || envMasterId;

                if (!accountHolderId) {
                    setBalanceHint(
                        "accountHolderId ausente. Defina NEXT_PUBLIC_MASTER_CUSTOMER_ID no .env.local ou retorne no /admin/dashboard/summary."
                    );
                }

                // 3) Transações: usar rota Pix por account holder (evita 404)
                let txsP: Promise<Tx[]>;
                if (accountHolderId) {
                    txsP = http
                        .get<{ items: Tx[] } | Tx[]>(
                            `/pix/transactions/account-holders/${encodeURIComponent(accountHolderId)}`,
                            { params: { limit: 5 } }
                        )
                        .then((r) =>
                            Array.isArray(r.data) ? (r.data as Tx[]) : ((r.data as any)?.items ?? [])
                        )
                        .catch(() => []);
                } else {
                    txsP = Promise.resolve([]);
                }

                // 4) Usuários (mantém como está)
                const usersP = http
                    .get<{ items: User[] }>("/users", {
                        params: { limit: 5, sort: "createdAt:desc" },
                    })
                    .then((r) => r.data.items || [])
                    .catch(() => []);

                // 5) Saldo (403 é esperado se IP bloqueado)
                const balanceP = accountHolderId
                    ? http
                        .get<Balance>(`/customers/${accountHolderId}/balance`)
                        .then((r) => r.data)
                        .catch((err) => {
                            if (err?.response?.status === 403) {
                                setBalanceHint("Sem permissão para consultar saldo (403).");
                                return null;
                            }
                            console.warn("Falha ao buscar saldo:", err);
                            setBalanceHint("Falha ao buscar saldo.");
                            return null;
                        })
                    : Promise.resolve(null);

                const [txs, users, maybeBalance] = await Promise.all([txsP, usersP, balanceP]);
                if (cancelled) return;

                setRecentTxs(txs);
                setRecentUsers(users);
                if (maybeBalance) setBalance(maybeBalance);
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
            {balanceHint && (
                <p className="text-xs text-muted-foreground">
                    {balanceHint}
                </p>
            )}
            <DashboardSummary summary={summary} />
            <RecentTransactions transactions={recentTxs} />
            <RecentUsers users={recentUsers} />
            <QuickActions />
        </div>
    );
}
