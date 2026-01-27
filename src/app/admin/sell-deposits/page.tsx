"use client";

import * as React from "react";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Loader2, 
    ArrowRightLeft, 
    DollarSign, 
    Clock, 
    CheckCircle2,
    RefreshCw,
    Eye
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { isAxiosError } from "axios";

type SellDeposit = {
    id: string;
    createdAt: string;
    status: "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMED" | "USDT_SOLD" | "PIX_SENT" | "COMPLETED" | "FAILED" | "EXPIRED";
    customer: {
        id: string;
        name: string;
        email: string;
    };
    usdtAmount: number;
    brlAmount: number;
    exchangeRate: number;
    spreadPercent: number;
    network: "SOLANA" | "TRON";
    depositAddress: string;
    txHash?: string;
    pixEndToEnd?: string;
};

type PendingDeposit = {
    txHash: string;
    amount: number;
    network: string;
    fromAddress: string;
    confirmations: number;
    timestamp: string;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatUSDT(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusColor(status: string): string {
    switch (status) {
        case "PENDING_DEPOSIT":
            return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
        case "DEPOSIT_CONFIRMED":
            return "bg-blue-500/20 text-blue-600 border-blue-500/30";
        case "USDT_SOLD":
            return "bg-[#6F00FF]/20 text-[#6F00FF] border-[#6F00FF]/30";
        case "PIX_SENT":
            return "bg-cyan-500/20 text-cyan-600 border-cyan-500/30";
        case "COMPLETED":
            return "bg-green-500/20 text-green-600 border-green-500/30";
        case "FAILED":
            return "bg-red-500/20 text-red-600 border-red-500/30";
        case "EXPIRED":
            return "bg-gray-500/20 text-gray-600 border-gray-500/30";
        default:
            return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "PENDING_DEPOSIT":
            return "Aguardando Depósito";
        case "DEPOSIT_CONFIRMED":
            return "Depósito Confirmado";
        case "USDT_SOLD":
            return "USDT Vendido";
        case "PIX_SENT":
            return "PIX Enviado";
        case "COMPLETED":
            return "Concluída";
        case "FAILED":
            return "Falhou";
        case "EXPIRED":
            return "Expirada";
        default:
            return status;
    }
}

export default function SellDepositsPage() {
    const [loading, setLoading] = React.useState(true);
    const [deposits, setDeposits] = React.useState<SellDeposit[]>([]);
    const [pendingOkxDeposits, setPendingOkxDeposits] = React.useState<PendingDeposit[]>([]);
    const [selectedDeposit, setSelectedDeposit] = React.useState<SellDeposit | null>(null);
    const [processing, setProcessing] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    async function loadData() {
        setLoading(true);
        try {
            const [depositsRes, pendingRes] = await Promise.all([
                http.get<{ data: SellDeposit[] }>("/admin/sell-conversions"),
                http.get<{ data: PendingDeposit[] }>("/wallet/pending-sell-deposits"),
            ]);

            const depositsData = Array.isArray(depositsRes.data) 
                ? depositsRes.data 
                : (depositsRes.data.data || []);
            const pendingData = Array.isArray(pendingRes.data) 
                ? pendingRes.data 
                : (pendingRes.data.data || []);

            setDeposits(depositsData);
            setPendingOkxDeposits(pendingData);
        } catch (err) {
            console.error("Erro ao carregar vendas:", err);
            setDeposits([]);
        } finally {
            setLoading(false);
        }
    }

    async function refreshPendingDeposits() {
        setRefreshing(true);
        try {
            const res = await http.get<{ data: PendingDeposit[] }>("/wallet/pending-sell-deposits");
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setPendingOkxDeposits(data);
            toast.success("Depósitos atualizados");
        } catch (err) {
            console.error("Erro ao atualizar depósitos:", err);
            toast.error("Erro ao atualizar depósitos");
        } finally {
            setRefreshing(false);
        }
    }

    async function processDeposit(conversionId: string) {
        if (!selectedDeposit || selectedDeposit.status !== "DEPOSIT_CONFIRMED") {
            toast.error("Só é possível processar vendas com depósito confirmado");
            return;
        }
        setProcessing(true);
        try {
            await http.post(`/wallet/process-sell/${conversionId}`);
            toast.success("Venda processada com sucesso!");
            setSelectedDeposit(null);
            loadData();
        } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao processar venda");
        } finally {
            setProcessing(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, []);

    const pendingCount = deposits.filter(d => d.status === "PENDING_DEPOSIT").length;
    const confirmedCount = deposits.filter(d => d.status === "DEPOSIT_CONFIRMED").length;
    const completedCount = deposits.filter(d => d.status === "COMPLETED").length;
    const totalVolume = deposits
        .filter(d => d.status === "COMPLETED")
        .reduce((sum, d) => sum + (d.usdtAmount || 0), 0);

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Vendas USDT → BRL</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie depósitos de USDT e processe vendas
                    </p>
                </div>
                <Button onClick={loadData} variant="outline" className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aguardando Depósito</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">Clientes enviando USDT</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Prontos p/ Processar</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{confirmedCount}</div>
                        <p className="text-xs text-muted-foreground">Depósitos confirmados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">PIX enviado ao cliente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatUSDT(totalVolume)}</div>
                        <p className="text-xs text-muted-foreground">USDT vendido</p>
                    </CardContent>
                </Card>
            </div>

            {pendingOkxDeposits.length > 0 && (
                <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-blue-600">Depósitos Detectados na OKX</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Depósitos recebidos aguardando associação
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={refreshPendingDeposits}
                            disabled={refreshing}
                            className="border-blue-500/30"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                            Verificar
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingOkxDeposits.map((deposit) => (
                                <div 
                                    key={deposit.txHash} 
                                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{formatUSDT(deposit.amount)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {deposit.network} • {deposit.confirmations} confirmações
                                        </p>
                                        <code className="text-xs text-muted-foreground">
                                            {deposit.txHash.slice(0, 16)}...{deposit.txHash.slice(-8)}
                                        </code>
                                    </div>
                                    <Badge variant="outline" className="border-blue-500/30 text-blue-600">
                                        Novo
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : deposits.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma venda encontrada</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="text-right">USDT</TableHead>
                                        <TableHead className="text-right">BRL</TableHead>
                                        <TableHead>Rede</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deposits.map((deposit) => (
                                        <TableRow key={deposit.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(deposit.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{deposit.customer?.name || "-"}</p>
                                                    <p className="text-xs text-muted-foreground">{deposit.customer?.email || "-"}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatUSDT(deposit.usdtAmount ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(deposit.brlAmount ?? 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={deposit.network === 'SOLANA' ? 'border-[#6F00FF] text-[#6F00FF]' : 'border-red-500 text-red-600'}>
                                                    {deposit.network || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(deposit.status)}>
                                                    {getStatusLabel(deposit.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedDeposit(deposit)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Venda</DialogTitle>
                        <DialogDescription>
                            {selectedDeposit && getStatusLabel(selectedDeposit.status)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDeposit && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Cliente</p>
                                    <p className="font-medium">{selectedDeposit.customer?.name || "-"}</p>
                                    <p className="text-xs text-muted-foreground">{selectedDeposit.customer?.email || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Data</p>
                                    <p className="font-medium">{formatDate(selectedDeposit.createdAt)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">USDT a Receber</p>
                                    <p className="text-xl font-bold">{formatUSDT(selectedDeposit.usdtAmount ?? 0)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">BRL a Pagar</p>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedDeposit.brlAmount ?? 0)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Taxa de Câmbio:</span>
                                    <span>R$ {(selectedDeposit.exchangeRate ?? 0).toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Spread:</span>
                                    <span>{(selectedDeposit.spreadPercent ?? 0).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Rede:</span>
                                    <span className={selectedDeposit.network === "SOLANA" ? "text-[#6F00FF]" : "text-red-600"}>
                                        {selectedDeposit.network}
                                    </span>
                                </div>
                            </div>

                            {selectedDeposit.depositAddress && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">Endereço de Depósito</p>
                                    <code className="text-xs bg-muted p-2 rounded block break-all">
                                        {selectedDeposit.depositAddress}
                                    </code>
                                </div>
                            )}

                            {selectedDeposit.txHash && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">TX Hash</p>
                                    <code className="text-xs bg-muted p-2 rounded block break-all">
                                        {selectedDeposit.txHash}
                                    </code>
                                </div>
                            )}

                            {selectedDeposit.pixEndToEnd && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">PIX End-to-End</p>
                                    <code className="text-xs bg-muted p-2 rounded block break-all">
                                        {selectedDeposit.pixEndToEnd}
                                    </code>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        {selectedDeposit && selectedDeposit.status === "DEPOSIT_CONFIRMED" && (
                            <Button
                                onClick={() => processDeposit(selectedDeposit.id)}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-500"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Processar Venda
                                    </>
                                )}
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setSelectedDeposit(null)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
