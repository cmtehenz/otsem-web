"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    ShieldQuestion,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    Fingerprint,
} from "lucide-react";

interface CustomerResponse {
    id: string;
    type: "PF" | "PJ";
    accountStatus: string;
    name?: string;
    email: string;
    createdAt: string;
}

type AccountStatus = "not_requested" | "requested" | "in_review" | "approved" | "rejected" | "pending" | "completed";

const statusConfig: Record<string, {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
}> = {
    approved: {
        icon: ShieldCheck,
        title: "Identidade Verificada",
        description: "Sua identidade foi verificada com sucesso! Você tem acesso completo à plataforma.",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
    },
    completed: {
        icon: ShieldCheck,
        title: "Identidade Verificada",
        description: "Sua identidade foi verificada com sucesso! Você tem acesso completo à plataforma.",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
    },
    in_review: {
        icon: ShieldQuestion,
        title: "Em Análise",
        description: "Sua verificação está sendo processada. Isso pode levar alguns minutos.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    },
    requested: {
        icon: ShieldQuestion,
        title: "Em Análise",
        description: "Sua verificação foi solicitada e está sendo processada.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    },
    pending: {
        icon: ShieldQuestion,
        title: "Em Análise",
        description: "Sua verificação está sendo processada. Isso pode levar alguns minutos.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    },
    rejected: {
        icon: ShieldAlert,
        title: "Verificação Rejeitada",
        description: "Sua verificação foi rejeitada. Tente novamente com documentos válidos.",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
    },
    not_requested: {
        icon: Fingerprint,
        title: "Verificação Pendente",
        description: "Complete a verificação de identidade para ativar sua conta.",
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/30",
    },
};

const defaultStatus = {
    icon: Fingerprint,
    title: "Verificação Pendente",
    description: "Complete a verificação de identidade para ativar sua conta.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
};

export default function CustomerKycPage(): React.JSX.Element {
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = React.useState(true);
    const [startingVerification, setStartingVerification] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [accountStatus, setAccountStatus] = React.useState<string>("not_requested");

    const customerId = user?.customerId ?? null;

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                const response = await http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me");
                const data = "data" in response.data ? response.data.data : response.data;
                console.log("KYC - Customer data:", data);
                console.log("KYC - accountStatus:", data.accountStatus);
                setAccountStatus(data.accountStatus);
            } catch (err) {
                console.error(err);
                toast.error("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        }

        if (user) void loadCustomer();
    }, [user]);

    async function startVerification() {
        if (!customerId) return;

        try {
            setStartingVerification(true);

            const response = await http.post<{ verificationUrl: string }>(
                `/customers/${customerId}/kyc/request`
            );

            const verificationUrl = response.data?.verificationUrl;

            if (verificationUrl) {
                window.open(verificationUrl, "_blank");
                toast.success("Complete a verificação na nova aba.");
                setAccountStatus("in_review");
            } else {
                throw new Error("URL de verificação não recebida");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Erro ao iniciar verificação");
        } finally {
            setStartingVerification(false);
        }
    }

    async function refreshStatus() {
        if (!customerId) return;

        try {
            setRefreshing(true);
            const response = await http.get<{ data: CustomerResponse } | CustomerResponse>(
                "/customers/me"
            );
            const data = "data" in response.data ? (response.data as any).data : response.data;
            setAccountStatus(data.accountStatus);
            toast.success("Status atualizado!");
        } catch {
            toast.error("Erro ao atualizar status");
        } finally {
            setRefreshing(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="text-sm text-white/60 mt-4">Carregando...</p>
            </div>
        );
    }

    const statusInfo = statusConfig[accountStatus] || defaultStatus;
    const StatusIcon = statusInfo.icon;
    
    const isApproved = accountStatus === "approved" || accountStatus === "completed";
    const isInReview = accountStatus === "in_review" || accountStatus === "pending" || accountStatus === "requested";
    const needsVerification = accountStatus === "not_requested" || accountStatus === "rejected" || !statusConfig[accountStatus];

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Verificação de Identidade</h1>
                <p className="text-white/50 text-sm mt-1">
                    Verifique sua identidade para ativar sua conta
                </p>
            </div>

            <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-8">
                <div className={`p-6 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor} mb-6`}>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`p-4 rounded-full ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-12 h-12 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-semibold ${statusInfo.color}`}>
                                {statusInfo.title}
                            </h3>
                            <p className="text-white/60 mt-2 text-sm">{statusInfo.description}</p>
                        </div>
                    </div>
                </div>

                {isApproved && (
                    <div className="text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">Tudo certo!</p>
                        <p className="text-white/60 text-sm mb-6">
                            Sua conta está verificada e você tem acesso completo.
                        </p>
                        <Button
                            onClick={() => router.push("/customer/dashboard")}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold w-full"
                        >
                            Ir para Dashboard
                        </Button>
                    </div>
                )}

                {isInReview && (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
                        <p className="text-white/60 text-sm">
                            Aguarde enquanto processamos sua verificação.
                        </p>
                        <Button
                            variant="outline"
                            onClick={refreshStatus}
                            disabled={refreshing}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            {refreshing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Atualizar Status
                        </Button>
                    </div>
                )}

                {needsVerification && (
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl p-4 space-y-3">
                            <h4 className="text-white font-medium">Como funciona:</h4>
                            <ul className="text-white/60 text-sm space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                                    Clique no botão abaixo para iniciar
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                                    Tire uma foto do seu documento (RG ou CNH)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                                    Tire uma selfie para confirmar sua identidade
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                                    Aguarde a aprovação automática
                                </li>
                            </ul>
                        </div>

                        <Button
                            onClick={startVerification}
                            disabled={startingVerification}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold w-full h-12"
                        >
                            {startingVerification ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Iniciar Verificação
                                </>
                            )}
                        </Button>

                        <p className="text-white/40 text-xs text-center">
                            A verificação será feita em uma nova aba. Após concluir, volte aqui e atualize o status.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
