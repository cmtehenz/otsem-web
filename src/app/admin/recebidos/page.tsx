"use client";

import * as React from "react";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Payment = {
    id: string;
    endToEnd: string;
    paymentValue: number;
    paymentDate: string;
    status: string;
    receiverPixKey?: string | null;
    customerId?: string | null;
    createdAt: string;
    updatedAt: string;
};

type Customer = {
    id: string;
    name: string;
    // outros campos se necessário
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value / 100); // <-- Corrigido aqui
}

function getStatusColor(status: string) {
    switch (status) {
        case "CONFIRMED":
            return "bg-green-100 text-green-800";
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "FAILED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "CONFIRMED":
            return "Confirmado";
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const format = (d: Date) => d.toISOString().slice(0, 10);
    return {
        inicio: format(sevenDaysAgo),
        fim: format(today),
    };
}

export default function PaymentsRecebidosPage() {
    const defaultDates = getDefaultDates();
    const [loading, setLoading] = React.useState(true);
    const [payments, setPayments] = React.useState<Payment[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [customerFilter, setCustomerFilter] = React.useState("");
    const [customerOptions, setCustomerOptions] = React.useState<string[]>([]);
    const [dataInicio, setDataInicio] = React.useState(defaultDates.inicio);
    const [dataFim, setDataFim] = React.useState(defaultDates.fim);
    const [customers, setCustomers] = React.useState<Customer[]>([]);

    async function loadPayments() {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (customerFilter) params.customerId = customerFilter;
            if (dataInicio) params.dataInicio = dataInicio;
            if (dataFim) params.dataFim = dataFim;

            if (!params.dataInicio || !params.dataFim) {
                setPayments([]);
                setLoading(false);
                return;
            }

            const query = new URLSearchParams(params).toString();
            const res = await http.get<Payment[]>(`/payments?${query}`);
            setPayments(res.data);
            setCustomerOptions(Array.from(new Set(res.data.map(p => p.customerId).filter(Boolean) as string[])));
        } catch (err) {
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }

    // Carrega clientes ao montar
    React.useEffect(() => {
        async function loadCustomers() {
            try {
                const res = await http.get<{ data: Customer[] }>("/customers");
                setCustomers(Array.isArray(res.data) ? res.data : res.data.data);
            } catch (err) {
                setCustomers([]);
            }
        }
        loadCustomers();
    }, []);

    React.useEffect(() => {
        loadPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Seleção de linhas
    function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            setSelectedIds(payments.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    }

    function handleSelectRow(id: string, checked: boolean) {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
        );
    }

    function handleFilterSubmit(e: React.FormEvent) {
        e.preventDefault();
        loadPayments();
    }

    // Função para pegar o nome do cliente pelo id
    function getCustomerName(id?: string | null) {
        if (!id) return "-";
        const customer = customers.find(c => c.id === id);
        return customer ? customer.name : id;
    }

    function getTotalValue(payments: Payment[]) {
        // Soma todos os valores e divide por 100 para converter de centavos para reais
        const total = payments.reduce((sum, p) => sum + p.paymentValue, 0);
        return formatCurrency(total);
    }

    return (
        <div className="w-full p-6">
            {/* Card com valor total */}
            <Card className="mb-6 w-full">
                <CardHeader>
                    <CardTitle>Valor total recebido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-green-700">
                        {getTotalValue(payments)}
                    </div>
                </CardContent>
            </Card>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Pagamentos Recebidos (Pix)</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Filtrar por cliente</label>
                            <select
                                value={customerFilter}
                                onChange={e => setCustomerFilter(e.target.value)}
                                className="border rounded px-2 py-1 min-w-[180px]"
                            >
                                <option value="">Todos</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data início</label>
                            <Input
                                type="date"
                                value={dataInicio}
                                onChange={e => setDataInicio(e.target.value)}
                                className="min-w-[140px]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Data fim</label>
                            <Input
                                type="date"
                                value={dataFim}
                                onChange={e => setDataFim(e.target.value)}
                                className="min-w-[140px]"
                            />
                        </div>
                        <Button type="submit" variant="outline" size="sm">
                            Filtrar
                        </Button>
                        <div className="flex-1" />
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={selectedIds.length === 0}
                                onClick={() => alert(`Selecionados: ${selectedIds.join(", ")}`)}
                            >
                                Ação em selecionados
                            </Button>
                        </div>
                    </form>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    payments.length > 0 &&
                                                    selectedIds.length === payments.length
                                                }
                                                onChange={handleSelectAll}
                                                aria-label="Selecionar todos"
                                            />
                                        </TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Chave Pix</TableHead>
                                        <TableHead>Criado em</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length > 0 ? (
                                        payments.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(p.id)}
                                                        onChange={e =>
                                                            handleSelectRow(p.id, e.target.checked)
                                                        }
                                                        aria-label="Selecionar linha"
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(p.paymentDate)}</TableCell>
                                                <TableCell>{formatCurrency(p.paymentValue)}</TableCell>
                                                <TableCell>{getCustomerName(p.customerId)}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(p.status)}`}>
                                                        {getStatusLabel(p.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{p.receiverPixKey ?? "-"}</TableCell>
                                                <TableCell>{formatDate(p.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                Nenhum pagamento encontrado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}