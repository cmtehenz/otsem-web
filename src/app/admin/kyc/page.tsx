"use client";

import * as React from "react";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import http from "@/lib/http";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type AdminCustomerItem = {
    id: string;
    type: "PF" | "PJ";
    name: string | null;
    legalName: string | null;
    cpf: string | null;
    cnpj: string | null;
    email: string;
    phone: string;
    accountStatus: "not_requested" | "requested" | "approved" | "rejected" | "in_review";
    externalClientId: string | null;
    externalAccredId: string | null;
    createdAt: string;
    updatedAt: string;
};

type CustomersResponse = {
    data: AdminCustomerItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export default function AdminCustomersPage(): React.JSX.Element {
    const [items, setItems] = React.useState<AdminCustomerItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [q, setQ] = React.useState("");

    const load = React.useCallback(async (searchQuery = "", currentPage = 1) => {
        try {
            setLoading(true);

            // Monta query params
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "20",
            });

            if (searchQuery) {
                params.append("search", searchQuery);
            }

            const res = await http.get<CustomersResponse>(
                `/customers?${params.toString()}`
            );

            setItems(res.data.data);
            setTotal(res.data.meta.total);
            setPage(res.data.meta.page);
        } catch (err) {
            console.error("Erro ao carregar clientes:", err);
            toast.error("Falha ao carregar clientes");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const debouncedSearch = useDebouncedCallback((v: string) => {
        setQ(v);
        void load(v, 1); // Reseta para página 1 ao buscar
    }, 500);

    function getTaxNumber(item: AdminCustomerItem): string {
        return item.type === "PF"
            ? (item.cpf ?? "—")
            : (item.cnpj ?? "—");
    }

    function getDisplayName(item: AdminCustomerItem): string {
        return item.type === "PF"
            ? (item.name ?? "—")
            : (item.legalName ?? "—");
    }

    function getStatusLabel(status: AdminCustomerItem["accountStatus"]): string {
        const labels: Record<typeof status, string> = {
            not_requested: "⏺️ Não solicitado",
            requested: "🕐 Solicitado",
            in_review: "🔍 Em análise",
            approved: "✅ Aprovado",
            rejected: "❌ Rejeitado",
        };
        return labels[status] || status;
    }

    function getStatusColor(status: AdminCustomerItem["accountStatus"]): string {
        const colors: Record<typeof status, string> = {
            not_requested: "bg-gray-100 text-gray-700",
            requested: "bg-yellow-100 text-yellow-700",
            in_review: "bg-blue-100 text-blue-700",
            approved: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* eslint-disable-next-line */}
                    <h1 className="text-2xl font-semibold bg-linear-to-r from-indigo-600 to-[#6F00FF] bg-clip-text text-transparent">
                        Clientes
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe o status de verificação e realize credenciamentos manuais.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/kyc/new/pf">
                        <Button variant="outline">+ PF</Button>
                    </Link>
                    <Link href="/admin/kyc/new/pj">
                        <Button variant="outline">+ PJ</Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-2xl shadow-sm border-indigo-50">
                <CardHeader>
                    <CardTitle>Listagem</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4">
                    {/* busca */}
                    <div className="flex items-end gap-3 flex-wrap">
                        <div className="grid gap-1 flex-1 max-w-md">
                            <Label>Buscar</Label>
                            <Input
                                placeholder="nome, doc, e-mail, telefone…"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    debouncedSearch(e.target.value)
                                }
                            />
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => load(q, page)}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Atualizar"
                            )}
                        </Button>
                    </div>

                    {/* tabela */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Nome/Razão</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading && items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : items.length > 0 ? (
                                    items.map((i: AdminCustomerItem) => (
                                        <TableRow
                                            key={i.id}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => window.location.href = `/admin/kyc/${i.id}`}
                                        >
                                            <TableCell className="font-medium">{i.type}</TableCell>
                                            <TableCell>{getDisplayName(i)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {getTaxNumber(i)}
                                            </TableCell>
                                            <TableCell>{i.email}</TableCell>
                                            <TableCell>{i.phone}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(i.accountStatus)}`}
                                                >
                                                    {getStatusLabel(i.accountStatus)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(i.createdAt).toLocaleDateString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                                            Nenhum cliente encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Total: {total} cliente(s) • Página {page}
                        </div>

                        {total > 20 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => load(q, page - 1)}
                                    disabled={page === 1 || loading}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => load(q, page + 1)}
                                    disabled={items.length < 20 || loading}
                                >
                                    Próxima
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
