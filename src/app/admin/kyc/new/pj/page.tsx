"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/lib/http";
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

type KycCustomer = {
    id: string;
    type: "PF" | "PJ";
    accountStatus: "not_requested" | "in_review" | "approved" | "rejected";
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

export default function AdminKycDetailPage(): React.JSX.Element {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params?.id ?? "";
    const [data, setData] = React.useState<KycCustomer | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [actionType, setActionType] = React.useState<ActionType>(null);
    const [actionLoading, setActionLoading] = React.useState(false);
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [reviewNotes, setReviewNotes] = React.useState("");

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

    async function handleAction() {
        if (!actionType || !data) return;

        try {
            setActionLoading(true);

            switch (actionType) {
                case "approve":
                    try {
                        await http.patch(`/customers/${data.id}/approve-kyc`);
                    } catch (err) {
                        await http.patch(`/customers/${data.id}`, {
                            accountStatus: "approved"
                        });
                    }
                    toast.success("KYC aprovado com sucesso!");
                    break;

                case "reject":
                    if (!rejectionReason.trim()) {
                        toast.error("Informe o motivo da rejeição");
                        setActionLoading(false);
                        return;
                    }
                    try {
                        await http.patch(`/customers/${data.id}/reject-kyc`, {
                            reason: rejectionReason,
                        });
                    } catch (err) {
                        await http.patch(`/customers/${data.id}`, {
                            accountStatus: "rejected",
                            rejectionReason: rejectionReason,
                        });
                    }
                    toast.success("KYC rejeitado");
                    break;

                case "review":
                    try {
                        await http.patch(`/customers/${data.id}/request-review`, {
                            notes: reviewNotes,
                        });
                    } catch (err) {
                        await http.patch(`/customers/${data.id}`, {
                            accountStatus: "in_review",
                            reviewNotes: reviewNotes,
                        });
                    }
                    toast.success("Solicitação de revisão enviada");
                    break;
            }

            const res = await http.get<KycCustomer>(`/customers/${id}`);
            setData(res.data);
            setActionType(null);
            setRejectionReason("");
            setReviewNotes("");
        } catch (err) {
            console.error(err);
            toast.error("Falha ao processar ação");
        } finally {
            setActionLoading(false);
        }
    }

    function getStatusConfig(status: KycCustomer["accountStatus"]) {
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

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#b852ff] border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Carregando…</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Cliente não encontrado</p>
                    <Button onClick={() => router.push("/admin/kyc")} variant="outline">
                        <ArrowLeft className="mr-2 size-4" />
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(data.accountStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="flex flex-col gap-6 p-6">
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
                    <h1 className="text-2xl font-bold text-[#000000]">
                        Detalhes do Cliente
                    </h1>
                </div>
                <Badge
                    variant="outline"
                    className={`flex w-fit items-center gap-1.5 border px-3 py-1 ${statusConfig.className}`}
                >
                    <StatusIcon className="size-4" />
                    {statusConfig.label}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
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
                                <p>{data.address.city} - {data.address.state}</p>
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

            {/* Dialogs */}
            <AlertDialog open={actionType === "approve"} onOpenChange={() => setActionType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-green-600" />
                            Aprovar KYC
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja aprovar o KYC de <strong>{data.name || data.email}</strong>?
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
                        <AlertDialogDescription>
                            Informe o motivo da rejeição:
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="reason">Motivo *</Label>
                        <Textarea
                            id="reason"
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
                            Adicione observações (opcional):
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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