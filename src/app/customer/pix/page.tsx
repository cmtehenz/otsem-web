"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, Plus, Copy, RefreshCw, Trash2, CheckCircle2, Clock, AlertCircle, ShieldCheck, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

type PixKey = {
    id: string;
    keyType: string;
    keyValue: string;
    status: string;
    validated?: boolean;
    validatedAt?: string | null;
    validationAttempted?: boolean;
    validationError?: string | null;
    createdAt: string;
};

function getErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) return err.response?.data?.message || fallback;
    if (err instanceof Error) return err.message || fallback;
    return fallback;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
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

function getKeyTypeIcon(type: string) {
    switch (type) {
        case "CPF":
        case "CNPJ":
            return "🆔";
        case "EMAIL":
            return "📧";
        case "PHONE":
            return "📱";
        case "RANDOM":
            return "🔑";
        default:
            return "🔑";
    }
}

export default function CustomerPixPage() {
    const { user } = useAuth();
    const customerId = user?.customerId;
    const [loading, setLoading] = React.useState(true);
    const [pixKeys, setPixKeys] = React.useState<PixKey[]>([]);
    const [showModal, setShowModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [keyToDelete, setKeyToDelete] = React.useState<PixKey | null>(null);
    const [newType, setNewType] = React.useState("CPF");
    const [newValue, setNewValue] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [validating, setValidating] = React.useState<string | null>(null);

    async function loadPixKeys() {
        if (!customerId) return;
        try {
            setLoading(true);
            const res = await http.get<PixKey[]>(`/pix-keys`);
            setPixKeys(res.data || []);
        } catch {
            setPixKeys([]);
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadPixKeys();
    }, [customerId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!customerId) return;
        setSubmitting(true);
        try {
            await http.post(`/pix-keys`, {
                keyType: newType,
                keyValue: newType === "RANDOM" ? crypto.randomUUID() : newValue,
            });
            toast.success("Chave Pix cadastrada com sucesso!");
            setShowModal(false);
            setNewType("CPF");
            setNewValue("");
            loadPixKeys();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao cadastrar chave Pix"));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!keyToDelete) return;
        setDeleting(true);
        try {
            await http.delete(`/pix-keys/${keyToDelete.id}`);
            toast.success("Chave Pix removida com sucesso!");
            setShowDeleteModal(false);
            setKeyToDelete(null);
            loadPixKeys();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao remover chave Pix"));
        } finally {
            setDeleting(false);
        }
    }

    async function onCopy(text: string) {
        await navigator.clipboard.writeText(text);
        toast.success("Chave copiada!");
    }

    async function handleValidate(pixKeyId: string) {
        setValidating(pixKeyId);
        try {
            await http.post(`/inter/pix/validar-chave/${pixKeyId}`);
            toast.success("Chave validada com sucesso!");
            loadPixKeys();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Erro ao validar chave"));
        } finally {
            setValidating(null);
        }
    }

    function openDeleteModal(key: PixKey) {
        setKeyToDelete(key);
        setShowDeleteModal(true);
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                <p className="text-sm text-muted-foreground mt-4">Carregando chaves Pix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Chaves Pix</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gerencie suas chaves Pix para receber e enviar pagamentos
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={loadPixKeys}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Chave Pix
                    </Button>
                </div>
            </div>

            <div className="bg-card border border-[#6F00FF]/50/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#6F00FF]/50/20">
                        <ShieldCheck className="w-5 h-5 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                    </div>
                    <div>
                        <p className="text-foreground font-medium text-sm">Validação de Chaves</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Chaves CPF, CNPJ, E-mail e Telefone são validadas automaticamente se corresponderem aos seus dados.
                            Para chaves aleatórias, clique em &quot;Validar&quot; para confirmar via micro-transferência de R$ 0,01.
                        </p>
                    </div>
                </div>
            </div>

            {pixKeys.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <div className="p-4 rounded-full bg-[#6F00FF]/50/20 inline-block mb-4">
                        <KeyRound className="w-8 h-8 text-[#6F00FF]/50 dark:text-[#6F00FF]" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Nenhuma chave Pix encontrada
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Cadastre sua primeira chave Pix para começar a receber pagamentos instantâneos.
                    </p>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold px-8"
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
                            className="bg-card border border-border rounded-2xl p-5 hover:border-[#6F00FF]/50/30 transition"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-linear-to-br from-[#6F00FF]/50/20 to-[#6F00FF]/20 text-2xl">
                                        {getKeyTypeIcon(pix.keyType)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-foreground font-semibold">
                                                {getKeyTypeLabel(pix.keyType)}
                                            </span>
                                            {pix.validated ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Validada
                                                </span>
                                            ) : pix.validationAttempted && pix.validationError ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                                                    <XCircle className="w-3 h-3" />
                                                    Falhou
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                                    <Clock className="w-3 h-3" />
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-muted-foreground text-sm font-mono">
                                                {pix.keyValue}
                                            </code>
                                            <button
                                                onClick={() => onCopy(pix.keyValue)}
                                                className="p-1 hover:bg-accent rounded transition"
                                                title="Copiar chave"
                                            >
                                                <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-muted-foreground text-sm">
                                            Criada em {formatDate(pix.createdAt)}
                                        </p>
                                        {pix.validated && pix.validatedAt && (
                                            <p className="text-green-600/60 dark:text-green-400/60 text-xs">
                                                Validada em {formatDate(pix.validatedAt)}
                                            </p>
                                        )}
                                        {pix.validationAttempted && pix.validationError && (
                                            <p className="text-red-600/60 dark:text-red-400/60 text-xs">
                                                {pix.validationError}
                                            </p>
                                        )}
                                    </div>
                                    {!pix.validated && !pix.validationAttempted && (
                                        <button
                                            onClick={() => handleValidate(pix.id)}
                                            disabled={validating === pix.id}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#6F00FF]/50/20 text-[#6F00FF] dark:text-[#6F00FF]/30 hover:bg-[#6F00FF]/50/30 border border-[#6F00FF]/50/30 transition flex items-center gap-1.5 disabled:opacity-50"
                                            title="Validar chave (R$ 0,01)"
                                        >
                                            {validating === pix.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            )}
                                            Validar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openDeleteModal(pix)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition text-muted-foreground hover:text-red-500"
                                        title="Remover chave"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-card border border-[#6F00FF]/50/20">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Nova Chave Pix</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                Tipo de chave
                            </label>
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger className="w-full border-border bg-background text-foreground">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="CPF" className="text-foreground hover:bg-accent">CPF</SelectItem>
                                    <SelectItem value="CNPJ" className="text-foreground hover:bg-accent">CNPJ</SelectItem>
                                    <SelectItem value="EMAIL" className="text-foreground hover:bg-accent">E-mail</SelectItem>
                                    <SelectItem value="PHONE" className="text-foreground hover:bg-accent">Telefone</SelectItem>
                                    <SelectItem value="RANDOM" className="text-foreground hover:bg-accent">Aleatória</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newType !== "RANDOM" && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                    Valor da chave
                                </label>
                                <Input
                                    type="text"
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    placeholder={
                                        newType === "CPF" ? "000.000.000-00" :
                                            newType === "CNPJ" ? "000.000.000/0000-00" :
                                                newType === "EMAIL" ? "seu@email.com" :
                                                    "+55 11 99999-9999"
                                    }
                                    required
                                    className="border-border bg-background text-foreground placeholder:text-muted-foreground/50"
                                />
                                <p className="text-muted-foreground text-xs mt-2">
                                    {newType === "CPF" || newType === "CNPJ" || newType === "EMAIL" || newType === "PHONE"
                                        ? "Se corresponder aos seus dados cadastrados, será validada automaticamente."
                                        : ""}
                                </p>
                            </div>
                        )}

                        {newType === "RANDOM" && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-foreground text-sm font-medium">Chave Aleatória</p>
                                        <p className="text-muted-foreground text-xs mt-1">
                                            Uma chave será gerada automaticamente. Chaves aleatórias requerem validação manual.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-muted border border-border text-foreground hover:bg-accent"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting || (newType !== "RANDOM" && !newValue)}
                                className="flex-1 bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white font-semibold disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Cadastrando...
                                    </>
                                ) : (
                                    "Cadastrar Chave"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="bg-card border border-red-500/20 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-xl">Remover Chave Pix</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-muted-foreground">
                            Tem certeza que deseja remover esta chave Pix?
                        </p>
                        {keyToDelete && (
                            <div className="bg-muted border border-border rounded-xl p-4">
                                <p className="text-foreground font-medium">{getKeyTypeLabel(keyToDelete.keyType)}</p>
                                <code className="text-muted-foreground text-sm">{keyToDelete.keyValue}</code>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-muted border border-border text-foreground hover:bg-accent"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Removendo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remover
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
