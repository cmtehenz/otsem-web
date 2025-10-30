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
} from "lucide-react";

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

function k(n: number) {
    return new Intl.NumberFormat("pt-BR").format(n);
}
function brl(n: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function AdminDashboardPage(): React.JSX.Element {
    // placeholders — depois você troca por fetchs reais
    const stats = {
        totalUsers: 1832,
        activeToday: 247,
        volumeBRL: 128_450.57,
        pixKeys: 356,
        cardTxs: 742,
        chargebacks: 3,
    };

    const latestUsers = [
        { id: "u_12ab", name: "Ana Souza", email: "ana@exemplo.com", createdAt: "2025-10-29" },
        { id: "u_12ac", name: "Bruno Lima", email: "bruno@exemplo.com", createdAt: "2025-10-29" },
        { id: "u_12ad", name: "Carol Dias", email: "carol@exemplo.com", createdAt: "2025-10-28" },
    ];

    const latestTxs = [
        { id: "tx_01", when: "há 10 min", type: "PIX", asset: "BRL", amount: 950.0, desc: "Entrada Pix" },
        { id: "tx_02", when: "há 35 min", type: "CARD", asset: "BRL", amount: 120.5, desc: "Cartão capturado" },
        { id: "tx_03", when: "há 1 h", type: "PAYOUT", asset: "USDT", amount: 250.0, desc: "Envio TRON" },
    ];

    return (
        <div className="space-y-6">
            {/* Título */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-5 text-muted-foreground" />
                    <h1 className="text-xl font-semibold tracking-tight">Dashboard (Admin)</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" asChild>
                        <Link href="/admin/settings">Configurações</Link>
                    </Button>
                    <Button className="gap-1.5" asChild>
                        <Link href="/admin/transactions">
                            Ver transações <ArrowUpRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
                        <Users className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{k(stats.totalUsers)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{k(stats.activeToday)} ativos hoje</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Volume (BRL)</CardTitle>
                        <Banknote className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{brl(stats.volumeBRL)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Últimas 24h (consolidado)</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Chaves Pix</CardTitle>
                        <KeyRound className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{k(stats.pixKeys)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Gerenciadas pela plataforma</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transações (Cartão)</CardTitle>
                        <CreditCard className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{k(stats.cardTxs)}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            Chargebacks: <span className="font-medium">{stats.chargebacks}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Espaços visuais */}
                <div className="hidden lg:block" />
                <div className="hidden lg:block" />
            </div>

            {/* Colunas: últimas transações e últimos usuários */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Últimas transações</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/transactions" className="text-xs">Ver tudo</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
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
                                <TableBody>
                                    {latestTxs.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-xs text-muted-foreground">{t.when}</TableCell>
                                            <TableCell className="text-sm">{t.type}</TableCell>
                                            <TableCell className="text-sm">{t.asset}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {t.asset === "BRL" ? brl(t.amount) : `${t.amount.toFixed(2)} USDT`}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{t.desc}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Novos usuários</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users" className="text-xs">Ver todos</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">Criado em</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {latestUsers.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="text-sm">{u.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">{u.createdAt}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Ações rápidas */}
            <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/admin/pix">Gerenciar Pix</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/admin/cards">Pagamentos Cartão</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/admin/settings">Preferências</Link>
                </Button>
            </div>
        </div>
    );
}
