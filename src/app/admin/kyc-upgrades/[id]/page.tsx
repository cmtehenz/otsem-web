"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Loader2,
    ArrowLeft,
    User,
    Mail,
    Calendar,
    FileText,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpCircle,
    Eye,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface UpgradeRequest {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerDocument: string;
    currentLevel: string;
    targetLevel: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    documents: Array<{ name: string; url: string }>;
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const LEVEL_INFO: Record<string, { name: string; limit: string; color: string }> = {
    LEVEL_1: { name: "Nível 1 - Bronze", limit: "R$ 5.000/mês", color: "from-amber-500 to-orange-600" },
    LEVEL_2: { name: "Nível 2 - Prata", limit: "R$ 50.000/mês", color: "from-gray-400 to-slate-500" },
    LEVEL_3: { name: "Nível 3 - Ouro", limit: "Ilimitado", color: "from-yellow-400 to-amber-500" },
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendente",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
    },
    APPROVED: {
        label: "Aprovado",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejeitado",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
    },
};

export default function KycUpgradeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params?.id as string;

    const [loading, setLoading] = React.useState(true);
    const [request, setRequest] = React.useState<UpgradeRequest | null>(null);
    const [approving, setApproving] = React.useState(false);
    const [rejecting, setRejecting] = React.useState(false);
    const [showRejectModal, setShowRejectModal] = React.useState(false);
    const [rejectReason, setRejectReason] = React.useState("");
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    async function loadRequest() {
        try {
            setLoading(true);
            const res = await http.get<{ data: UpgradeRequest }>(
                `/admin/kyc-upgrade-requests/${requestId}`
            );
            setRequest(res.data.data || res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar solicitação");
            router.push("/admin/kyc-upgrades");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadRequest();
    }, [requestId]);

    async function handleApprove() {
        try {
            setApproving(true);
            await http.post(`/admin/kyc-upgrade-requests/${requestId}/approve`);
            toast.success("Solicitação aprovada com sucesso!");
            router.push("/admin/kyc-upgrades");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao aprovar solicitação");
        } finally {
            setApproving(false);
        }
    }

    async function handleReject() {
        if (!rejectReason.trim()) {
            toast.error("Informe o motivo da rejeição");
            return;
        }

        try {
            setRejecting(true);
            await http.post(`/admin/kyc-upgrade-requests/${requestId}/reject`, {
                reason: rejectReason,
            });
            toast.success("Solicitação rejeitada");
            setShowRejectModal(false);
            router.push("/admin/kyc-upgrades");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao rejeitar solicitação");
        } finally {
            setRejecting(false);
        }
    }

    async function viewDocument(documentUrl: string) {
        setPreviewUrl(documentUrl);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-muted-foreground">Solicitação não encontrada</p>
                <Button
                    variant="outline"
                    onClick={() => router.push("/admin/kyc-upgrades")}
                    className="mt-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[request.status];
    const StatusIcon = statusConfig.icon;
    const currentLevelInfo = LEVEL_INFO[request.currentLevel] || LEVEL_INFO.LEVEL_1;
    const targetLevelInfo = LEVEL_INFO[request.targetLevel] || LEVEL_INFO.LEVEL_2;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Button
                variant="ghost"
                onClick={() => router.push("/admin/kyc-upgrades")}
                className="mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para lista
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Detalhes da Solicitação
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        ID: {request.id}
                    </p>
                </div>
                <Badge variant="outline" className={statusConfig.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                </Badge>
            </div>

            {/* Customer Info */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Informações do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium text-foreground">{request.customerName || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{request.customerEmail}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                        <p className="font-medium text-foreground">{request.customerDocument || "—"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Data da Solicitação</p>
                        <p className="font-medium text-foreground">
                            {format(parseISO(request.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Level Upgrade Info */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5 text-primary" />
                        Upgrade Solicitado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentLevelInfo.color} text-white text-center min-w-[140px]`}>
                            <p className="text-xs opacity-80">Atual</p>
                            <p className="font-bold">{currentLevelInfo.name.split(" - ")[1]}</p>
                            <p className="text-sm mt-1">{currentLevelInfo.limit}</p>
                        </div>

                        <div className="text-2xl text-muted-foreground">→</div>

                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${targetLevelInfo.color} text-white text-center min-w-[140px] ring-2 ring-primary ring-offset-2`}>
                            <p className="text-xs opacity-80">Solicitado</p>
                            <p className="font-bold">{targetLevelInfo.name.split(" - ")[1]}</p>
                            <p className="text-sm mt-1">{targetLevelInfo.limit}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Documentos Enviados ({request.documents?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!request.documents || request.documents.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhum documento enviado
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {request.documents.map((doc, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-muted"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.name}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewDocument(doc.url)}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Visualizar
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Admin Notes (if reviewed) */}
            {request.adminNotes && (
                <Card className="premium-card border-amber-200 bg-amber-50/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Observações do Admin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground">{request.adminNotes}</p>
                        {request.reviewedBy && request.reviewedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Revisado por {request.reviewedBy} em{" "}
                                {format(parseISO(request.reviewedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            {request.status === "PENDING" && (
                <div className="flex gap-4 pt-4">
                    <Button
                        onClick={handleApprove}
                        disabled={approving || rejecting}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white"
                    >
                        {approving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        Aprovar Upgrade
                    </Button>
                    <Button
                        onClick={() => setShowRejectModal(true)}
                        disabled={approving || rejecting}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                    </Button>
                </div>
            )}

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="premium-card border-0">
                    <DialogHeader>
                        <DialogTitle>Rejeitar Solicitação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Informe o motivo da rejeição. O cliente receberá esta informação.
                        </p>
                        <Textarea
                            placeholder="Ex: Documentos ilegíveis, dados inconsistentes..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={rejecting}
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            {rejecting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Confirmar Rejeição
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Preview Modal */}
            {previewUrl && (
                <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                Visualizar Documento
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(previewUrl, "_blank")}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Abrir em nova aba
                                </Button>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto max-h-[70vh]">
                            {previewUrl.toLowerCase().includes(".pdf") ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-[70vh]"
                                    title="Document Preview"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Document"
                                    className="max-w-full mx-auto"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        target.parentElement?.insertAdjacentHTML(
                                            "beforeend",
                                            `<div class="text-center py-8"><p class="text-muted-foreground">Não foi possível carregar a imagem.</p><a href="${previewUrl}" target="_blank" class="text-primary underline">Clique aqui para abrir</a></div>`
                                        );
                                    }}
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
