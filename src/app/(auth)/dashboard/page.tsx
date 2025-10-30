// src/app/(app)/page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { RefreshCw, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// const toast = ... (se quiser usar Sonner)

const fmtBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);

export default function Dashboard() {
    const brl = 0;
    const usdt = 0;

    const totalBRL = useMemo(() => brl, [brl]);
    const totalUSDT = useMemo(() => usdt, [usdt]);

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6">
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
                        <div className="text-3xl font-semibold">{fmtBRL(totalBRL)}</div>
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
