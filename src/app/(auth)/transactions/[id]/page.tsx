"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Copy, Check } from "lucide-react";

import { swrFetcher } from "@/lib/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Tx = {
    id: string;
    createdAt: string;
    type: "CREDIT" | "DEBIT";
    origin?: "PIX" | "CARD" | "CONVERSION" | "PAYOUT" | "MANUAL";
    asset: "BRL" | "USDT";
    amount: number;
    description?: string;
    txid?: string;
    meta?: Record<string, unknown>;
};

const fmtBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);

export default function TransactionDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data, error, isLoading, mutate } = useSWR<Tx>(`/transactions/${id}`, swrFetcher);

    if (!isLoading && (error || !data)) {
        // 404 do mock cai aqui também
        notFound();
    }

    const amountView =
        data?.asset === "BRL" ? fmtBRL(Number(data?.amount ?? 0)) : fmtUSD(Number(data?.amount ?? 0));

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            {/* Topo */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/transactions">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="size-4" /> Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Detalhes da transação</h1>
                        <p className="text-sm text-muted-foreground">
                            #{id}
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => mutate()}>Recarregar</Button>
            </div>

            {/* Card principal */}
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {data?.type === "CREDIT" ? (
                                <>
                                    <ArrowDownRight className="size-5 text-emerald-600" />
                                    Crédito
                                </>
                            ) : (
                                <>
                                    <ArrowUpRight className="size-5 text-rose-600" />
                                    Débito
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {data ? new Date(data.createdAt).toLocaleString("pt-BR") : "—"}
                        </CardDescription>
                    </div>

                    {data?.origin && <Badge variant="secondary">{data.origin}</Badge>}
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Valor + Moeda */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-xl">
                            <div className="text-xs text-muted-foreground">Valor</div>
                            <div className="text-2xl font-semibold">{amountView}</div>
                        </div>
                        <div className="p-4 border rounded-xl">
                            <div className="text-xs text-muted-foreground">Moeda</div>
                            <div className="text-xl font-medium">{data?.asset ?? "—"}</div>
                        </div>
                        <div className="p-4 border rounded-xl">
                            <div className="text-xs text-muted-foreground">Tipo</div>
                            <div className="text-xl font-medium">{data?.type ?? "—"}</div>
                        </div>
                    </div>

                    <Separator />

                    {/* Descrição */}
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Descrição</div>
                        <div className="text-sm">{data?.description ?? "—"}</div>
                    </div>

                    {/* TXID (se houver) */}
                    {data?.txid && <TxidRow txid={data.txid} />}

                    {/* Meta (se houver) */}
                    {data?.meta && Object.keys(data.meta).length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">Metadados</div>
                                <div className="text-xs whitespace-pre-wrap break-all rounded-md border p-3 bg-muted/30">
                                    {JSON.stringify(data.meta, null, 2)}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Link auxiliar */}
            <div className="text-center">
                <Link href="/transactions" className="text-xs underline text-muted-foreground">
                    Voltar para lista
                </Link>
            </div>
        </div>
    );
}

function TxidRow({ txid }: { txid: string }) {
    const [copied, setCopied] = React.useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(txid);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch { }
    }

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
                <div className="text-xs text-muted-foreground">TxID / Referência</div>
                <div className="text-xs md:text-sm break-all">{txid}</div>
            </div>
            <Button variant="secondary" className="gap-2" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiado" : "Copiar"}
            </Button>
        </div>
    );
}
