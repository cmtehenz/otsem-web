"use client";

import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Link from "next/link";
import type { AccreditationListResponse, AccreditationStatus } from "@/lib/kyc/types";

function badgeClass(status: AccreditationStatus): string {
    switch (status) {
        case "approved": return "text-green-700 bg-green-100";
        case "processing": return "text-blue-700 bg-blue-100";
        case "received": return "text-gray-700 bg-gray-100";
        case "rejected": return "text-red-700 bg-red-100";
    }
}

export default function KycIndexPage(): React.JSX.Element {
    const [items, setItems] = React.useState<AccreditationListResponse["items"]>([]);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(10);
    const [q, setQ] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
            if (q) params.set("q", q);
            // endpoint de listagem (ajuste pro seu backend)
            const res = await http.get<AccreditationListResponse>(`/accreditation?${params.toString()}`);
            setItems(res.items);
            setTotal(res.total);
        } catch {
            toast.error("Falha ao carregar credenciamentos");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, q]);

    React.useEffect(() => { void load(); }, [load]);

    const debouncedSearch = useDebouncedCallback((v: string) => {
        setPage(1);
        setQ(v);
    }, 300);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-muted-foreground">Listagem de clientes PF/PJ</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/kyc/new/pf"><Button variant="outline">+ PF</Button></Link>
                    <Link href="/admin/kyc/new/pj"><Button variant="outline">+ PJ</Button></Link>
                </div>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Clientes</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center gap-3">
                        <div className="grid gap-1">
                            <Label>Buscar</Label>
                            <Input placeholder="nome, documento, e-mail…" onChange={(e) => debouncedSearch(e.target.value)} />
                        </div>
                        <Button variant="ghost" onClick={() => load()} disabled={loading}>Atualizar</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Nome/Razão</TableHead>
                                <TableHead>Documento</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Criação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length ? items.map((i) => (
                                <TableRow key={i.accreditationId}>
                                    <TableCell>{i.type}</TableCell>
                                    <TableCell>{i.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{i.taxId}</TableCell>
                                    <TableCell>{i.email}</TableCell>
                                    <TableCell>{i.phone}</TableCell>
                                    <TableCell>
                                        <span className={`rounded px-2 py-0.5 text-xs ${badgeClass(i.status)}`}>{i.status}</span>
                                    </TableCell>
                                    <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Separator />
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
