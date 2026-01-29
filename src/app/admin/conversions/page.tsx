"use client";

import * as React from "react";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Loader2, 
    ArrowRightLeft, 
    DollarSign, 
    TrendingUp, 
    Users, 
    Search,
    ChevronDown,
    X
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Conversion = {
    id: string;
    createdAt: string;
    status: "PENDING" | "PIX_SENT" | "USDT_BOUGHT" | "USDT_WITHDRAWN" | "COMPLETED" | "FAILED";
    customer: {
        id: string;
        name: string;
        email: string;
    };
    brlCharged: number;
    brlExchanged: number;
    spreadBrl: number;
    spreadPercent: number;
    usdtPurchased: number;
    usdtWithdrawn: number;
    exchangeRate: number;
    okxWithdrawFeeUsdt: number;
    okxWithdrawFeeBrl: number;
    okxTradingFee: number;
    totalOkxFees: number;
    grossProfit: number;
    affiliateCommission: number;
    netProfit: number;
    network: "SOLANA" | "TRON";
    walletAddress?: string;
    pixEndToEnd?: string;
    affiliate?: {
        id: string;
        code: string;
        name: string;
    } | null;
    okxOrderId?: string;
    okxWithdrawId?: string;
};

type ConversionStats = {
    totalCount: number;
    volumeBrl: number;
    volumeUsdt: number;
    grossProfit: number;
    totalOkxFees: number;
    totalCommissions: number;
    netProfit: number;
    avgRate: number;
};

type Customer = {
    id: string;
    name: string;
};

type Affiliate = {
    id: string;
    code: string;
    name: string;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatCurrencyCents(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value / 100);
}

function formatUSDT(value: number): string {
    return `$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatUSDTCents(value: number): string {
    return `$ ${(value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
}

function getStatusColor(status: string) {
    switch (status) {
        case "COMPLETED":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        case "PENDING":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "PIX_SENT":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "USDT_BOUGHT":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-[#8B2FFF]";
        case "USDT_WITHDRAWN":
            return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
        case "FAILED":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "COMPLETED":
            return "Concluída";
        case "PENDING":
            return "Pendente";
        case "PIX_SENT":
            return "PIX Enviado";
        case "USDT_BOUGHT":
            return "USDT Comprado";
        case "USDT_WITHDRAWN":
            return "USDT Sacado";
        case "FAILED":
            return "Falhou";
        default:
            return status;
    }
}

function getDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Add one day to end date to include today's conversions
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const format = (d: Date) => d.toISOString().slice(0, 10);
    return {
        inicio: format(thirtyDaysAgo),
        fim: format(tomorrow),
    };
}

export default function ConversionsPage() {
    const defaultDates = getDefaultDates();
    const [loading, setLoading] = React.useState(true);
    const [conversions, setConversions] = React.useState<Conversion[]>([]);
    const [stats, setStats] = React.useState<ConversionStats | null>(null);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [affiliates, setAffiliates] = React.useState<Affiliate[]>([]);
    const [selectedConversion, setSelectedConversion] = React.useState<Conversion | null>(null);

    const [dataInicio, setDataInicio] = React.useState(defaultDates.inicio);
    const [dataFim, setDataFim] = React.useState(defaultDates.fim);
    const [customerFilter, setCustomerFilter] = React.useState("");
    const [affiliateFilter, setAffiliateFilter] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("");

    async function loadData() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (dataInicio) params.dateStart = dataInicio;
            if (dataFim) params.dateEnd = dataFim;
            if (customerFilter) params.customerId = customerFilter;
            if (affiliateFilter) params.affiliateId = affiliateFilter;
            if (statusFilter) params.status = statusFilter;

            const query = new URLSearchParams(params).toString();
            
            const [conversionsRes, statsRes] = await Promise.all([
                http.get<{ data: Conversion[] }>(`/admin/conversions?${query}`),
                http.get<{ data: ConversionStats }>(`/admin/conversions/stats?${query}`),
            ]);

            // Handle both { data: [...] } and direct array response
            const conversionsData = Array.isArray(conversionsRes.data) 
                ? conversionsRes.data 
                : (conversionsRes.data.data || []);
            const statsData = conversionsRes.data && typeof conversionsRes.data === 'object' && !Array.isArray(conversionsRes.data)
                ? (statsRes.data.data || statsRes.data)
                : null;

            setConversions(conversionsData);
            setStats(statsData as ConversionStats | null);
        } catch (err) {
            console.error("Erro ao carregar conversões:", err);
            setConversions([]);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        async function loadFilters() {
            try {
                const [customersRes, affiliatesRes] = await Promise.all([
                    http.get<{ data: Customer[] }>("/customers"),
                    http.get<{ data: Affiliate[] }>("/admin/affiliates"),
                ]);
                setCustomers(Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data || []);
                setAffiliates(Array.isArray(affiliatesRes.data) ? affiliatesRes.data : affiliatesRes.data.data || []);
            } catch (err) {
                console.error("Erro ao carregar filtros:", err);
            }
        }
        loadFilters();
    }, []);

    React.useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleFilterSubmit(e: React.FormEvent) {
        e.preventDefault();
        loadData();
    }

    function clearFilters() {
        setCustomerFilter("");
        setAffiliateFilter("");
        setStatusFilter("");
        setDataInicio(defaultDates.inicio);
        setDataFim(defaultDates.fim);
    }

    return (
        <div className="w-full p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Conversões BRL → USDT</h1>
                <p className="text-muted-foreground mt-1">
                    Acompanhe todas as conversões, lucros e comissões de afiliados
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Conversões</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                            No período selecionado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volume BRL</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrencyCents(stats?.volumeBrl ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatUSDTCents(stats?.volumeUsdt ?? 0)} em USDT
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(stats?.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrencyCents(stats?.netProfit ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bruto: {formatCurrencyCents(stats?.grossProfit ?? 0)} | Taxas OKX: {formatCurrencyCents(stats?.totalOkxFees ?? 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comissões Afiliados</CardTitle>
                        <Users className="h-4 w-4 text-[#6F00FF]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#6F00FF]">
                            {formatCurrencyCents(stats?.totalCommissions ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Taxa média: {(stats?.avgRate ?? 0).toFixed(4)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">Data Início</label>
                            <Input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">Data Fim</label>
                            <Input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">Cliente</label>
                            <Select value={customerFilter || "all"} onValueChange={(v) => setCustomerFilter(v === "all" ? "" : v)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">Afiliado</label>
                            <Select value={affiliateFilter || "all"} onValueChange={(v) => setAffiliateFilter(v === "all" ? "" : v)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {affiliates.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name} ({a.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">Status</label>
                            <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="PIX_SENT">PIX Enviado</SelectItem>
                                    <SelectItem value="USDT_BOUGHT">USDT Comprado</SelectItem>
                                    <SelectItem value="USDT_WITHDRAWN">USDT Sacado</SelectItem>
                                    <SelectItem value="COMPLETED">Concluída</SelectItem>
                                    <SelectItem value="FAILED">Falhou</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="gap-2">
                            <Search className="h-4 w-4" />
                            Buscar
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters}>
                            Limpar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Conversões</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : conversions.length === 0 ? (
                        <div className="text-center py-12">
                            <ArrowRightLeft className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-muted-foreground">Nenhuma conversão encontrada</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="text-right">BRL Pago</TableHead>
                                        <TableHead className="text-right">USDT</TableHead>
                                        <TableHead className="text-right">Spread</TableHead>
                                        <TableHead className="text-right">Taxas OKX</TableHead>
                                        <TableHead className="text-right">Lucro Líquido</TableHead>
                                        <TableHead>Rede</TableHead>
                                        <TableHead>Afiliado</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conversions.map((conv) => (
                                        <TableRow key={conv.id} className="cursor-pointer hover:bg-muted/50">
                                            <TableCell className="whitespace-nowrap">
                                                {formatShortDate(conv.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{conv.customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{conv.customer.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(conv.brlCharged ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatUSDT(conv.usdtWithdrawn ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {(conv.spreadPercent ?? 0).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-right text-orange-600">
                                                {formatCurrency(conv.totalOkxFees ?? 0)}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${(conv.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(conv.netProfit ?? 0)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={conv.network === 'SOLANA' ? 'border-[#6F00FF] text-[#6F00FF]' : 'border-blue-500 text-blue-600'}>
                                                    {conv.network || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {conv.affiliate ? (
                                                    <div className="text-[#6F00FF]">
                                                        <span className="font-medium">{conv.affiliate.code}</span>
                                                        <p className="text-xs">{formatCurrency(conv.affiliateCommission ?? 0)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(conv.status)}>
                                                    {getStatusLabel(conv.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedConversion(conv)}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
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

            <Dialog open={!!selectedConversion} onOpenChange={() => setSelectedConversion(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Conversão</DialogTitle>
                    </DialogHeader>
                    {selectedConversion && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Data/Hora</p>
                                    <p className="font-medium">{formatDate(selectedConversion.createdAt)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(selectedConversion.status)}>
                                        {getStatusLabel(selectedConversion.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Cliente</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Nome</p>
                                        <p className="font-medium">{selectedConversion.customer.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedConversion.customer.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Valores da Conversão</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">BRL Cobrado</p>
                                        <p className="text-xl font-bold">{formatCurrency(selectedConversion.brlCharged ?? 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">BRL Convertido</p>
                                        <p className="text-lg font-medium">{formatCurrency(selectedConversion.brlExchanged ?? 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Taxa de Câmbio</p>
                                        <p className="text-lg font-medium">R$ {(selectedConversion.exchangeRate ?? 0).toFixed(4)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">USDT Comprado</p>
                                        <p className="text-lg font-medium">{formatUSDT(selectedConversion.usdtPurchased ?? 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">USDT Sacado</p>
                                        <p className="text-xl font-bold text-green-600">{formatUSDT(selectedConversion.usdtWithdrawn ?? 0)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Rede</p>
                                        <Badge variant="outline" className={selectedConversion.network === 'SOLANA' ? 'border-[#6F00FF] text-[#6F00FF]' : 'border-blue-500 text-blue-600'}>
                                            {selectedConversion.network || '-'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Taxas OKX</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa Saque ({selectedConversion.network || '-'}):</span>
                                            <span className="text-orange-600">{formatCurrency(selectedConversion.okxWithdrawFeeBrl ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa Trading (0.1%):</span>
                                            <span className="text-orange-600">{formatCurrency(selectedConversion.okxTradingFee ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">Total Taxas OKX:</span>
                                            <span className="font-medium text-orange-600">{formatCurrency(selectedConversion.totalOkxFees ?? 0)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Spread Aplicado:</span>
                                            <span className="font-medium">{(selectedConversion.spreadPercent ?? 0).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Lucro Bruto:</span>
                                            <span className="text-green-600">{formatCurrency(selectedConversion.grossProfit ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Comissão Afiliado:</span>
                                            <span className="text-[#6F00FF]">{formatCurrency(selectedConversion.affiliateCommission ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold">Lucro Líquido:</span>
                                            <span className={`font-bold text-lg ${(selectedConversion.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(selectedConversion.netProfit ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedConversion.affiliate && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Afiliado</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Nome</p>
                                            <p className="font-medium">{selectedConversion.affiliate.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Código</p>
                                            <p className="font-medium text-[#6F00FF]">{selectedConversion.affiliate.code}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Comissão</p>
                                            <p className="font-bold text-[#6F00FF]">
                                                {formatCurrency(selectedConversion.affiliateCommission ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Referências</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedConversion.pixEndToEnd && (
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">PIX End-to-End</p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                                                {selectedConversion.pixEndToEnd}
                                            </code>
                                        </div>
                                    )}
                                    {selectedConversion.okxOrderId && (
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">OKX Order ID</p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {selectedConversion.okxOrderId}
                                            </code>
                                        </div>
                                    )}
                                    {selectedConversion.okxWithdrawId && (
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">OKX Withdraw ID</p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {selectedConversion.okxWithdrawId}
                                            </code>
                                        </div>
                                    )}
                                    {selectedConversion.walletAddress && (
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-muted-foreground">Wallet Address</p>
                                            <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                                                {selectedConversion.walletAddress}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
