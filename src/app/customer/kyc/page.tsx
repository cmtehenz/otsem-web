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
    const [selectedTab, setSelectedTab] = React.useState<string>("LEVEL_1");

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
                    const level = limitsRes.data.kycLevel || "LEVEL_1";
                    setKycLevel(level);
                    setSelectedTab(level);
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
                    Verifique sua identidade e aumente seus limites
                </p>
            </div>

            <LimitsCard showUpgradeLink={false} />

            {/* Card Único Integrado */}
            <div className="premium-card p-6">
                {/* Header com Status */}
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor} mb-6`}>
                    <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                        <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-bold ${statusInfo.color}`}>{statusInfo.title}</h3>
                        <p className="text-muted-foreground text-sm">{statusInfo.description}</p>
                    </div>
                    {isInReview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshStatus}
                            disabled={refreshing}
                            className="text-muted-foreground"
                        >
                            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                    )}
                </div>

                {/* Ação de Verificação se necessário */}
                {needsVerification && (
                    <div className="mb-6">
                        <Button
                            onClick={startVerification}
                            disabled={startingVerification}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold w-full h-12 rounded-xl"
                        >
                            {startingVerification ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Iniciar Verificação de Identidade
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Progress Stepper */}
                <div className="mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line Background */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-muted-foreground/20 rounded-full mx-10" />
                        
                        {/* Progress Line Active */}
                        <motion.div 
                            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 rounded-full mx-10"
                            style={{ maxWidth: "calc(100% - 80px)" }}
                            initial={{ width: "0%" }}
                            animate={{ 
                                width: kycLevel === "LEVEL_1" ? "0%" : kycLevel === "LEVEL_2" ? "50%" : "100%"
                            }}
                            transition={{ duration: 0.5 }}
                        />

                        {KYC_LEVELS[customerType].map((level, index) => {
                        const LevelIcon = level.icon;
                        const levelNumber = parseInt(level.level.replace("LEVEL_", ""));
                        const currentNumber = parseInt(kycLevel.replace("LEVEL_", ""));
                        const isCurrentLevel = level.level === kycLevel;
                        const isCompleted = levelNumber < currentNumber;
                        const isLocked = levelNumber > currentNumber;

                        return (
                            <button
                                key={level.level}
                                onClick={() => !isLocked && setSelectedTab(level.level)}
                                disabled={isLocked}
                                className={`relative z-10 flex flex-col items-center gap-2 transition-all ${
                                    isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                <motion.div
                                    whileHover={!isLocked ? { scale: 1.1 } : {}}
                                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                        isCompleted
                                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                            : isCurrentLevel
                                            ? `bg-gradient-to-br ${level.color} ring-4 ring-white dark:ring-slate-800`
                                            : "bg-muted-foreground/30"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    ) : isLocked ? (
                                        <span className="text-white/60 text-sm font-bold">{levelNumber}</span>
                                    ) : (
                                        <LevelIcon className="w-5 h-5 text-white" />
                                    )}
                                </motion.div>
                                <span className={`text-xs font-bold ${
                                    isCurrentLevel ? level.textColor : isCompleted ? "text-green-600" : "text-muted-foreground"
                                }`}>
                                    {level.name}
                                </span>
                                <span className={`text-[10px] ${
                                    isCurrentLevel || isCompleted ? "text-foreground" : "text-muted-foreground/60"
                                }`}>
                                    {level.limit}
                                </span>
                            </button>
                        );
                    })}
                    </div>
                </div>

                {/* Selected Level Content */}
                {KYC_LEVELS[customerType].map((level) => {
                    const levelNumber = parseInt(level.level.replace("LEVEL_", ""));
                    const currentNumber = parseInt(kycLevel.replace("LEVEL_", ""));
                    const isCurrentLevel = level.level === kycLevel;
                    const isCompleted = levelNumber < currentNumber;
                    const isLocked = levelNumber > currentNumber;
                    const isSelected = level.level === selectedTab;

                    if (!isSelected) return null;

                    return (
                        <motion.div
                            key={level.level}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl p-5 border ${level.borderColor} ${level.bgColor}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className={`text-lg font-bold ${level.textColor}`}>{level.name}</h3>
                                    <p className="text-2xl font-black text-foreground">{level.limit}/mês</p>
                                </div>
                                {isCurrentLevel && (
                                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                                        Seu Nível
                                    </span>
                                )}
                                {isCompleted && (
                                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Concluído
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm font-medium text-foreground">Requisitos:</p>
                                {level.requirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                            isCompleted || isCurrentLevel 
                                                ? "bg-green-500" 
                                                : "bg-muted-foreground/20"
                                        }`}>
                                            {(isCompleted || isCurrentLevel) ? (
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-sm ${
                                            isCompleted || isCurrentLevel ? "text-foreground" : "text-muted-foreground"
                                        }`}>
                                            {req}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {isLocked && (
                                <Button
                                    onClick={() => requestUpgrade(level.level)}
                                    disabled={requestingUpgrade === level.level}
                                    className={`w-full bg-gradient-to-r ${level.color} hover:opacity-90 text-white font-semibold rounded-xl`}
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

                            {isCurrentLevel && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Complete os requisitos do próximo nível para aumentar seu limite
                                </div>
                            )}

                            {isCompleted && (
                                <div className="text-center text-sm text-green-600 font-medium">
                                    Você já completou este nível!
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
