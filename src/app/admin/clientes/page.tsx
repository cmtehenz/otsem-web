"use client";

import * as React from "react";
import Link from "next/link";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type Customer = {
    id: string;
    name: string;
    email: string;
    status: string;
    pixKey?: string;
};

export default function ClientesPage() {
    const [loading, setLoading] = React.useState(true);
    const [customers, setCustomers] = React.useState<Customer[]>([]);

    React.useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await http.get<{ data: Customer[] }>("/customers");
                setCustomers(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Pix</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : customers.length > 0 ? (
                                    customers.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.name}</TableCell>
                                            <TableCell>{c.email}</TableCell>
                                            <TableCell>{c.status}</TableCell>
                                            <TableCell>
                                                {c.pixKey ? c.pixKey : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/admin/clientes/${c.id}/add-pix`}>
                                                    <Button variant="outline" size="sm">
                                                        Adicionar Pix
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                                            Nenhum cliente encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}