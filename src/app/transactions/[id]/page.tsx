// =====================================
// File: src/app/transactions/[id]/page.tsx
// =====================================
"use client";

import React from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Tx } from "../page";

const API2 = process.env.NEXT_PUBLIC_API_URL || "";
const fetcher2 = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

function fmtBRL(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0); }
function fmtUSD(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0); }
const time2 = (iso?: string) => (iso ? new Date(iso).toLocaleString("pt-BR") : "");

export default function TransactionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data, isLoading } = useSWR<Tx & { meta?: Record<string, any> }>(id ? `${API2}/transactions/${id}` : null, fetcher2);

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2" onClick={() => router.back()}><ArrowLeft className="size-4" /> Voltar</Button>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Transação #{id}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="text-sm text-muted-foreground">Carregando…</div>}
                    {data && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div><b>Quando:</b> {time2(data.createdAt)}</div>
                                <div><b>Tipo:</b> {data.type}</div>
                                <div><b>Origem:</b> {data.origin ?? '—'}</div>
                                <div><b>Moeda:</b> {data.asset}</div>
                                <div><b>Valor:</b> {data.asset === 'BRL' ? fmtBRL(data.amount) : fmtUSD(data.amount)}</div>
                                <div><b>Descrição:</b> {data.description ?? '—'}</div>
                                {data.txid && <div className="col-span-1 md:col-span-3"><b>TxID/Ref:</b> {data.txid}</div>}
                            </div>

                            {data.meta && (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Campo</TableHead>
                                                <TableHead>Valor</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(data.meta).map(([k, v]) => (
                                                <TableRow key={k}>
                                                    <TableCell className="font-medium">{k}</TableCell>
                                                    <TableCell className="text-sm">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {data.asset === 'USDT' && data.txid && (
                                <div className="text-xs text-muted-foreground">
                                    Dica: para ver a transação on-chain, use o explorador da rede correta (TRON/Ethereum/Solana).
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}