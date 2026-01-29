"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/lib/http";
import { toast } from "sonner";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

type KycStatus = "not_requested" | "in_review" | "approved" | "rejected";

type KycCustomer = {
    id: string;
    type: "PF" | "PJ";
    accountStatus: KycStatus;
    name?: string;
    socialName?: string;
    cpf?: string;
    cnpj?: string;
    email: string;
    phone: string;
    createdAt: string;
    address?: {
        zipCode: string;
        street: string;
        number?: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state?: string;
    };
};

type ActionType = "approve" | "reject" | "review" | null;

function statusConfig(status: KycStatus) {
    switch (status) {
        case "approved":
            return {
                label: "Aprovado",
                icon: CheckCircle2,
                className: "bg-green-100 text-green-700 border-green-200",
            };
        case "in_review":
            return {
                label: "Em análise",
                icon: AlertTriangle,
                className: "bg-blue-100 text-blue-700 border-blue-200",
            };
        case "rejected":
            return {
                label: "Rejeitado",
                icon: XCircle,
                className: "bg-red-100 text-red-700 border-red-200",
            };
        default:
            return {
                label: "Não iniciado",
                icon: FileText,
                className: "bg-gray-100 text-gray-700 border-gray-200",
            };
    }
}

function getAxiosStatus(e: unknown): number | undefined {
    if (e && typeof e === "object" && "response" in e) {
        const r = e as { response?: { status?: number } };
        return r.response?.status;
    }
    return undefined;
}

export default function AdminKycDetailPage(): React.JSX.Element {
    const router = useRouter();
    const params = useParams<{ id: string }>() ?? { id: "" };
    const id = params.id;

    const [data, setData] = React.useState<KycCustomer | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [actionType, setActionType] = React.useState<ActionType>(null);
    const [actionLoading, setActionLoading] = React.useState(false);
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [reviewNotes, setReviewNotes] = React.useState("");

    // Load details
    React.useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await http.get<KycCustomer>(`/customers/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Falha ao carregar informações do cliente");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Try a list of routes until one succeeds or a non-404 error happens
    async function trySequence<T = unknown>(
        seq: Array<{ method: "patch" | "post"; url: string; body?: unknown }>
    ): Promise<T> {
        let last404 = false;
        for (const step of seq) {
            try {
                const res =
                    step.method === "patch"
                        ? await http.patch<T>(step.url, step.body ?? {})
                        : await http.post<T>(step.url, step.body ?? {});
                return res.data;
            } catch (e) {
                const status = getAxiosStatus(e);
                if (status === 404) {
                    last404 = true;
                    continue; // try next
                }
                throw e; // other errors: stop
            }
        }
        if (last404) {
            throw new Error(
                "Endpoint não encontrado (404). Verifique as rotas do backend para KYC. "
            );
        }
        throw new Error("Falha ao processar ação de KYC.");
    }

    async function refresh() {
        if (!id) return;
        const res = await http.get<KycCustomer>(`/customers/${id}`);
        setData(res.data);
    }

    async function handleAction() {
        if (!data || !actionType) return;

        try {
            setActionLoading(true);

            if (actionType === "approve") {
                await http.patch(`/customers/${data.id}/approve`);
                toast.success("KYC aprovado com sucesso!");
            }

            if (actionType === "reject") {
                if (!rejectionReason.trim()) {
                    toast.error("Informe o motivo da rejeição");
                    return;
                }
                await http.patch(`/customers/${data.id}/reject`, {
                    reason: rejectionReason,
                });
                toast.success("KYC rejeitado");
            }

            if (actionType === "review") {
                await http.patch(`/customers/${data.id}/review`, {
                    notes: reviewNotes || undefined,
                });
                toast.success("Solicitação de revisão enviada");
            }

            await refresh();
            setActionType(null);
            setRejectionReason("");
            setReviewNotes("");
        } catch (err) {
            console.error(err);
            const status = getAxiosStatus(err);
            if (status === 403) toast.error("Sem permissão para executar esta ação.");
            else if (status === 400) toast.error("Requisição inválida.");
            else if (status === 404) toast.error("Rota não encontrada no backend.");
            else toast.error(err instanceof Error ? err.message : "Falha ao processar ação.");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#b852ff] border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Carregando…</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-muted-foreground">Cliente não encontrado</p>
                    <Button onClick={() => router.push("/admin/kyc")} variant="outline">
                        <ArrowLeft className="mr-2 size-4" />
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    const sc = statusConfig(data.accountStatus);
    const StatusIcon = sc.icon;

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/admin/kyc")}
                        className="hover:bg-[#b852ff]/10"
                    >
                        <ArrowLeft className="mr-1 size-4" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-bold text-[#000000]">Detalhes do Cliente</h1>
                </div>
                <Badge
                    variant="outline"
                    className={`flex w-fit items-center gap-1.5 border px-3 py-1 ${sc.className}`}
                >
                    <StatusIcon className="size-4" />
                    {sc.label}
                </Badge>
            </div>

            {/* Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Dados pessoais */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
                    <CardHeader className="border-b border-[#000000]/5 bg-linear-to-b from-[#faffff] to-[#faffff]/50">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="size-5 text-[#b852ff]" />
                            Dados Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-6">
                        <InfoRow
                            icon={<User className="size-4 text-[#000000]/60" />}
                            label="Nome"
                            value={data.name || data.socialName || "—"}
                        />
                        <InfoRow
                            icon={<Mail className="size-4 text-[#000000]/60" />}
                            label="Email"
                            value={data.email}
                        />
                        <InfoRow
                            icon={<Phone className="size-4 text-[#000000]/60" />}
                            label="Telefone"
                            value={data.phone}
                        />
                        <InfoRow
                            icon={<FileText className="size-4 text-[#000000]/60" />}
                            label={data.type === "PF" ? "CPF" : "CNPJ"}
                            value={data.cpf || data.cnpj || "—"}
                        />
                        <InfoRow
                            icon={<Building2 className="size-4 text-[#000000]/60" />}
                            label="Tipo"
                            value={data.type === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                        />
                        <InfoRow
                            icon={<Calendar className="size-4 text-[#000000]/60" />}
                            label="Cadastro"
                            value={new Date(data.createdAt).toLocaleString("pt-BR")}
                        />
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
                    <CardHeader className="border-b border-[#000000]/5 bg-linear-to-b from-[#faffff] to-[#faffff]/50">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="size-5 text-[#f8bc07]" />
                            Endereço
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {data.address ? (
                            <div className="grid gap-2 text-sm text-[#000000]/80">
                                <p className="font-medium text-[#000000]">
                                    {data.address.street}, {data.address.number || "s/n"}
                                </p>
                                {data.address.complement && (
                                    <p className="text-[#000000]/60">{data.address.complement}</p>
                                )}
                                <p>{data.address.neighborhood}</p>
                                <p>
                                    {data.address.city} {data.address.state ? `- ${data.address.state}` : ""}
                                </p>
                                <p className="mt-2 rounded-lg bg-[#000000]/5 px-3 py-2 font-mono">
                                    CEP: {data.address.zipCode}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-[#000000]/60">Endereço não informado.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ações */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
                <CardHeader className="border-b border-[#000000]/5 bg-linear-to-b from-[#faffff] to-[#faffff]/50">
                    <CardTitle className="text-lg">Ações do KYC</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 p-6">
                    <Button
                        onClick={() => setActionType("review")}
                        disabled={data.accountStatus === "approved"}
                        className="border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        variant="outline"
                    >
                        <AlertTriangle className="mr-2 size-4" />
                        Solicitar Revisão
                    </Button>
                    <Button
                        onClick={() => setActionType("approve")}
                        disabled={data.accountStatus === "approved"}
                        className="border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                        variant="outline"
                    >
                        <CheckCircle2 className="mr-2 size-4" />
                        Aprovar KYC
                    </Button>
                    <Button
                        onClick={() => setActionType("reject")}
                        disabled={data.accountStatus === "approved"}
                        className="border-red-600 bg-red-50 text-red-700 hover:bg-red-100"
                        variant="outline"
                    >
                        <XCircle className="mr-2 size-4" />
                        Rejeitar
                    </Button>
                </CardContent>
            </Card>

            {/* Dialog: Aprovar */}
            <AlertDialog open={actionType === "approve"} onOpenChange={() => setActionType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-green-600" />
                            Aprovar KYC
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirma a aprovação do KYC de <strong>{data.name || data.email}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? "Aprovando..." : "Aprovar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Rejeitar */}
            <AlertDialog
                open={actionType === "reject"}
                onOpenChange={() => {
                    setActionType(null);
                    setRejectionReason("");
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="size-5 text-red-600" />
                            Rejeitar KYC
                        </AlertDialogTitle>
                        <AlertDialogDescription>Informe o motivo da rejeição.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="reason">Motivo *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Ex: Documentos ilegíveis, informações inconsistentes..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-24"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            disabled={actionLoading || !rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {actionLoading ? "Rejeitando..." : "Rejeitar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Revisão */}
            <AlertDialog
                open={actionType === "review"}
                onOpenChange={() => {
                    setActionType(null);
                    setReviewNotes("");
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-blue-600" />
                            Solicitar Revisão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Adicione observações sobre o que precisa ser revisado (opcional).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ex: Por favor, reenviar documento com mais nitidez..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="min-h-24"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLoading ? "Enviando..." : "Enviar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-[#000000]/5 bg-[#faffff]/50 p-3">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
                <p className="text-xs font-medium text-[#000000]/60">{label}</p>
                <p className="text-sm font-medium text-[#000000]">{value}</p>
            </div>
        </div>
    );
}