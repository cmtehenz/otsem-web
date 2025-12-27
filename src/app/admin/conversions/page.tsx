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
    status: "PENDING" | "COMPLETED" | "FAILED";
    customer: {
        id: string;
        name: string;
        email: string;
    };
    brlPaid: number;
    usdtCredited: number;
    exchangeRateUsed: number;
    spreadPercent: number;
    pixFee: number;
    okxFee: number;
    internalFee: number;
    totalFeesBrl: number;
    profitBrl: number;
    affiliate?: {
        id: string;
        code: string;
        name: string;
    } | null;
    affiliateCommissionBrl: number;
    okxOrderId?: string;
    sourceOfBRL: "INTER" | "OKX" | "FD_BANK";
};

type ConversionStats = {
    totalCount: number;
    volumeBrl: number;
    volumeUsdt: number;
    grossProfit: number;
    netProfit: number;
    avgRate: number;
    totalCommissions: number;
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
    }).format(value / 100);
}

function formatUSDT(value: number): string {
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

    const format = (d: Date) => d.toISOString().slice(0, 10);
    return {
        inicio: format(thirtyDaysAgo),
        fim: format(today),
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

            setConversions(conversionsRes.data.data || []);
            setStats(statsRes.data.data || null);
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
                            {formatCurrency(stats?.volumeBrl ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatUSDT(stats?.volumeUsdt ?? 0)} em USDT
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats?.netProfit ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bruto: {formatCurrency(stats?.grossProfit ?? 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comissões Afiliados</CardTitle>
                        <Users className="h-4 w-4 text-violet-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-violet-600">
                            {formatCurrency(stats?.totalCommissions ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Taxa média: {((stats?.avgRate ?? 0) / 100).toFixed(4)}
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
                            <Select value={customerFilter} onValueChange={setCustomerFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos</SelectItem>
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
                            <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos</SelectItem>
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
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos</SelectItem>
                                    <SelectItem value="COMPLETED">Concluída</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
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
                                        <TableHead className="text-right">Taxa</TableHead>
                                        <TableHead className="text-right">Lucro</TableHead>
                                        <TableHead>Afiliado</TableHead>
                                        <TableHead className="text-right">Comissão</TableHead>
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
                                                {formatCurrency(conv.brlPaid)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatUSDT(conv.usdtCredited)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {(conv.exchangeRateUsed / 100).toFixed(4)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                {formatCurrency(conv.profitBrl)}
                                            </TableCell>
                                            <TableCell>
                                                {conv.affiliate ? (
                                                    <span className="text-violet-600 font-medium">
                                                        {conv.affiliate.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {conv.affiliateCommissionBrl > 0 ? (
                                                    <span className="text-violet-600">
                                                        {formatCurrency(conv.affiliateCommissionBrl)}
                                                    </span>
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
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">BRL Pago</p>
                                        <p className="text-xl font-bold">{formatCurrency(selectedConversion.brlPaid)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">USDT Creditado</p>
                                        <p className="text-xl font-bold">{formatUSDT(selectedConversion.usdtCredited)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Taxa de Câmbio</p>
                                        <p className="text-xl font-bold">{(selectedConversion.exchangeRateUsed / 100).toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Taxas e Lucro</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa PIX:</span>
                                            <span>{formatCurrency(selectedConversion.pixFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa OKX:</span>
                                            <span>{formatCurrency(selectedConversion.okxFee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa Interna:</span>
                                            <span>{formatCurrency(selectedConversion.internalFee)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">Total Taxas:</span>
                                            <span className="font-medium">{formatCurrency(selectedConversion.totalFeesBrl)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Spread:</span>
                                            <span>{selectedConversion.spreadPercent.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fonte BRL:</span>
                                            <span>{selectedConversion.sourceOfBRL}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold text-green-600">Lucro:</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                {formatCurrency(selectedConversion.profitBrl)}
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
                                            <p className="font-medium text-violet-600">{selectedConversion.affiliate.code}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Comissão</p>
                                            <p className="font-bold text-violet-600">
                                                {formatCurrency(selectedConversion.affiliateCommissionBrl)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedConversion.okxOrderId && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Referências</h4>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Order ID OKX</p>
                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                            {selectedConversion.okxOrderId}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
