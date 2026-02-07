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
    username?: string | null;
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
        <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold bg-linear-to-r from-indigo-600 to-[#3871F1] bg-clip-text text-transparent">
                        Clientes
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Acompanhe o status de verificação e realize credenciamentos manuais.
                    </p>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                    <Link href="/admin/kyc/new/pf">
                        <Button variant="outline" size="sm">+ PF</Button>
                    </Link>
                    <Link href="/admin/kyc/new/pj">
                        <Button variant="outline" size="sm">+ PJ</Button>
                    </Link>
                </div>
            </div>

            <Card className="rounded-2xl shadow-sm border-indigo-50">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Listagem</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4 p-4 pt-0 sm:p-6 sm:pt-0">
                    {/* busca */}
                    <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
                        <div className="grid gap-1 flex-1 min-w-0">
                            <Label className="text-xs sm:text-sm">Buscar</Label>
                            <Input
                                placeholder="nome, @username, doc, e-mail, telefone…"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    debouncedSearch(e.target.value)
                                }
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
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

                    {/* Mobile card view */}
                    <div className="space-y-2 md:hidden">
                        {loading && items.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : items.length > 0 ? (
                            items.map((i: AdminCustomerItem) => (
                                <Link
                                    key={i.id}
                                    href={`/admin/kyc/${i.id}`}
                                    className="block rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded">{i.type}</span>
                                                <span className="text-sm font-medium truncate">{getDisplayName(i)}</span>
                                            </div>
                                            {i.username && (
                                                <p className="text-xs font-medium text-[#3871F1] mt-0.5">@{i.username}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{i.email}</p>
                                            <p className="text-[11px] font-mono text-muted-foreground">{getTaxNumber(i)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getStatusColor(i.accountStatus)}`}
                                            >
                                                {getStatusLabel(i.accountStatus)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(i.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                Nenhum cliente encontrado.
                            </div>
                        )}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-x-auto">
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
                                            <TableCell>
                                                <div>
                                                    <span>{getDisplayName(i)}</span>
                                                    {i.username && (
                                                        <p className="text-xs font-medium text-[#3871F1]">@{i.username}</p>
                                                    )}
                                                </div>
                                            </TableCell>
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

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            Total: {total} cliente(s) • Página {page}
                        </div>

                        {total > 20 && (
                            <div className="flex gap-2 self-end sm:self-auto">
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
