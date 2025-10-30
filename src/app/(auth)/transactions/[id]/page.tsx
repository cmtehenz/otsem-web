"use client";

import React from "react";
// import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";

// import { swrFetcher } from "@/lib/api";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";

// type Tx = {
//     id: string;
//     createdAt: string;
//     type: "CREDIT" | "DEBIT";
//     origin?: "PIX" | "CARD" | "CONVERSION" | "PAYOUT" | "MANUAL";
//     asset: "BRL" | "USDT";
//     amount: number;
//     description?: string;
//     txid?: string;
//     meta?: Record<string, unknown>;
// };

const fmtBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v ?? 0);

export default function TransactionDetailPage() {
    const { id } = useParams<{ id: string }>();

    // const { data, error, isLoading, mutate } = useSWR<Tx>(`/transactions/${id}`, swrFetcher);

    // if (!isLoading && (error || !data)) {
    //     // 404 do mock cai aqui também
    //     notFound();
    // }

    // const amountView =
    //     data?.asset === "BRL" ? fmtBRL(Number(data?.amount ?? 0)) : fmtUSD(Number(data?.amount ?? 0));

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
                <Button variant="outline" >
                    teste
                </Button>
            </div>

            {/* Card principal */}
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {/* {data?.type === "CREDIT" ? (
                                <>
                                    <ArrowDownRight className="size-5 text-emerald-600" />
                                    Crédito
                                </>
                            ) : (
                                <>
                                    <ArrowUpRight className="size-5 text-rose-600" />
                                    Débito
                                </>
                            )} */}
                        </CardTitle>
                        <CardDescription>
                            {/* {data ? new Date(data.createdAt).toLocaleString("pt-BR") : "—"} */}
                        </CardDescription>
                    </div>

                    {/* {data?.origin && <Badge variant="secondary">{data.origin}</Badge>} */}
                </CardHeader>


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
