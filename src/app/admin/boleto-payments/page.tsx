"use client";

import * as React from "react";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Receipt,
    DollarSign,
    Clock,
    CheckCircle2,
    RefreshCw,
    Eye,
    XCircle,
    Banknote,
    Copy,
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

type BoletoPayment = {
    id: string;
    barcode: string;
    boletoAmount: number;
    serviceFee: number;
    serviceFeePct: number;
    totalBrl: number;
    cryptoCurrency: string;
    cryptoAmount: number;
    exchangeRate: number;
    network: string;
    status: string;
    description?: string;
    rejectionReason?: string;
    adminNotes?: string;
    customer: {
        id: string;
        name: string;
        username?: string | null;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
};

type Stats = {
    totalCount: number;
    pendingCount: number;
    paidCount: number;
    totalBrlPaid: number;
    totalFeesCollected: number;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatCrypto(value: number, currency: string): string {
    const decimals = currency === "USDT" ? 2 : 4;
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`;
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
        case "PENDING_APPROVAL":
            return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
        case "ADMIN_PAYING":
            return "bg-blue-500/20 text-blue-600 border-blue-500/30";
        case "PAID":
            return "bg-green-500/20 text-green-600 border-green-500/30";
        case "REJECTED":
            return "bg-red-500/20 text-red-600 border-red-500/30";
        case "CANCELLED":
            return "bg-gray-500/20 text-gray-600 border-gray-500/30";
        case "REFUNDED":
            return "bg-purple-500/20 text-purple-600 border-purple-500/30";
        default:
            return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "PENDING_APPROVAL":
            return "Aguardando Aprovação";
        case "ADMIN_PAYING":
            return "Admin Pagando";
        case "PAID":
            return "Pago";
        case "REJECTED":
            return "Rejeitado";
        case "CANCELLED":
            return "Cancelado";
        case "REFUNDED":
            return "Reembolsado";
        default:
            return status;
    }
}

export default function AdminBoletoPaymentsPage() {
    const [loading, setLoading] = React.useState(true);
    const [payments, setPayments] = React.useState<BoletoPayment[]>([]);
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [selectedPayment, setSelectedPayment] = React.useState<BoletoPayment | null>(null);
    const [processing, setProcessing] = React.useState(false);
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [actionModal, setActionModal] = React.useState<{
        type: "processing" | "reject" | "paid";
        paymentId: string;
    } | null>(null);
    const [actionReason, setActionReason] = React.useState("");

    async function loadData() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (statusFilter !== "all") params.status = statusFilter;

            const [paymentsRes, statsRes] = await Promise.all([
                http.get<BoletoPayment[] | { data: BoletoPayment[] }>("/admin/boleto-payments", { params }),
                http.get<Stats | { data: Stats }>("/admin/boleto-payments/stats"),
            ]);

            const paymentsData = Array.isArray(paymentsRes.data)
                ? paymentsRes.data
                : (paymentsRes.data.data || []);
            setPayments(paymentsData);

            const statsData = "totalCount" in statsRes.data
                ? statsRes.data
                : (statsRes.data as { data: Stats }).data;
            setStats(statsData as Stats);
        } catch (err) {
            console.error("Erro ao carregar pagamentos de boleto:", err);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(type: "processing" | "reject" | "paid", paymentId: string) {
        setProcessing(true);
        try {
            const endpoint = `/admin/boleto-payments/${paymentId}/${type === "processing" ? "processing" : type === "reject" ? "reject" : "paid"}`;
            const body: Record<string, string> = {};
            if (type === "reject" && actionReason) body.reason = actionReason;
            if (type === "paid" && actionReason) body.notes = actionReason;

            await http.post(endpoint, body);

            const messages = {
                processing: "Pagamento marcado como em processamento",
                reject: "Pagamento rejeitado",
                paid: "Pagamento confirmado como pago",
            };
            toast.success(messages[type]);
            setActionModal(null);
            setActionReason("");
            setSelectedPayment(null);
            loadData();
        } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao processar ação");
        } finally {
            setProcessing(false);
        }
    }

    React.useEffect(() => {
        loadData();
    }, [statusFilter]);

    const filterOptions = [
        { key: "all", label: "Todos" },
        { key: "PENDING_APPROVAL", label: "Pendentes" },
        { key: "ADMIN_PAYING", label: "Em Pagamento" },
        { key: "PAID", label: "Pagos" },
        { key: "REJECTED", label: "Rejeitados" },
    ];

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Pagamentos de Boleto</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Gerencie pagamentos de boleto feitos com crypto
                    </p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="gap-2 self-end sm:self-auto">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCount}</div>
                            <p className="text-xs text-muted-foreground">Pagamentos totais</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.paidCount}</div>
                            <p className="text-xs text-muted-foreground">Boletos pagos</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Volume Pago</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats.totalBrlPaid)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total em BRL pago</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxas</CardTitle>
                            <Banknote className="h-4 w-4 text-[#3871F1]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#3871F1]">
                                {formatCurrency(stats.totalFeesCollected)}
                            </div>
                            <p className="text-xs text-muted-foreground">Total de taxas</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {filterOptions.map((f) => (
                    <Button
                        key={f.key}
                        variant={statusFilter === f.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(f.key)}
                        className={statusFilter === f.key ? "bg-[#3871F1] hover:bg-[#234FB3]" : ""}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum pagamento encontrado</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile card view */}
                            <div className="md:hidden space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-lg border p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => setSelectedPayment(payment)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium">{payment.customer?.name || "-"}</p>
                                                {payment.customer?.username && (
                                                    <p className="text-sm font-medium text-[#3871F1]">
                                                        @{payment.customer.username}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.customer?.email || "-"}
                                                </p>
                                            </div>
                                            <Badge className={getStatusColor(payment.status)}>
                                                {getStatusLabel(payment.status)}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Boleto</p>
                                                <p className="font-medium">{formatCurrency(payment.boletoAmount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Crypto</p>
                                                <p className="font-medium">
                                                    {formatCrypto(payment.cryptoAmount, payment.cryptoCurrency)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(payment.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table view */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Código de barras</TableHead>
                                            <TableHead className="text-right">Boleto (BRL)</TableHead>
                                            <TableHead className="text-right">Taxa (BRL)</TableHead>
                                            <TableHead className="text-right">Crypto</TableHead>
                                            <TableHead>Rede</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((payment) => (
                                            <TableRow
                                                key={payment.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                            >
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(payment.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {payment.customer?.name || "-"}
                                                        </p>
                                                        {payment.customer?.username && (
                                                            <p className="text-xs font-medium text-[#3871F1]">
                                                                @{payment.customer.username}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            {payment.customer?.email || "-"}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(payment.barcode);
                                                            toast.success("Código copiado!");
                                                        }}
                                                        className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition"
                                                    >
                                                        {payment.barcode.slice(0, 16)}...
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(payment.boletoAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {formatCurrency(payment.serviceFee)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCrypto(payment.cryptoAmount, payment.cryptoCurrency)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {payment.network || "-"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(payment.status)}>
                                                        {getStatusLabel(payment.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedPayment(payment)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Pagamento de Boleto</DialogTitle>
                        <DialogDescription>
                            {selectedPayment && getStatusLabel(selectedPayment.status)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Cliente</p>
                                    <p className="font-medium">{selectedPayment.customer?.name || "-"}</p>
                                    {selectedPayment.customer?.username && (
                                        <p className="text-sm font-medium text-[#3871F1]">
                                            @{selectedPayment.customer.username}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {selectedPayment.customer?.email || "-"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Data</p>
                                    <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-1">Código de Barras</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
                                        {selectedPayment.barcode}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedPayment.barcode);
                                            toast.success("Código copiado!");
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t pt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Valor do Boleto</p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(selectedPayment.boletoAmount)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Crypto Debitado</p>
                                    <p className="text-xl font-bold">
                                        {formatCrypto(
                                            selectedPayment.cryptoAmount,
                                            selectedPayment.cryptoCurrency
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Taxa de Serviço:</span>
                                    <span>
                                        {formatCurrency(selectedPayment.serviceFee)} (
                                        {selectedPayment.serviceFeePct}%)
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total BRL:</span>
                                    <span className="font-medium">
                                        {formatCurrency(selectedPayment.totalBrl)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cotação:</span>
                                    <span>
                                        1 {selectedPayment.cryptoCurrency} ={" "}
                                        {formatCurrency(selectedPayment.exchangeRate)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Rede:</span>
                                    <span>{selectedPayment.network || "-"}</span>
                                </div>
                                {selectedPayment.description && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Descrição:</span>
                                        <span>{selectedPayment.description}</span>
                                    </div>
                                )}
                            </div>

                            {selectedPayment.rejectionReason && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">Motivo da Rejeição</p>
                                    <p className="text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-600">
                                        {selectedPayment.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="flex-wrap gap-2">
                        {selectedPayment?.status === "PENDING_APPROVAL" && (
                            <>
                                <Button
                                    onClick={() =>
                                        setActionModal({
                                            type: "processing",
                                            paymentId: selectedPayment.id,
                                        })
                                    }
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Processar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        setActionModal({
                                            type: "reject",
                                            paymentId: selectedPayment.id,
                                        })
                                    }
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                </Button>
                            </>
                        )}
                        {selectedPayment?.status === "ADMIN_PAYING" && (
                            <>
                                <Button
                                    onClick={() =>
                                        setActionModal({
                                            type: "paid",
                                            paymentId: selectedPayment.id,
                                        })
                                    }
                                    className="bg-green-600 hover:bg-green-500"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Confirmar Pagamento
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        setActionModal({
                                            type: "reject",
                                            paymentId: selectedPayment.id,
                                        })
                                    }
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Rejeitar
                                </Button>
                            </>
                        )}
                        <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Confirmation Dialog */}
            <Dialog open={!!actionModal} onOpenChange={() => { setActionModal(null); setActionReason(""); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {actionModal?.type === "processing" && "Processar Pagamento"}
                            {actionModal?.type === "reject" && "Rejeitar Pagamento"}
                            {actionModal?.type === "paid" && "Confirmar Pagamento"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionModal?.type === "processing" &&
                                "O pagamento será marcado como em processamento."}
                            {actionModal?.type === "reject" &&
                                "O crypto será devolvido à carteira do cliente."}
                            {actionModal?.type === "paid" &&
                                "Confirme que o boleto foi pago com sucesso."}
                        </DialogDescription>
                    </DialogHeader>

                    {(actionModal?.type === "reject" || actionModal?.type === "paid") && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                                {actionModal.type === "reject" ? "Motivo (opcional)" : "Notas (opcional)"}
                            </label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder={
                                    actionModal.type === "reject"
                                        ? "Motivo da rejeição..."
                                        : "Notas sobre o pagamento..."
                                }
                                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:border-[#3871F1]/50 focus:ring-2 focus:ring-[#3871F1]/20 focus:outline-none resize-none h-20"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => { setActionModal(null); setActionReason(""); }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => actionModal && handleAction(actionModal.type, actionModal.paymentId)}
                            disabled={processing}
                            className={
                                actionModal?.type === "reject"
                                    ? "bg-red-600 hover:bg-red-500"
                                    : actionModal?.type === "paid"
                                    ? "bg-green-600 hover:bg-green-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                            }
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                "Confirmar"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
