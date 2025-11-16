"use client";

import * as React from "react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Loader2, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
            return "bg-[#b852ff]/20 text-[#b852ff] border border-[#b852ff]/40";
        case "PENDING":
            return "bg-[#f8bc07]/20 text-[#f8bc07] border border-[#f8bc07]/40";
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
                keyValue: newType === "RANDOM" ? "EDITAR AQUI" : newValue,
                status: "PENDING",
            });
            setShowModal(false);
            setNewType("RANDOM");
            setNewValue("");
            const res = await http.get<PixKey[]>(`/pix-keys/customer/${user?.id}`);
            setPixKeys(res.data.filter(pk => pk.status === "ACTIVE" || pk.status === "PENDING"));
        } catch (err) {
            // Trate o erro conforme necessário
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            <Card className="w-full shadow-md bg-[#faffff] border border-[#b852ff]/10">
                <CardHeader className="flex flex-row items-center gap-2 bg-[#faffff] rounded-t-md">
                    <KeyRound className="text-[#b852ff]" size={28} />
                    <CardTitle className="text-lg text-[#000000] font-bold">Minhas Chaves Pix</CardTitle>
                    <div className="flex-1" />
                    <Button
                        onClick={() => setShowModal(true)}
                        size="sm"
                        className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                    >
                        Nova chave Pix
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-[#b852ff]" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-[#b852ff]/10">
                                        <TableHead className="text-[#000000]">Chave</TableHead>
                                        <TableHead className="text-[#000000]">Tipo</TableHead>
                                        <TableHead className="text-[#000000]">Status</TableHead>
                                        <TableHead className="text-[#000000]">Criada em</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pixKeys.length > 0 ? (
                                        pixKeys.map((pix) => (
                                            <TableRow key={pix.id} className="hover:bg-[#b852ff]/5">
                                                <TableCell className="font-mono text-sm text-[#000000]">{pix.keyValue}</TableCell>
                                                <TableCell className="text-[#000000]">{pix.keyType}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(pix.status)}`}>
                                                        {getStatusLabel(pix.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-[#000000]">{formatDate(pix.createdAt)}</TableCell>
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

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-[#faffff] border border-[#b852ff]/10">
                    <DialogHeader>
                        <DialogTitle className="text-[#b852ff]">Solicitar nova chave Pix</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[#000000]">Tipo de chave</label>
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger className="w-full border-[#b852ff]/30 bg-[#faffff] text-[#000000]">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#faffff]">
                                    <SelectItem value="RANDOM" className="text-[#000000]">Aleatória</SelectItem>
                                    <SelectItem value="CPF" className="text-[#000000]">CPF</SelectItem>
                                    <SelectItem value="CNPJ" className="text-[#000000]">CNPJ</SelectItem>
                                    <SelectItem value="EMAIL" className="text-[#000000]">E-mail</SelectItem>
                                    <SelectItem value="PHONE" className="text-[#000000]">Telefone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newType !== "RANDOM" && (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#000000]">Valor da chave</label>
                                <Input
                                    type="text"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    required
                                    className="border-[#b852ff]/30 bg-[#faffff] text-[#000000]"
                                />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                className="border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                            >
                                {submitting ? "Enviando..." : "Solicitar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}