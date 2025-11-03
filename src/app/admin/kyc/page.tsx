"use client";

import * as React from "react";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import type { AdminCustomersListResponse, AdminCustomerItem } from "@/lib/kyc/types";

function badgeClass(status: AdminCustomerItem["kycStatus"]): string {
    switch (status) {
        case "approved": return "text-green-700 bg-green-100";
        case "in_review": return "text-blue-700 bg-blue-100";
        case "not_requested": return "text-gray-700 bg-gray-100";
        case "rejected": return "text-red-700 bg-red-100";
    }
}

export default function AdminCustomersPage(): React.JSX.Element {
    const [items, setItems] = React.useState<AdminCustomerItem[]>([]);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(10);
    const [q, setQ] = React.useState("");
    const [type, setType] = React.useState<"" | "PF" | "PJ">("");
    const [status, setStatus] = React.useState<"" | "not_requested" | "in_review" | "approved" | "rejected">("");
    const [loading, setLoading] = React.useState(false);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
            });
            if (q) params.set("q", q);
            if (type) params.set("type", type);
            if (status) params.set("status", status);

            const res = await http.get<AdminCustomersListResponse>(`/admin/customers?${params.toString()}`);
            setItems(res.items);
            setTotal(res.total);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar clientes");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, q, type, status]);

    React.useEffect(() => { void load(); }, [load]);

    const debouncedSearch = useDebouncedCallback((v: string) => {
        setPage(1);
        setQ(v);
    }, 300);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-sm text-muted-foreground">
                        Veja todas as contas cadastradas e seus status de verificação KYC.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/kyc/new/pf"><Button variant="outline">+ PF</Button></Link>
                    <Link href="/admin/kyc/new/pj"><Button variant="outline">+ PJ</Button></Link>
                </div>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Listagem</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-4">
                    {/* filtros */}
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-1">
                            <Label>Buscar</Label>
                            <Input
                                placeholder="nome, doc, e-mail, telefone…"
                                onChange={(e) => debouncedSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-1">
                            <Label>Tipo</Label>
                            <select
                                value={type}
                                onChange={(e) => { setPage(1); setType(e.target.value as typeof type); }}
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="PF">PF</option>
                                <option value="PJ">PJ</option>
                            </select>
                        </div>

                        <div className="grid gap-1">
                            <Label>Status KYC</Label>
                            <select
                                value={status}
                                onChange={(e) => { setPage(1); setStatus(e.target.value as typeof status); }}
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="not_requested">Não iniciado</option>
                                <option value="in_review">Em análise</option>
                                <option value="approved">Aprovado</option>
                                <option value="rejected">Rejeitado</option>
                            </select>
                        </div>

                        <Button variant="ghost" onClick={() => load()} disabled={loading}>
                            {loading ? "Carregando..." : "Atualizar"}
                        </Button>
                    </div>

                    {/* tabela */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Nome/Razão</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status KYC</TableHead>
                                    <TableHead>Criação</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {items.length ? items.map((i) => (
                                    <TableRow key={i.id}>
                                        <TableCell>{i.type}</TableCell>
                                        <TableCell>{i.name ?? "—"}</TableCell>
                                        <TableCell className="font-mono text-xs">{i.taxId ?? "—"}</TableCell>
                                        <TableCell>{i.userEmail ?? "—"}</TableCell>
                                        <TableCell>{i.phone}</TableCell>
                                        <TableCell>
                                            <span className={`rounded px-2 py-0.5 text-xs ${badgeClass(i.kycStatus)}`}>
                                                {i.kycStatus === "approved" ? "✅ Aprovado" :
                                                    i.kycStatus === "in_review" ? "⏳ Em análise" :
                                                        i.kycStatus === "not_requested" ? "⏺️ Não iniciado" :
                                                            "❌ Rejeitado"}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                            Nenhum cliente encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Separator />
                    {/* paginação */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages} • {total} registros
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                Anterior
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                                Próxima
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
