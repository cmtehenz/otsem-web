// =============================
// File: src/app/transactions/page.tsx
// =============================
"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

// shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API = process.env.NEXT_PUBLIC_API_URL || "";
const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

export type Tx = {
    id: string;
    createdAt: string;
    type: "CREDIT" | "DEBIT";
    origin?: "PIX" | "CARD" | "CONVERSION" | "PAYOUT" | "MANUAL";
    asset: "BRL" | "USDT";
    amount: number;
    description?: string;
    txid?: string;
};

const filterSchema = z.object({
    q: z.string().max(80).optional().or(z.literal("")),
    asset: z.enum(["ALL", "BRL", "USDT"]).default("ALL"),
    type: z.enum(["ALL", "CREDIT", "DEBIT"]).default("ALL"),
    origin: z.enum(["ALL", "PIX", "CARD", "CONVERSION", "PAYOUT", "MANUAL"]).default("ALL"),
    from: z.string().optional().or(z.literal("")),
    to: z.string().optional().or(z.literal("")),
});

type FilterForm = z.infer<typeof filterSchema>;
const filterResolver = zodResolver(filterSchema) as unknown as Resolver<FilterForm>;

function fmtBRL(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0); }
function fmtUSD(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0); }
const time = (iso?: string) => (iso ? new Date(iso).toLocaleString("pt-BR") : "");

export default function TransactionsPage() {
    const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FilterForm>({
        resolver: filterResolver,
        defaultValues: { asset: "ALL", type: "ALL", origin: "ALL", q: "", from: "", to: "" },
    });

    // paginação
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(20);

    const values = watch();
    const query = React.useMemo(() => {
        const p = new URLSearchParams();
        if (values.q) p.set("q", values.q);
        if (values.asset && values.asset !== "ALL") p.set("asset", values.asset);
        if (values.type && values.type !== "ALL") p.set("type", values.type);
        if (values.origin && values.origin !== "ALL") p.set("origin", values.origin);
        if (values.from) p.set("from", values.from);
        if (values.to) p.set("to", values.to);
        p.set("page", String(page));
        p.set("limit", String(limit));
        return p.toString();
    }, [values, page, limit]);

    const { data, isLoading, mutate } = useSWR<{ items: Tx[] }>(`${API}/transactions?${query}`, fetcher, { keepPreviousData: true });

    function onReset() {
        setValue("q", "");
        setValue("asset", "ALL");
        setValue("type", "ALL");
        setValue("origin", "ALL");
        setValue("from", "");
        setValue("to", "");
        setPage(1);
    }

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
                    <p className="text-sm text-muted-foreground">Filtro por moeda, tipo, origem e período.</p>
                </div>
                <Button variant="ghost" className="gap-2" onClick={() => mutate()}><RefreshCw className="size-4" /> Atualizar</Button>
            </div>

            {/* Filtros */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(() => { setPage(1); mutate(); })} className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div className="md:col-span-2">
                            <Label>Buscar</Label>
                            <div className="flex gap-2">
                                <Input placeholder="ID, descrição, txid..." {...register("q")} />
                                <Button type="submit" variant="secondary" disabled={isSubmitting}><Search className="size-4" /></Button>
                            </div>
                        </div>

                        <div>
                            <Label>Moeda</Label>
                            <Select defaultValue="ALL" onValueChange={(v) => (setValue("asset", v as FilterForm["asset"], { shouldValidate: true }), setPage(1), mutate())}>
                                <SelectTrigger><SelectValue placeholder="Moeda" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="BRL">BRL</SelectItem>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Tipo</Label>
                            <Select defaultValue="ALL" onValueChange={(v) => (setValue("type", v as FilterForm["type"], { shouldValidate: true }), setPage(1), mutate())}>
                                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="CREDIT">Crédito</SelectItem>
                                    <SelectItem value="DEBIT">Débito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Origem</Label>
                            <Select defaultValue="ALL" onValueChange={(v) => (setValue("origin", v as FilterForm["origin"], { shouldValidate: true }), setPage(1), mutate())}>
                                <SelectTrigger><SelectValue placeholder="Origem" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="PIX">Pix</SelectItem>
                                    <SelectItem value="CARD">Cartão</SelectItem>
                                    <SelectItem value="CONVERSION">Conversão</SelectItem>
                                    <SelectItem value="PAYOUT">Payout</SelectItem>
                                    <SelectItem value="MANUAL">Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>De</Label>
                                <Input type="date" {...register("from")} />
                            </div>
                            <div>
                                <Label>Até</Label>
                                <Input type="date" {...register("to")} />
                            </div>
                        </div>

                        <div className="md:col-span-6 flex gap-2">
                            <Button type="submit">Aplicar</Button>
                            <Button type="button" variant="outline" onClick={onReset}>Limpar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tabela */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quando</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Origem</TableHead>
                                    <TableHead>Moeda</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Carregando…</TableCell></TableRow>
                                )}
                                {!isLoading && (!data?.items || data.items.length === 0) && (
                                    <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground">Sem resultados</TableCell></TableRow>
                                )}
                                {data?.items?.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{time(t.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1 text-sm ${t.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {t.type === 'CREDIT' ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                                                {t.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">{t.origin ?? '—'}</TableCell>
                                        <TableCell className="text-xs">{t.asset}</TableCell>
                                        <TableCell className="text-right font-medium">{t.asset === 'BRL' ? fmtBRL(t.amount) : fmtUSD(t.amount)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[320px] truncate">{t.description ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/transactions/${t.id}`} className="text-xs underline">Detalhes</Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginação */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Label>Itens por página</Label>
                            <Select defaultValue={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
                            <div className="text-sm text-muted-foreground">Página {page}</div>
                            <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={!!data && Array.isArray(data.items) && data.items.length < limit}>Próxima</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


