"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { QrCode, Copy, Shield, Wallet, RefreshCw } from "lucide-react";
import Link from "next/link";

// shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const API = process.env.NEXT_PUBLIC_API_URL || "";
const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

type Network = "TRON" | "ETHEREUM" | "SOLANA";

type DepositAddress = {
    network: Network;
    address: string;
    qrCode?: string; // base64 PNG opcional
    memoTag?: string; // se alguma rede exigir (não comum para USDT nessas redes, mas deixado aqui)
};

export default function ReceiveUSDTPage() {
    const [network, setNetwork] = useState<Network>("TRON");
    const { data, isLoading, mutate } = useSWR<DepositAddress>(
        API ? `${API}/wallets/usdt/deposit-address?network=${network}` : null,
        fetcher,
        { refreshInterval: 0 }
    );

    const tips = useMemo(() => {
        switch (network) {
            case "TRON":
                return {
                    label: "TRC-20",
                    note: "Endereços TRON geralmente começam com 'T'. Envie apenas USDT (TRC-20).",
                };
            case "ETHEREUM":
                return {
                    label: "ERC-20",
                    note: "Endereços Ethereum começam com '0x'. Envie apenas USDT (ERC-20).",
                };
            case "SOLANA":
                return {
                    label: "SPL",
                    note: "Endereços Solana são base58. Envie apenas USDT (SPL).",
                };
        }
    }, [network]);

    async function onCopy(text?: string) {
        if (!text) { return; }
        await navigator.clipboard.writeText(text);
        toast.success("Copiado para a área de transferência");
    }

    return (
        <div className="min-h-screen w-full px-4 md:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Receber USDT</h1>
                    <p className="text-sm text-muted-foreground">Selecione a rede e use o endereço/QR para receber USDT diretamente na sua carteira Otsem.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => mutate()} className="gap-2"><RefreshCw className="size-4" /> Atualizar</Button>
                    <Link href="/dashboard"><Button variant="outline" className="gap-2"><Wallet className="size-4" /> Dashboard</Button></Link>
                </div>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Escolha a rede</CardTitle>
                    <CardDescription>TRON (TRC-20), Ethereum (ERC-20) ou Solana (SPL).</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                        <Label>Rede</Label>
                        <Select defaultValue={network} onValueChange={(v) => setNetwork(v as Network)}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TRON">TRON (TRC-20)</SelectItem>
                                <SelectItem value="ETHEREUM">ETHEREUM (ERC-20)</SelectItem>
                                <SelectItem value="SOLANA">SOLANA (SPL)</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-2 text-xs text-muted-foreground">Padrão de rede: <Badge variant="secondary">{tips.label}</Badge></div>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Endereço de depósito USDT ({tips.label})</Label>
                        <div className="flex gap-2 mt-1">
                            <Input readOnly value={data?.address ?? (isLoading ? "Carregando…" : "—")} />
                            <Button variant="secondary" onClick={() => onCopy(data?.address)} className="shrink-0"><Copy className="size-4" /></Button>
                        </div>
                        {data?.memoTag && (
                            <div className="mt-3">
                                <Label>Memo/Tag</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input readOnly value={data.memoTag} />
                                    <Button variant="secondary" onClick={() => onCopy(data.memoTag)} className="shrink-0"><Copy className="size-4" /></Button>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">{tips.note}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><QrCode className="size-5" /> QR Code</CardTitle>
                    <CardDescription>Use o QR para facilitar o recebimento no caixa/PDV.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center border rounded-xl p-4 min-h-[220px]">
                        {data?.qrCode ? (
                            <img src={data.qrCode} alt="QR USDT" className="rounded-xl w-full max-w-xs" />
                        ) : (
                            <div className="text-sm text-muted-foreground">QR indisponível para esta rede/endereço.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="size-4" /> Envie <b className="mx-1">apenas USDT</b> na rede selecionada. Envios em redes diferentes serão <b className="mx-1">perdidos</b>.
            </div>
        </div>
    );
}
