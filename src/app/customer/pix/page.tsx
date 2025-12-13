"use client";

import * as React from "react";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, Plus, Copy, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

function getStatusStyle(status: string) {
    switch (status) {
        case "ACTIVE":
            return "bg-green-500/20 text-green-400 border border-green-500/30";
        case "PENDING":
            return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
        default:
            return "bg-white/10 text-white/60";
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

function getKeyTypeLabel(type: string) {
    switch (type) {
        case "RANDOM":
            return "Aleatória";
        case "CPF":
            return "CPF";
        case "CNPJ":
            return "CNPJ";
        case "EMAIL":
            return "E-mail";
        case "PHONE":
            return "Telefone";
        default:
            return type;
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

    async function loadPixKeys() {
        try {
            setLoading(true);
            const res = await http.get<PixKey[]>(`/pix-keys/customer/${user?.id}`);
            setPixKeys(res.data.filter(pk => pk.status === "ACTIVE" || pk.status === "PENDING"));
        } catch (err) {
            setPixKeys([]);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (user?.id) loadPixKeys();
    }, [user?.id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await http.post("/pix-keys", {
                customerId: user?.id,
                keyType: newType,
                keyValue: newType === "RANDOM" ? undefined : newValue,
                status: "PENDING",
            });
            toast.success("Chave Pix solicitada com sucesso!");
            setShowModal(false);
            setNewType("RANDOM");
            setNewValue("");
            loadPixKeys();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Erro ao solicitar chave Pix");
        } finally {
            setSubmitting(false);
        }
    }

    async function onCopy(text: string) {
        await navigator.clipboard.writeText(text);
        toast.success("Chave copiada!");
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="text-sm text-white/60 mt-4">Carregando chaves Pix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Chaves Pix</h1>
                    <p className="text-white/50 text-sm mt-1">
                        Gerencie suas chaves Pix para receber pagamentos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={loadPixKeys}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Chave Pix
                    </Button>
                </div>
            </div>

            {pixKeys.length === 0 ? (
                <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-12 text-center">
                    <div className="p-4 rounded-full bg-violet-500/20 inline-block mb-4">
                        <KeyRound className="w-8 h-8 text-violet-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Nenhuma chave Pix encontrada
                    </h2>
                    <p className="text-white/50 mb-6 max-w-md mx-auto">
                        Cadastre sua primeira chave Pix para começar a receber pagamentos instantâneos.
                    </p>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-8"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Chave Pix
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pixKeys.map((pix) => (
                        <div
                            key={pix.id}
                            className="bg-[#1a1025] border border-white/10 rounded-2xl p-5 hover:border-violet-500/30 transition"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                                        <KeyRound className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-semibold">
                                                {getKeyTypeLabel(pix.keyType)}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(pix.status)}`}>
                                                {getStatusLabel(pix.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-white/60 text-sm font-mono">
                                                {pix.keyValue}
                                            </code>
                                            <button
                                                onClick={() => onCopy(pix.keyValue)}
                                                className="p-1 hover:bg-white/10 rounded transition"
                                            >
                                                <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-white/40 text-sm">
                                        Criada em {formatDate(pix.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-[#1a1025] border border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Nova Chave Pix</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/70">
                                Tipo de chave
                            </label>
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1025] border-white/10">
                                    <SelectItem value="RANDOM" className="text-white hover:bg-white/10">Aleatória</SelectItem>
                                    <SelectItem value="CPF" className="text-white hover:bg-white/10">CPF</SelectItem>
                                    <SelectItem value="CNPJ" className="text-white hover:bg-white/10">CNPJ</SelectItem>
                                    <SelectItem value="EMAIL" className="text-white hover:bg-white/10">E-mail</SelectItem>
                                    <SelectItem value="PHONE" className="text-white hover:bg-white/10">Telefone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newType !== "RANDOM" && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white/70">
                                    Valor da chave
                                </label>
                                <Input
                                    type="text"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder={
                                        newType === "CPF" ? "000.000.000-00" :
                                        newType === "CNPJ" ? "00.000.000/0000-00" :
                                        newType === "EMAIL" ? "seu@email.com" :
                                        "+55 11 99999-9999"
                                    }
                                    required
                                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                                />
                            </div>
                        )}

                        {newType === "RANDOM" && (
                            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <p className="text-white/70 text-sm">
                                    Uma chave aleatória será gerada automaticamente pelo sistema.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || (newType !== "RANDOM" && !newValue)}
                                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold disabled:opacity-50"
                            >
                                {submitting ? "Solicitando..." : "Solicitar Chave"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
