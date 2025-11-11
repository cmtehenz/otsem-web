// src/app/(admin)/dashboard/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    Banknote,
    CreditCard,
    KeyRound,
    LayoutDashboard,
    Users,
    TrendingUp,
    Activity,
    AlertTriangle,
    Loader2,
} from "lucide-react";

import http from "@/lib/http";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type DashboardSummary = {
    totalUsers: number;
    activeToday: number;
    volumeBRL: number;
    pixKeys: number;
    cardTxs: number;
    chargebacks: number;
};

type Transaction = {
    id: string;
    createdAt: string;
    type: "PIX" | "CARD" | "PAYOUT" | "CRYPTO";
    asset: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    description?: string;
};

type RecentUser = {
    id: string;
    name?: string;
    email: string;
    createdAt: string;
    accountStatus?: string;
};

function k(n: number) {
    return new Intl.NumberFormat("pt-BR").format(n);
}

function brl(n: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function timeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
}

export default function AdminDashboardPage(): React.JSX.Element {
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
    const [recentTxs, setRecentTxs] = React.useState<Transaction[]>([]);
    const [recentUsers, setRecentUsers] = React.useState<RecentUser[]>([]);

    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);

                // Busca resumo do dashboard
                const summaryRes = await http.get<DashboardSummary>("/admin/dashboard/summary");
                setSummary(summaryRes.data);

                // Busca transações recentes (últimas 5)
                try {
                    const txsRes = await http.get<{ items: Transaction[] }>("/admin/transactions", {
                        params: { limit: 5, sort: "createdAt:desc" },
                    });
                    setRecentTxs(txsRes.data.items || []);
                } catch (err) {
                    console.warn("Transações recentes não disponíveis:", err);
                }

                // Busca usuários recentes
                try {
                    const usersRes = await http.get<{ items: RecentUser[] }>("/admin/users", {
                        params: { limit: 5, sort: "createdAt:desc" },
                    });
                    setRecentUsers(usersRes.data.items || []);
                } catch (err) {
                    console.warn("Usuários recentes não disponíveis:", err);
                }
            } catch (err) {
                console.error(err);
                toast.error("Falha ao carregar dados do dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#b852ff]" />
                    <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-muted-foreground">Erro ao carregar dados</p>
            </div>
        );
    }

    // Calcula algumas métricas derivadas
    const avgVolumePerUser = summary.totalUsers > 0 ? summary.volumeBRL / summary.totalUsers : 0;
    const activePercentage = summary.totalUsers > 0 ? (summary.activeToday / summary.totalUsers) * 100 : 0;
    const chargebackRate = summary.cardTxs > 0 ? (summary.chargebacks / summary.cardTxs) * 100 : 0;

    return (
        <div className="space-y-6 p-6">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-6 text-[#b852ff]" />
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/settings">Configurações</Link>
                    </Button>
                    <Button className="bg-[#b852ff] hover:bg-[#a942ee]" asChild>
                        <Link href="/admin/transactions">
                            Ver todas transações <ArrowUpRight className="ml-1 size-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPIs principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total de usuários */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total de Usuários
                        </CardTitle>
                        <Users className="size-5 text-[#b852ff]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{k(summary.totalUsers)}</div>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <Activity className="mr-1 size-3" />
                                {k(summary.activeToday)} ativos hoje
                            </Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            {activePercentage.toFixed(1)}% de taxa de ativação
                        </p>
                    </CardContent>
                </Card>

                {/* Volume BRL */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Volume (24h)
                        </CardTitle>
                        <Banknote className="size-5 text-[#f8bc07]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{brl(summary.volumeBRL)}</div>
                        <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="size-4" />
                            <span className="font-medium">+12.5%</span>
                            <span className="text-xs text-muted-foreground">vs ontem</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Média: {brl(avgVolumePerUser)}/usuário
                        </p>
                    </CardContent>
                </Card>

                {/* Chaves Pix */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Chaves Pix
                        </CardTitle>
                        <KeyRound className="size-5 text-[#00d9ff]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{k(summary.pixKeys)}</div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Gerenciadas na plataforma
                        </p>
                        <div className="mt-2">
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                {(summary.pixKeys / Math.max(summary.totalUsers, 1)).toFixed(1)} chaves/usuário
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Transações de Cartão */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Transações Cartão
                        </CardTitle>
                        <CreditCard className="size-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{k(summary.cardTxs)}</div>
                        <div className="mt-2 flex items-center gap-2">
                            {summary.chargebacks > 0 ? (
                                <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle className="size-3" />
                                    {summary.chargebacks} chargebacks
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    0 chargebacks
                                </Badge>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Taxa de chargeback: {chargebackRate.toFixed(2)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção de tabelas */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Transações recentes */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#000000]/5 pb-4">
                        <CardTitle className="text-base font-semibold">Últimas Transações</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/transactions" className="text-xs text-[#b852ff] hover:text-[#a942ee]">
                                Ver todas →
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {recentTxs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Quando</TableHead>
                                            <TableHead className="text-xs">Tipo</TableHead>
                                            <TableHead className="text-xs">Moeda</TableHead>
                                            <TableHead className="text-right text-xs">Valor</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTxs.map((tx) => (
                                            <TableRow key={tx.id} className="hover:bg-[#faffff]/50">
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {timeAgo(tx.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {tx.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">{tx.asset}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {tx.asset === "BRL" ? brl(tx.amount) : `${tx.amount.toFixed(2)} ${tx.asset}`}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            tx.status === "completed"
                                                                ? "default"
                                                                : tx.status === "pending"
                                                                    ? "secondary"
                                                                    : "destructive"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {tx.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Nenhuma transação recente
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Usuários recentes */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#000000]/5 pb-4">
                        <CardTitle className="text-base font-semibold">Novos Usuários</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users" className="text-xs text-[#b852ff] hover:text-[#a942ee]">
                                Ver todos →
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {recentUsers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Nome</TableHead>
                                            <TableHead className="text-xs">Email</TableHead>
                                            <TableHead className="text-xs">Status</TableHead>
                                            <TableHead className="text-right text-xs">Criado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-[#faffff]/50">
                                                <TableCell className="text-sm font-medium">
                                                    {user.name || "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.accountStatus === "approved"
                                                                ? "default"
                                                                : user.accountStatus === "in_review"
                                                                    ? "secondary"
                                                                    : "outline"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {user.accountStatus || "pending"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">
                                                    {timeAgo(user.createdAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Nenhum usuário recente
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Ações rápidas */}
            <div className="rounded-2xl border border-[#000000]/10 bg-linear-to-br from-[#faffff] to-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Ações Rápidas</h3>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="border-[#b852ff]/20 hover:bg-[#b852ff]/5">
                        <Link href="/admin/kyc">Gerenciar KYC</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-[#f8bc07]/20 hover:bg-[#f8bc07]/5">
                        <Link href="/admin/pix">Chaves Pix</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-[#00d9ff]/20 hover:bg-[#00d9ff]/5">
                        <Link href="/admin/cards">Pagamentos Cartão</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-purple-500/20 hover:bg-purple-500/5">
                        <Link href="/admin/crypto">Crypto Payouts</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/settings">Configurações</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
