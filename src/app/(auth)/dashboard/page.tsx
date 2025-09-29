
"use client";

// --- React, SWR, ICONS ---
import React, { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw,
    Wallet,
} from "lucide-react";

// ——— shadcn/ui ———
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// ——— Sonner ———
import { toast } from "sonner";

// ——— Mock API helpers ———
import { swrFetcher, apiPost } from "@/lib/api";


const fmtBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        v ?? 0
    );
const fmtUSD = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        v ?? 0
    );
const timeAgo = (iso?: string) => {
    if (!iso) { return ""; }
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) { return "agora"; }
    if (m < 60) { return `${m} min`; }
    const h = Math.floor(m / 60);
    if (h < 24) { return `${h} h`; }
    const d = Math.floor(h / 24);
    return `${d} d`;
};

// Types (ajuste se necessário com a sua API)
type Balances = { brl: number; usdt: number };
type Tx = {
    id: string;
    createdAt: string;
    type: "CREDIT" | "DEBIT";
    asset: "BRL" | "USDT";
    amount: number;
    description?: string;
};

// ——— Actions Modals ———
// function ConvertModal({ onDone }: { onDone?: () => void }) {
//     const [amount, setAmount] = useState<number>(0);
//     const [loading, setLoading] = useState(false);

//     async function onConvert() {
//         setLoading(true);
//         const result = await apiSafePost<{
//             ok: true; rate: number; amountBRL: number; usdtAdded: number;
//         }>(`${API}/conversions/brl-to-usdt`, { amountBRL: Number(amount) });

//         setLoading(false);

//         if (!result.ok) {
//             toast.error(result.error.message);
//             return;
//         }

//         toast.success(`BRL ${amount} convertido para USDT (demo).`);
//         onDone?.();
//     }

//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <Button className="gap-2">
//                     <ArrowRightLeft className="size-4" /> Converter BRL → USDT
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//                 <DialogHeader>
//                     <DialogTitle>Converter BRL → USDT</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-3">
//                     <label className="text-sm text-muted-foreground">Valor em BRL</label>
//                     <Input
//                         type="number"
//                         min={0}
//                         step="0.01"
//                         value={amount.toString()} // ✅ sempre string
//                         onChange={(e) => setAmount(Number(e.target.value) || 0)}
//                         placeholder="0,00"
//                     />
//                     <Button
//                         onClick={onConvert}
//                         disabled={loading || !amount}
//                         className="w-full"
//                     >
//                         {loading ? "Convertendo…" : "Converter"}
//                     </Button>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

// function PayoutModal({ onDone }: { onDone?: () => void }) {
//     const { data: balances } = useSWR<{ brl: number; usdt: number }>(
//         "/wallets/me",
//         swrFetcher
//     );
//     const usdtBalance = balances?.usdt ?? 0;

//     const [network, setNetwork] = useState<"TRON" | "ETHEREUM" | "SOLANA">("TRON");
//     const [toAddress, setToAddress] = useState("");
//     const [amount, setAmount] = useState<number>(0);
//     const [loading, setLoading] = useState(false);

//     const insuficiente = amount > 0 && amount > usdtBalance;

//     async function onPayout() {
//         setLoading(true);
//         const result = await apiSafePost<{ txHash: string }>(`${API}/payouts`, {
//             network,
//             toAddress,
//             amount,
//         });

//         setLoading(false);

//         if (!result.ok) {
//             toast.error(result.error.message);
//             return;
//         }

//         toast.success(`Payout criado. Hash: ${result.data.txHash ?? "pendente"}`);
//         onDone?.();

//     }

//     return (
//         <Dialog>
//             <DialogTrigger asChild>
//                 <Button variant="outline" className="gap-2"><ArrowUpRight className="size-4" /> Enviar USDT</Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-lg">
//                 <DialogHeader>
//                     <DialogTitle>Enviar USDT (on-chain)</DialogTitle>
//                 </DialogHeader>

//                 <div className="text-xs text-muted-foreground -mt-2 mb-2">
//                     Saldo disponível: <b>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(usdtBalance)}</b>
//                 </div>

//                 <div className="space-y-3">
//                     <div className="grid grid-cols-3 gap-2">
//                         {(["TRON", "ETHEREUM", "SOLANA"] as const).map(n => (
//                             <Button key={n} variant={network === n ? "default" : "secondary"} onClick={() => setNetwork(n)} className="w-full">
//                                 {n}
//                             </Button>
//                         ))}
//                     </div>
//                     <Input placeholder="Endereço (wallet do recebedor)" value={toAddress} onChange={e => setToAddress(e.target.value)} />
//                     <Input type="number" min={0} step="0.01" placeholder="Valor em USDT" value={amount} onChange={e => setAmount(Number(e.target.value))} />

//                     {insuficiente && (
//                         <div className="text-xs text-rose-600">Saldo USDT insuficiente para enviar {amount}.</div>
//                     )}

//                     <Button
//                         onClick={onPayout}
//                         disabled={loading || !toAddress || amount <= 0 || insuficiente}
//                         className="w-full"
//                     >
//                         {loading ? "Enviando…" : "Enviar"}
//                     </Button>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

// ——— Dashboard ———
export default function Dashboard() {
    // ✅ Sempre use caminho relativo — assim o mock funciona mesmo sem NEXT_PUBLIC_API_URL
    const {
        data: balances,
        isLoading: loadingBalances,
        mutate: refetchBalances,
    } = useSWR<Balances>("/wallets/me", swrFetcher);
    console.log(loadingBalances);

    // ✅ a lista do mock retorna { items: Tx[] }
    const {
        data: txList,
        isLoading: loadingTxs,
        mutate: refetchTxs,
    } = useSWR<{ items: Tx[] }>("/transactions?limit=10", swrFetcher);

    const txs = txList?.items ?? [];

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
                    <p className="text-sm text-muted-foreground">
                        Acompanhe saldos, adicione BRL via Pix e envie USDT on-chain.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            await apiPost("/demo/fund", { addBRL: 10000, addUSDT: 2000 });
                            toast.success("Demo carregado: +R$ 10.000 e +2.000 USDT");
                            await Promise.all([refetchBalances(), refetchTxs()]);
                        }}
                    >
                        Carregar demo
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            refetchBalances();
                            refetchTxs();
                        }}
                        className="gap-2"
                    >
                        <RefreshCw className="size-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {/* Saldo Cards */}
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
                            <TableBody>
                                {loadingTxs && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Carregando…
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loadingTxs && (!txs || txs.length === 0) && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Sem transações recentes
                                        </TableCell>
                                    </TableRow>
                                )}
                                {txs?.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {timeAgo(t.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className={`inline-flex items-center gap-1 text-sm ${t.type === "CREDIT"
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"
                                                    }`}
                                            >
                                                {t.type === "CREDIT" ? (
                                                    <ArrowDownRight className="size-4" />
                                                ) : (
                                                    <ArrowUpRight className="size-4" />
                                                )}
                                                {t.type === "CREDIT" ? "Crédito" : "Débito"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{t.asset}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {t.asset === "BRL" ? fmtBRL(t.amount) : fmtUSD(t.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[320px] truncate">
                                            {t.description ?? "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
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
