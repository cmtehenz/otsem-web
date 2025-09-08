"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { ArrowDownRight, ArrowUpRight, CreditCard, RefreshCw, Wallet } from "lucide-react";

// ——— shadcn/ui ———
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ——— Sonner ———
import { toast } from "sonner";

// ——— Helpers ———
const API = process.env.NEXT_PUBLIC_API_URL || "";
const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
const fmtBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const fmtUSD = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);
const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h`;
    const d = Math.floor(h / 24);
    return `${d} d`;
};

// Types
type Balances = { brl: number; usdt: number };
type Tx = {
    id: string;
    createdAt: string;
    type: "CREDIT" | "DEBIT";
    asset: "BRL" | "USDT";
    amount: number;
    description?: string;
};

// ——— Merchant Flow Simplificado ———
function MerchantCardModal({ onDone }: { onDone?: () => void }) {
    const [amount, setAmount] = useState<number>(0);
    const [installments, setInstallments] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    async function onCreate() {
        try {
            setLoading(true);
            const res = await fetch(`${API}/card/payments/intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ amount_brl: amount, installments })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Falha na criação da cobrança");
            toast.success(`Cobrança criada em ${installments}x, valor: ${fmtBRL(amount)}`);
            onDone?.();
        } catch (e: any) {
            toast.error(e?.message ?? "Erro ao criar cobrança");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><CreditCard className="size-4" /> Cobrar no Cartão</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cobrar no Cartão</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <label className="text-sm text-muted-foreground">Valor (BRL)</label>
                    <Input type="number" min={1} step="0.01" value={amount as any} onChange={(e) => setAmount(Number(e.target.value))} />

                    <label className="text-sm text-muted-foreground">Parcelas</label>
                    <Input type="number" min={1} max={12} value={installments as any} onChange={(e) => setInstallments(Number(e.target.value))} />

                    <Button onClick={onCreate} disabled={loading || amount <= 0} className="w-full">{loading ? "Processando…" : "Criar cobrança"}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ——— Dashboard ———
export default function Dashboard() {
    const { data: balances, isLoading: loadingBalances, mutate: refetchBalances } = useSWR<Balances>(API ? `${API}/wallets/me` : null, fetcher);
    const { data: txs, isLoading: loadingTxs, mutate: refetchTxs } = useSWR<Tx[]>(API ? `${API}/transactions?limit=10` : null, fetcher);

    console.log(loadingBalances);
    const brl = balances?.brl ?? 0;
    const usdt = balances?.usdt ?? 0;

    const totalBRL = useMemo(() => brl, [brl]);
    const totalUSDT = useMemo(() => usdt, [usdt]);

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6">
            {/* Topbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Acompanhe saldos, adicione BRL via Pix, converta e envie USDT, ou cobre no cartão.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => { refetchBalances(); refetchTxs(); }} className="gap-2"><RefreshCw className="size-4" /> Atualizar</Button>
                </div>
            </div>

            {/* Saldo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em Reais (BRL)</CardTitle>
                        <Wallet className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{fmtBRL(totalBRL)}</div>
                        <div className="mt-2 text-xs text-muted-foreground">Disponível para conversão</div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em Dólar Tether (USDT)</CardTitle>
                        <Wallet className="size-4 opacity-60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{fmtUSD(totalUSDT)}</div>
                        <div className="mt-2 text-xs text-muted-foreground">Disponível para envios on-chain</div>
                    </CardContent>
                </Card>
            </div>

            {/* Ações rápidas */}
            <div className="flex flex-wrap gap-3 mb-8">
                {/* PixAddModal, ConvertModal, PayoutModal devem ser adicionados aqui */}
                <MerchantCardModal onDone={() => { refetchBalances(); refetchTxs(); }} />
            </div>

            {/* Histórico de transações */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Últimas transações</CardTitle>
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
                            <TableBody>
                                {loadingTxs && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Carregando…</TableCell></TableRow>
                                )}
                                {(!loadingTxs && (!txs || txs.length === 0)) && (
                                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Sem transações recentes</TableCell></TableRow>
                                )}
                                {txs?.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{timeAgo(t.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1 text-sm ${t.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {t.type === 'CREDIT' ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                                                {t.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{t.asset}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {t.asset === 'BRL' ? fmtBRL(t.amount) : fmtUSD(t.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[320px] truncate">
                                            {t.description ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-muted-foreground">OtsemBank — MVP • UI preview (com suporte a merchant)</p>
        </div>
    );
}
