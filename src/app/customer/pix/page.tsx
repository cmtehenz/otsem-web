"use client";

import * as React from "react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Use seu componente de modal

type PixKey = {
    id: string;
    keyType: string;
    keyValue: string;
    status: string;
    createdAt: string;
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
}

function getStatusColor(status: string) {
    switch (status) {
        case "ACTIVE":
            return "bg-green-100 text-green-800";
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "ACTIVE":
            return "Ativa";
        case "PENDING":
            return "Pendente";
        default:
            return status;
    }
}

export default function CustomerPixPage() {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [pixKeys, setPixKeys] = React.useState<PixKey[]>([]);
    const [showModal, setShowModal] = React.useState(false);
    const [newType, setNewType] = React.useState("RANDOM");
    const [newValue, setNewValue] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        async function loadPixKeys() {
            try {
                setLoading(true);
                const res = await http.get<PixKey[]>(`/pix-keys/customer/${user?.id}`);
                // Mostra ACTIVE e PENDING
                setPixKeys(res.data.filter(pk => pk.status === "ACTIVE" || pk.status === "PENDING"));
            } catch (err) {
                // Trate o erro conforme necessário
            } finally {
                setLoading(false);
            }
        }
        if (user?.id) loadPixKeys();
    }, [user?.id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await http.post("/pix-keys", {
                customerId: user?.id,
                keyType: newType,
                keyValue: newType === "RANDOM" ? "EDITAR AQUI" : newValue, // <-- string vazia para RANDOM
                status: "PENDING", // Adicione esta linha
            });
            setShowModal(false);
            setNewType("RANDOM");
            setNewValue("");
            // Recarrega as chaves
            const res = await http.get<PixKey[]>(`/pix-keys/customer/${user?.id}`);
            setPixKeys(res.data.filter(pk => pk.status === "ACTIVE" || pk.status === "PENDING"));
        } catch (err) {
            // Trate o erro conforme necessário
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="w-full p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Minhas Chaves Pix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setShowModal(true)}>
                            Solicitar nova chave Pix
                        </Button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Chave</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Criada em</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pixKeys.length > 0 ? (
                                        pixKeys.map((pix) => (
                                            <TableRow key={pix.id}>
                                                <TableCell className="font-mono text-sm">{pix.keyValue}</TableCell>
                                                <TableCell>{pix.keyType}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(pix.status)}`}>
                                                        {getStatusLabel(pix.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{formatDate(pix.createdAt)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                Nenhuma chave Pix ativa encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal para solicitar nova chave Pix */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Solicitar nova chave Pix</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo de chave</label>
                            <select
                                value={newType}
                                onChange={e => setNewType(e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            >
                                <option value="RANDOM">Aleatória</option>
                                <option value="CPF">CPF</option>
                                <option value="CNPJ">CNPJ</option>
                                <option value="EMAIL">E-mail</option>
                                <option value="PHONE">Telefone</option>
                            </select>
                        </div>
                        {newType !== "RANDOM" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Valor da chave</label>
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    className="border rounded px-2 py-1 w-full"
                                    required
                                />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Enviando..." : "Solicitar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}