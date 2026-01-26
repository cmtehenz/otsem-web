"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Se não existir, use um <span> estilizado

type PixKey = {
    id: string;
    customerId: string;
    keyType: string;
    keyValue: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type Customer = {
    id: string;
    name: string;
    email: string;
};

export default function PixCrudPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params?.id as string;

    const [loading, setLoading] = React.useState(true);
    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [pixKeys, setPixKeys] = React.useState<PixKey[]>([]);
    const [newPixKey, setNewPixKey] = React.useState("");
    const [newPixType, setNewPixType] = React.useState("RANDOM");
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editingKey, setEditingKey] = React.useState("");
    const [editingType, setEditingType] = React.useState("RANDOM");

    async function loadCustomerAndPixKeys() {
        try {
            setLoading(true);
            const customerRes = await http.get<Customer>(`/customers/${customerId}`);
            setCustomer(customerRes.data);

            const pixRes = await http.get<PixKey[]>(`/pix-keys/customer/${customerId}`);
            setPixKeys(pixRes.data);
        } catch (err) {
            toast.error("Falha ao carregar dados");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (customerId) loadCustomerAndPixKeys();
    }, [customerId]);

    async function handleAddPix(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            await http.post(`/pix-keys`, {
                customerId,
                keyType: newPixType,
                keyValue: newPixKey,
            });
            toast.success("Chave Pix adicionada!");
            setNewPixKey("");
            setNewPixType("RANDOM");
            await loadCustomerAndPixKeys();
        } catch (err) {
            toast.error("Erro ao adicionar chave Pix");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeletePix(id: string) {
        if (!confirm("Deseja realmente marcar esta chave Pix como DELETED?")) return;
        try {
            setLoading(true);
            await http.patch(`/pix-keys/${id}`, { status: "DELETED" });
            toast.success("Chave Pix marcada como DELETED!");
            await loadCustomerAndPixKeys();
        } catch (err) {
            toast.error("Erro ao atualizar status da chave Pix");
        } finally {
            setLoading(false);
        }
    }

    async function handleEditPix(e: React.FormEvent) {
        e.preventDefault();
        if (!editingId) return;
        try {
            setLoading(true);
            await http.patch(`/pix-keys/${editingId}`, {
                keyType: editingType,
                keyValue: editingKey,
                status: "ACTIVE",
            });
            toast.success("Chave Pix atualizada!");
            setEditingId(null);
            setEditingKey("");
            setEditingType("RANDOM");
            await loadCustomerAndPixKeys();
            window.dispatchEvent(new Event("pixkey-updated"));
        } catch (err) {
            toast.error("Erro ao atualizar chave Pix");
        } finally {
            setLoading(false);
        }
    }

    function getStatusColor(status: string) {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "BLOCKED":
                return "bg-gray-200 text-gray-800";
            case "DELETED":
                return "bg-red-100 text-red-800";
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
            case "BLOCKED":
                return "Bloqueada";
            case "DELETED":
                return "Removida";
            default:
                return status;
        }
    }

    function formatDate(dateStr: string) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR");
    }

    return (
        <div className="w-full p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Chaves Pix do Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : customer ? (
                        <>
                            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                    <div className="font-semibold text-lg">{customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{customer.email}</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => router.back()}>
                                    Voltar
                                </Button>
                            </div>

                            {/* Tabela das chaves Pix */}
                            <div className="mb-8 w-full">
                                <h3 className="font-medium mb-2">Chaves Pix</h3>
                                <div className="overflow-x-auto w-full">
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Chave</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Criada em</TableHead>
                                                <TableHead className="text-center">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.isArray(pixKeys) && pixKeys.length > 0 ? (
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
                                                        <TableCell className="flex gap-2 justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setEditingId(pix.id);
                                                                    setEditingKey(pix.keyValue);
                                                                    setEditingType(pix.keyType);
                                                                }}
                                                                title="Editar"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeletePix(pix.id)}
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                        Nenhuma chave Pix cadastrada.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Formulário de adicionar nova chave Pix */}
                            <form onSubmit={handleAddPix} className="space-y-4 mb-8 w-full">
                                <h3 className="font-medium">Adicionar nova chave Pix</h3>
                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    <Input
                                        value={newPixKey}
                                        onChange={e => setNewPixKey(e.target.value)}
                                        placeholder="Digite a chave Pix"
                                        required
                                        className="flex-1"
                                    />
                                    <select
                                        value={newPixType}
                                        onChange={e => setNewPixType(e.target.value)}
                                        className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                    >
                                        <option value="RANDOM">Aleatória</option>
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                        <option value="EMAIL">E-mail</option>
                                        <option value="PHONE">Telefone</option>
                                    </select>
                                    <Button type="submit" disabled={loading} className="flex-shrink-0">
                                        Adicionar
                                    </Button>
                                </div>
                            </form>

                            {/* Formulário de edição */}
                            {editingId && (
                                <form onSubmit={handleEditPix} className="space-y-4 mb-8 bg-muted p-4 rounded w-full">
                                    <h3 className="font-medium">Editar chave Pix</h3>
                                    <div className="flex flex-col md:flex-row gap-4 w-full">
                                        <Input
                                            value={editingKey}
                                            onChange={e => setEditingKey(e.target.value)}
                                            placeholder="Digite a chave Pix"
                                            required
                                            className="flex-1"
                                        />
                                        <select
                                            value={editingType}
                                            onChange={e => setEditingType(e.target.value)}
                                            className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                        >
                                            <option value="RANDOM">Aleatória</option>
                                            <option value="CPF">CPF</option>
                                            <option value="CNPJ">CNPJ</option>
                                            <option value="EMAIL">E-mail</option>
                                            <option value="PHONE">Telefone</option>
                                        </select>
                                        <Button type="submit" disabled={loading} className="flex-shrink-0">
                                            Salvar
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="flex-shrink-0">
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground">Cliente não encontrado.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}