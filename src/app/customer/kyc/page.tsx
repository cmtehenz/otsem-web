"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LimitsCard } from "@/components/kyc/limits-card";
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    ShieldQuestion,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    Fingerprint,
    TrendingUp,
    Crown,
    Star,
    ArrowRight,
    Building2,
    User,
} from "lucide-react";
import { motion } from "framer-motion";

interface CustomerResponse {
    id: string;
    type: "PF" | "PJ";
    accountStatus: string;
    name?: string;
    email: string;
    createdAt: string;
}

interface LimitsResponse {
    kycLevel: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
    customerType: "PF" | "PJ";
    monthlyLimit: number;
    usedThisMonth: number;
    remainingLimit: number;
    resetDate: string;
}

const KYC_LEVELS = {
    PF: [
        {
            level: "LEVEL_1",
            name: "Nível 1",
            limit: "R$ 30.000",
            icon: User,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-700",
            requirements: ["Verificação de identidade básica", "Documento com foto (RG ou CNH)", "Selfie de confirmação"],
        },
        {
            level: "LEVEL_2",
            name: "Nível 2",
            limit: "R$ 100.000",
            icon: Star,
            color: "from-blue-500 to-indigo-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            requirements: ["Comprovante de residência", "Comprovante de renda", "Análise manual"],
        },
        {
            level: "LEVEL_3",
            name: "Nível 3",
            limit: "Ilimitado",
            icon: Crown,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700",
            requirements: ["Declaração de IR", "Análise patrimonial", "Aprovação especial"],
        },
    ],
    PJ: [
        {
            level: "LEVEL_1",
            name: "Nível 1",
            limit: "R$ 50.000",
            icon: Building2,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-700",
            requirements: ["CNPJ ativo", "Contrato social", "Documentos dos sócios"],
        },
        {
            level: "LEVEL_2",
            name: "Nível 2",
            limit: "R$ 200.000",
            icon: Star,
            color: "from-blue-500 to-indigo-500",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            requirements: ["Balanço patrimonial", "DRE dos últimos 12 meses", "Análise de crédito"],
        },
        {
            level: "LEVEL_3",
            name: "Nível 3",
            limit: "Ilimitado",
            icon: Crown,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700",
            requirements: ["Auditoria financeira", "Faturamento comprovado", "Aprovação especial"],
        },
    ],
};

type _AccountStatus = "not_requested" | "requested" | "in_review" | "approved" | "rejected" | "pending" | "completed";

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
    const [customerType, setCustomerType] = React.useState<"PF" | "PJ">("PF");
    const [kycLevel, setKycLevel] = React.useState<"LEVEL_1" | "LEVEL_2" | "LEVEL_3">("LEVEL_1");
    const [requestingUpgrade, setRequestingUpgrade] = React.useState<string | null>(null);

    const customerId = user?.customerId ?? null;

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                const [customerRes, limitsRes] = await Promise.all([
                    http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me"),
                    http.get<LimitsResponse>("/customers/me/limits").catch(() => null),
                ]);
                const data = "data" in customerRes.data ? customerRes.data.data : customerRes.data;
                setAccountStatus(data.accountStatus);
                setCustomerType(data.type || "PF");
                
                if (limitsRes?.data) {
                    setKycLevel(limitsRes.data.kycLevel || "LEVEL_1");
                    if (limitsRes.data.customerType) {
                        setCustomerType(limitsRes.data.customerType);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        }

        if (user) void loadCustomer();
    }, [user]);

    async function requestUpgrade(targetLevel: string) {
        if (!customerId) return;
        
        try {
            setRequestingUpgrade(targetLevel);
            await http.post(`/customers/${customerId}/kyc/upgrade-request`, {
                targetLevel,
            });
            toast.success("Solicitação de upgrade enviada! Nossa equipe entrará em contato.");
        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message || "Erro ao solicitar upgrade");
        } finally {
            setRequestingUpgrade(null);
        }
    }

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
        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { message?: string } } };
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
            const data = "data" in response.data ? (response.data as { data: CustomerResponse }).data : response.data;
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
                <h1 className="text-2xl font-bold text-foreground">Verificação de Identidade</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Verifique sua identidade para ativar sua conta
                </p>
            </div>

            <LimitsCard showUpgradeLink={false} />

            <div className="premium-card p-8">
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

            {/* KYC Levels Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Níveis de Verificação</h2>
                        <p className="text-sm text-muted-foreground">
                            Aumente seu limite mensal evoluindo seu nível
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {KYC_LEVELS[customerType].map((level, index) => {
                        const LevelIcon = level.icon;
                        const isCurrentLevel = level.level === kycLevel;
                        const levelNumber = parseInt(level.level.replace("LEVEL_", ""));
                        const currentNumber = parseInt(kycLevel.replace("LEVEL_", ""));
                        const isLocked = levelNumber > currentNumber;
                        const isCompleted = levelNumber < currentNumber;

                        return (
                            <motion.div
                                key={level.level}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`premium-card p-5 relative overflow-hidden ${
                                    isCurrentLevel ? "ring-2 ring-primary" : ""
                                }`}
                            >
                                {isCurrentLevel && (
                                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                        Atual
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${level.color} shadow-lg`}>
                                        <LevelIcon className="h-6 w-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-foreground">{level.name}</h3>
                                            {isCompleted && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                        <p className={`text-lg font-black ${
                                            level.level === "LEVEL_3" ? "text-emerald-600" : "text-primary"
                                        }`}>
                                            {level.limit}/mês
                                        </p>

                                        <div className="mt-3">
                                            <p className="text-xs text-muted-foreground font-medium mb-2">Requisitos:</p>
                                            <ul className="space-y-1">
                                                {level.requirements.map((req, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            isCompleted || isCurrentLevel ? "bg-green-500" : "bg-muted-foreground/30"
                                                        }`} />
                                                        {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {isLocked && (
                                            <Button
                                                onClick={() => requestUpgrade(level.level)}
                                                disabled={requestingUpgrade === level.level}
                                                className={`mt-4 w-full bg-gradient-to-r ${level.color} hover:opacity-90 text-white font-semibold`}
                                            >
                                                {requestingUpgrade === level.level ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Solicitando...
                                                    </>
                                                ) : (
                                                    <>
                                                        Solicitar Upgrade
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {isCurrentLevel && !isCompleted && (
                                            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                                <p className="text-sm text-primary font-medium">
                                                    Este é seu nível atual. Complete os requisitos do próximo nível para aumentar seu limite.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                    Após solicitar upgrade, nossa equipe analisará seus documentos e entrará em contato.
                </p>
            </div>
        </div>
    );
}
