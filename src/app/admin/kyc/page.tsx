"use client";

import * as React from "react";
import Link from "next/link";
// import { motion } from "framer-motion";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { http } from "@/lib/http";

import {
    Loader2,
    // CheckCircle2,
    // XCircle,
    // CircleDot
} from "lucide-react";
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
    taxNumber: string | null;
    email: string;
    phone: string;
    status: "not_requested" | "processing" | "approved" | "rejected" | "in_review";
    createdAt: string;
};

export default function AdminCustomersPage(): React.JSX.Element {
    const [items, setItems] = React.useState<AdminCustomerItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [processingId, setProcessingId] = React.useState<string | null>(null);
    const [q, setQ] = React.useState("");

    console.log(processingId)
    const load = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await http.get<AdminCustomerItem[]>("/admin/accreditation");
            setItems(res);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar clientes");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void load();
    }, [load]);

    const debouncedSearch = useDebouncedCallback((v: string) => {
        setQ(v.toLowerCase());
    }, 300);

    const filtered = items.filter((i) =>
        q
            ? (i.name?.toLowerCase().includes(q) ||
                i.taxNumber?.includes(q) ||
                i.email.toLowerCase().includes(q) ||
                i.phone.includes(q))
            : true
    );

    // async function handleAccredit(i: AdminCustomerItem) {
    //     setProcessingId(i.id);
    //     try {
    //         const endpoint =
    //             i.type === "PF"
    //                 ? `/admin/accreditation/pf/${i.id}`
    //                 : `/admin/accreditation/pj/${i.id}`;
    //         const res = await http.post<{ message: string }>(endpoint, {});
    //         toast.success(res.message ?? "Credenciamento enviado com sucesso!");
    //         await load();
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Falha ao enviar credenciamento");
    //     } finally {
    //         setProcessingId(null);
    //     }
    // }

    // function renderStatus(status: AdminCustomerItem["status"]) {
    //     const base =
    //         "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium w-fit select-none";

    //     switch (status) {
    //         case "approved":
    //             return (
    //                 <motion.span
    //                     className={`${base} bg-gradient-to-r from-green-100 to-emerald-50 text-green-700`}
    //                     initial={{ opacity: 0, scale: 0.8 }}
    //                     animate={{ opacity: 1, scale: 1 }}
    //                 >
    //                     <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Aprovado
    //                 </motion.span>
    //             );

    //         case "processing":
    //             return (
    //                 <motion.span
    //                     className={`${base} bg-gradient-to-r from-blue-100 to-indigo-50 text-blue-700 animate-pulse`}
    //                     initial={{ opacity: 0.8 }}
    //                     animate={{ opacity: 1 }}
    //                     transition={{ duration: 1.2, repeat: Infinity }}
    //                 >
    //                     <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> Em
    //                     análise
    //                 </motion.span>
    //             );

    //         case "rejected":
    //             return (
    //                 <motion.span
    //                     className={`${base} bg-gradient-to-r from-red-100 to-rose-50 text-red-700`}
    //                     initial={{ y: -2, opacity: 0 }}
    //                     animate={{ y: 0, opacity: 1 }}
    //                     transition={{ type: "spring", stiffness: 120 }}
    //                 >
    //                     <XCircle className="h-3.5 w-3.5 text-red-600" /> Rejeitado
    //                 </motion.span>
    //             );

    //         default:
    //             return (
    //                 <motion.span
    //                     className={`${base} bg-gradient-to-r from-gray-100 to-zinc-50 text-gray-700`}
    //                     initial={{ opacity: 0 }}
    //                     animate={{ opacity: 1 }}
    //                 >
    //                     <CircleDot className="h-3.5 w-3.5 text-gray-500" /> Não iniciado
    //                 </motion.span>
    //             );
    //     }
    // }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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
                        <div className="grid gap-1">
                            <Label>Buscar</Label>
                            <Input
                                placeholder="nome, doc, e-mail, telefone…"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" onClick={() => load()} disabled={loading}>
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
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {items.length ? (
                                    items.map((i: AdminCustomerItem) => (
                                        <TableRow
                                            key={i.id}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => window.location.href = `/admin/kyc/${i.id}`}
                                        >
                                            <TableCell className="font-medium">{i.type}</TableCell>
                                            <TableCell>{i.name ?? "—"}</TableCell>
                                            <TableCell className="font-mono text-xs">{i.taxNumber ?? "—"}</TableCell>
                                            <TableCell>{i.email ?? "—"}</TableCell>
                                            <TableCell>{i.phone}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-medium ${i.status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : i.status === "in_review"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : i.status === "rejected"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {i.status === "approved"
                                                        ? "✅ Aprovado"
                                                        : i.status === "in_review"
                                                            ? "🕐 Em análise"
                                                            : i.status === "rejected"
                                                                ? "❌ Rejeitado"
                                                                : "⏺️ Não iniciado"}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
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
                    <div className="text-sm text-muted-foreground">
                        Total: {filtered.length} cliente(s)
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
