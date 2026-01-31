"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LimitsCard } from "@/components/kyc/limits-card";
import {
    Loader2,
    CheckCircle2,
    Crown,
    Star,
    ArrowRight,
    Building2,
    User,
    Clock,
    XCircle,
    Sparkles,
    TrendingUp,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { KycUpgradeModal } from "@/components/modals/kyc-upgrade-modal";

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

interface UpgradeRequest {
    id: string;
    targetLevel: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

const KYC_LEVELS = {
    PF: [
        {
            level: "LEVEL_1",
            name: "Nível 1",
            limit: "R$ 30.000",
            icon: User,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            iconColor: "text-blue-600",
            requirements: ["CPF válido", "Cadastro completo", "Aprovação automática"],
        },
        {
            level: "LEVEL_2",
            name: "Nível 2",
            limit: "R$ 100.000",
            icon: Star,
            color: "from-violet-500 to-purple-600",
            bgColor: "bg-violet-50",
            borderColor: "border-violet-200",
            textColor: "text-violet-700",
            iconColor: "text-violet-600",
            requirements: ["Comprovante de residência", "Comprovante de renda", "Análise em até 24h"],
        },
        {
            level: "LEVEL_3",
            name: "Nível 3",
            limit: "Ilimitado",
            icon: Crown,
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-700",
            iconColor: "text-amber-600",
            requirements: ["Declaração de IR", "Análise patrimonial", "Aprovação especial"],
        },
    ],
    PJ: [
        {
            level: "LEVEL_1",
            name: "Nível 1",
            limit: "R$ 50.000",
            icon: Building2,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            iconColor: "text-blue-600",
            requirements: ["CNPJ válido", "Cadastro completo", "Aprovação automática"],
        },
        {
            level: "LEVEL_2",
            name: "Nível 2",
            limit: "R$ 200.000",
            icon: Star,
            color: "from-violet-500 to-purple-600",
            bgColor: "bg-violet-50",
            borderColor: "border-violet-200",
            textColor: "text-violet-700",
            iconColor: "text-violet-600",
            requirements: ["Balanço patrimonial", "DRE dos últimos 12 meses", "Análise em até 24h"],
        },
        {
            level: "LEVEL_3",
            name: "Nível 3",
            limit: "Ilimitado",
            icon: Crown,
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-700",
            iconColor: "text-amber-600",
            requirements: ["Auditoria financeira", "Faturamento comprovado", "Aprovação especial"],
        },
    ],
};

export default function CustomerKycPage(): React.JSX.Element {
    const { user } = useAuth();

    const [loading, setLoading] = React.useState(true);
    const [customerType, setCustomerType] = React.useState<"PF" | "PJ">("PF");
    const [kycLevel, setKycLevel] = React.useState<"LEVEL_1" | "LEVEL_2" | "LEVEL_3">("LEVEL_1");
    const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
    const [upgradeTarget, setUpgradeTarget] = React.useState<{
        level: string;
        name: string;
        limit: string;
        requirements: string[];
    } | null>(null);
    const [upgradeRequests, setUpgradeRequests] = React.useState<UpgradeRequest[]>([]);

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                const [customerRes, limitsRes, upgradeRes] = await Promise.all([
                    http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me"),
                    http.get<LimitsResponse>("/customers/me/limits").catch(() => null),
                    http.get<{ data: UpgradeRequest[] } | UpgradeRequest[]>("/customers/me/kyc-upgrade-requests").catch(() => null),
                ]);

                const data = "data" in customerRes.data ? customerRes.data.data : customerRes.data;
                setCustomerType(data.type || "PF");

                if (limitsRes?.data) {
                    const level = limitsRes.data.kycLevel || "LEVEL_1";
                    setKycLevel(level);
                    if (limitsRes.data.customerType) {
                        setCustomerType(limitsRes.data.customerType);
                    }
                }

                if (upgradeRes?.data) {
                    let requests: UpgradeRequest[] = [];
                    const resData = upgradeRes.data as { data?: UpgradeRequest[] } | UpgradeRequest[];

                    if (Array.isArray(resData)) {
                        requests = resData;
                    } else if (resData && typeof resData === 'object' && 'data' in resData && Array.isArray(resData.data)) {
                        requests = resData.data;
                    }

                    setUpgradeRequests(requests);
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

    function openUpgradeModal(level: typeof KYC_LEVELS["PF"][0]) {
        setUpgradeTarget({
            level: level.level,
            name: level.name,
            limit: level.limit,
            requirements: level.requirements,
        });
        setUpgradeModalOpen(true);
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
            </div>
        );
    }

    const currentLevelIndex = KYC_LEVELS[customerType].findIndex(l => l.level === kycLevel);
    const currentLevelData = KYC_LEVELS[customerType][currentLevelIndex];
    const nextLevelData = KYC_LEVELS[customerType][currentLevelIndex + 1];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                >
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">Verificação de Identidade</span>
                </motion.div>
                <h1 className="text-3xl font-black text-foreground">
                    Seus Limites e Níveis
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Complete a verificação e desbloqueie limites maiores para suas transações
                </p>
            </div>

            {/* Limits Overview Card */}
            <LimitsCard showUpgradeLink={false} />

            {/* Pending/Rejected Requests */}
            <AnimatePresence>
                {upgradeRequests.filter(r => r.status === "PENDING").length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl p-5 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">
                                    Solicitação em Análise
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                    Sua solicitação de upgrade está sendo analisada por nossa equipe.
                                    Você receberá uma resposta em até 24 horas úteis.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {(() => {
                    // Mostra apenas a solicitação rejeitada mais recente, e apenas se ainda não foi superada
                    const rejectedRequests = upgradeRequests
                        .filter(r => r.status === "REJECTED")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    // Pega apenas a mais recente
                    const latestRejected = rejectedRequests[0];

                    // Verifica se há uma solicitação aprovada posterior para o mesmo nível ou superior
                    if (latestRejected) {
                        const hasLaterApproval = upgradeRequests.some(r => {
                            if (r.status !== "APPROVED") return false;
                            const rejectedDate = new Date(latestRejected.createdAt).getTime();
                            const approvedDate = new Date(r.createdAt).getTime();
                            return approvedDate > rejectedDate;
                        });

                        // Se não há aprovação posterior, mostra a rejeição
                        if (!hasLaterApproval) {
                            const targetLevelData = KYC_LEVELS[customerType].find(l => l.level === latestRejected.targetLevel);
                            return (
                                <motion.div
                                    key={latestRejected.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl p-5 border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 dark:border-red-800"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-red-900 dark:text-red-300">
                                                Solicitação Rejeitada - {targetLevelData?.name || latestRejected.targetLevel}
                                            </h3>
                                            {latestRejected.adminNotes && (
                                                <div className="mt-3 p-4 rounded-xl bg-white/60 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-1">
                                                        Motivo da rejeição:
                                                    </p>
                                                    <p className="text-sm text-red-900 dark:text-red-300">{latestRejected.adminNotes}</p>
                                                </div>
                                            )}
                                            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                                                Você pode enviar uma nova solicitação com os documentos corretos.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }
                    }
                    return null;
                })()}
            </AnimatePresence>

            {/* KYC Levels Visualization */}
            <div className="premium-card p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {/* Background line */}
                        <div className="absolute top-6 left-0 right-0 h-1.5 bg-muted-foreground/10 rounded-full mx-12" />

                        {/* Active progress line */}
                        <motion.div
                            className="absolute top-6 left-0 h-1.5 rounded-full mx-12 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500"
                            initial={{ width: "0%" }}
                            animate={{
                                width: currentLevelIndex === 0 ? "0%" :
                                       currentLevelIndex === 1 ? "calc(50% - 48px)" :
                                       "calc(100% - 96px)"
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />

                        {KYC_LEVELS[customerType].map((level, index) => {
                            const LevelIcon = level.icon;
                            const isCompleted = index < currentLevelIndex;
                            const isCurrent = index === currentLevelIndex;
                            const isLocked = index > currentLevelIndex;

                            return (
                                <div key={level.level} className="relative z-10 flex flex-col items-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${
                                            isCompleted
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400"
                                                : isCurrent
                                                ? `bg-gradient-to-br ${level.color} border-white shadow-xl scale-110`
                                                : "bg-muted border-muted-foreground/20 opacity-40"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        ) : (
                                            <LevelIcon className={`w-6 h-6 ${isCurrent ? "text-white" : "text-muted-foreground"}`} />
                                        )}
                                    </motion.div>
                                    <div className="text-center">
                                        <p className={`text-xs font-black ${
                                            isCurrent ? level.textColor :
                                            isCompleted ? "text-green-600" :
                                            "text-muted-foreground"
                                        }`}>
                                            {level.name}
                                        </p>
                                        <p className={`text-[10px] mt-0.5 ${
                                            isCurrent || isCompleted ? "text-foreground font-bold" : "text-muted-foreground/60"
                                        }`}>
                                            {level.limit}/mês
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Current Level Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-6 border-2 ${currentLevelData.borderColor} bg-gradient-to-br ${currentLevelData.bgColor} to-white dark:to-slate-900/50 mb-6`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentLevelData.color} shadow-lg`}>
                                <currentLevelData.icon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Seu nível atual</p>
                                <p className={`text-2xl font-black ${currentLevelData.textColor}`}>
                                    {currentLevelData.name}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground font-medium">Limite mensal</p>
                            <p className="text-2xl font-black text-foreground">{currentLevelData.limit}</p>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5">
                        <p className="text-xs font-bold text-muted-foreground mb-3">Recursos inclusos:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {currentLevelData.requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${currentLevelData.iconColor}`} />
                                    <span className="text-foreground/80">{req}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Next Level Upgrade Section */}
                {nextLevelData && (() => {
                    const hasPendingRequest = upgradeRequests.some(
                        r => r.status === "PENDING" && r.targetLevel === nextLevelData.level
                    );

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl p-6 border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${nextLevelData.color} shadow-lg`}>
                                    <nextLevelData.icon className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-black text-foreground">
                                            Próximo Nível: {nextLevelData.name}
                                        </h3>
                                        <Sparkles className={`w-5 h-5 ${nextLevelData.iconColor}`} />
                                    </div>
                                    <p className={`text-3xl font-black ${nextLevelData.textColor} mb-1`}>
                                        {nextLevelData.limit}
                                        <span className="text-lg text-muted-foreground font-medium">/mês</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {nextLevelData.level === "LEVEL_2"
                                            ? "Aumente seus limites para movimentar mais"
                                            : "Acesso ilimitado à plataforma com limites sem restrições"}
                                    </p>

                                    <div className="space-y-2 mb-5">
                                        <p className="text-xs text-muted-foreground font-bold">Documentos necessários:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {nextLevelData.requirements.map((req, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${nextLevelData.color}`} />
                                                    <span className="text-foreground/70">{req}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {hasPendingRequest ? (
                                        <div className="p-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700">
                                            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                                <Clock className="w-5 h-5" />
                                                <div>
                                                    <p className="text-sm font-bold">Solicitação em análise</p>
                                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                                                        A análise leva até 24 horas úteis. Você será notificado.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => openUpgradeModal(nextLevelData)}
                                            className={`w-full h-12 bg-gradient-to-r ${nextLevelData.color} hover:opacity-90 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all`}
                                        >
                                            <TrendingUp className="w-5 h-5 mr-2" />
                                            Solicitar Upgrade para {nextLevelData.name}
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Max Level Reached */}
                {!nextLevelData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl p-8 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-center"
                    >
                        <Crown className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                        <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mb-2">
                            Nível Máximo Atingido!
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Você tem acesso ilimitado à plataforma. Não há restrições em suas transações.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Upgrade Modal */}
            {upgradeTarget && (
                <KycUpgradeModal
                    open={upgradeModalOpen}
                    onClose={() => setUpgradeModalOpen(false)}
                    targetLevel={upgradeTarget.level}
                    targetLevelName={upgradeTarget.name}
                    targetLimit={upgradeTarget.limit}
                    requirements={upgradeTarget.requirements}
                    onSuccess={() => {
                        setUpgradeModalOpen(false);
                        setUpgradeRequests(prev => [
                            ...prev,
                            {
                                id: `local-${Date.now()}`,
                                targetLevel: upgradeTarget.level,
                                status: "PENDING",
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            }
                        ]);
                    }}
                />
            )}
        </div>
    );
}
