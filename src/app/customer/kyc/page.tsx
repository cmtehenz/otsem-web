"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";

import {
  Loader2,
  CheckCircle2,
  Crown,
  Star,
  Building2,
  User,
  Clock,
  XCircle,
  TrendingUp,
  Lock,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { KycUpgradeModal } from "@/components/modals/kyc-upgrade-modal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  KYC level config – colour progression: amber → blue → emerald    */
/* ------------------------------------------------------------------ */

const KYC_LEVELS = {
  PF: [
    {
      level: "LEVEL_1",
      name: "Nível 1",
      subtitle: "Básico",
      limit: "R$ 30.000",
      icon: User,
      accent: "purple",
      ring: "ring-white/20",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#8B2FFF] to-[#6F00FF]",
      barColor: "bg-[#6F00FF]",
      requirements: [
        "CPF válido",
        "Cadastro completo",
        "Aprovação automática",
      ],
    },
    {
      level: "LEVEL_2",
      name: "Nível 2",
      subtitle: "Intermediário",
      limit: "R$ 100.000",
      icon: Star,
      accent: "purple",
      ring: "ring-[#6F00FF]/40",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#9B4DFF] to-[#8B2FFF]",
      barColor: "bg-[#8B2FFF]",
      requirements: [
        "Comprovante de residência",
        "Comprovante de renda",
        "Análise em até 24h",
      ],
    },
    {
      level: "LEVEL_3",
      name: "Nível 3",
      subtitle: "Premium",
      limit: "Ilimitado",
      icon: Crown,
      accent: "purple",
      ring: "ring-[#8B2FFF]/40",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#6F00FF] to-[#5800CC]",
      barColor: "bg-[#9B4DFF]",
      requirements: [
        "Declaração de IR",
        "Análise patrimonial",
        "Aprovação especial",
      ],
    },
  ],
  PJ: [
    {
      level: "LEVEL_1",
      name: "Nível 1",
      subtitle: "Básico",
      limit: "R$ 50.000",
      icon: Building2,
      accent: "purple",
      ring: "ring-white/20",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#8B2FFF] to-[#6F00FF]",
      barColor: "bg-[#6F00FF]",
      requirements: [
        "CNPJ válido",
        "Cadastro completo",
        "Aprovação automática",
      ],
    },
    {
      level: "LEVEL_2",
      name: "Nível 2",
      subtitle: "Intermediário",
      limit: "R$ 200.000",
      icon: Star,
      accent: "purple",
      ring: "ring-[#6F00FF]/40",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#9B4DFF] to-[#8B2FFF]",
      barColor: "bg-[#8B2FFF]",
      requirements: [
        "Balanço patrimonial",
        "DRE dos últimos 12 meses",
        "Análise em até 24h",
      ],
    },
    {
      level: "LEVEL_3",
      name: "Nível 3",
      subtitle: "Premium",
      limit: "Ilimitado",
      icon: Crown,
      accent: "purple",
      ring: "ring-[#8B2FFF]/40",
      badge: "bg-white/10 text-white",
      iconBg: "bg-gradient-to-br from-[#6F00FF] to-[#5800CC]",
      barColor: "bg-[#9B4DFF]",
      requirements: [
        "Auditoria financeira",
        "Faturamento comprovado",
        "Aprovação especial",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Framer-Motion variants                                             */
/* ------------------------------------------------------------------ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CustomerKycPage(): React.JSX.Element {
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [customerType, setCustomerType] = React.useState<"PF" | "PJ">("PF");
  const [kycLevel, setKycLevel] = React.useState<
    "LEVEL_1" | "LEVEL_2" | "LEVEL_3"
  >("LEVEL_1");
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [upgradeTarget, setUpgradeTarget] = React.useState<{
    level: string;
    name: string;
    limit: string;
    requirements: string[];
  } | null>(null);
  const [upgradeRequests, setUpgradeRequests] = React.useState<
    UpgradeRequest[]
  >([]);
  const [limitsData, setLimitsData] = React.useState<LimitsResponse | null>(null);

  /* ---- data fetching (preserved) ---- */
  React.useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const [customerRes, limitsRes, upgradeRes] = await Promise.all([
          http.get<{ data: CustomerResponse } | CustomerResponse>(
            "/customers/me",
          ),
          http.get<LimitsResponse>("/customers/me/limits").catch(() => null),
          http
            .get<{ data: UpgradeRequest[] } | UpgradeRequest[]>(
              "/customers/me/kyc-upgrade-requests",
            )
            .catch(() => null),
        ]);

        const data =
          "data" in customerRes.data
            ? customerRes.data.data
            : customerRes.data;
        setCustomerType(data.type || "PF");

        if (limitsRes?.data) {
          const level = limitsRes.data.kycLevel || "LEVEL_1";
          setKycLevel(level);
          setLimitsData(limitsRes.data);
          if (limitsRes.data.customerType) {
            setCustomerType(limitsRes.data.customerType);
          }
        }

        if (upgradeRes?.data) {
          let requests: UpgradeRequest[] = [];
          const resData = upgradeRes.data as
            | { data?: UpgradeRequest[] }
            | UpgradeRequest[];

          if (Array.isArray(resData)) {
            requests = resData;
          } else if (
            resData &&
            typeof resData === "object" &&
            "data" in resData &&
            Array.isArray(resData.data)
          ) {
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

  /* ---- helpers ---- */
  function openUpgradeModal(level: (typeof KYC_LEVELS)["PF"][0]) {
    setUpgradeTarget({
      level: level.level,
      name: level.name,
      limit: level.limit,
      requirements: level.requirements,
    });
    setUpgradeModalOpen(true);
  }

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="flex h-[80dvh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#6F00FF]" />
        <p className="text-[13px] text-white">Carregando...</p>
      </div>
    );
  }

  /* ---- derived data ---- */
  const levels = KYC_LEVELS[customerType];
  const currentLevelIndex = levels.findIndex((l) => l.level === kycLevel);
  const currentLevelData = levels[currentLevelIndex];
  const nextLevelData = levels[currentLevelIndex + 1];
  const progressPercent =
    currentLevelIndex === 0 ? 0 : currentLevelIndex === 1 ? 50 : 100;

  /* ---- pending / rejected helpers ---- */
  const hasPending = upgradeRequests.some((r) => r.status === "PENDING");

  const latestRejected = (() => {
    const sorted = upgradeRequests
      .filter((r) => r.status === "REJECTED")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    const latest = sorted[0];
    if (!latest) return null;
    const hasLaterApproval = upgradeRequests.some(
      (r) =>
        r.status === "APPROVED" &&
        new Date(r.createdAt).getTime() >
          new Date(latest.createdAt).getTime(),
    );
    return hasLaterApproval ? null : latest;
  })();

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-lg space-y-5 pb-8 pt-2"
    >
      {/* ---- Page header ---- */}
      <motion.div variants={fadeUp}>
        <h1 className="text-[22px] font-bold text-white">Verificação</h1>
        <p className="mt-0.5 text-[13px] text-white">
          Complete etapas e desbloqueie limites maiores
        </p>
      </motion.div>

      {/* ---- Combined level + limits card ---- */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5 space-y-4">
        {/* Level header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${currentLevelData.iconBg} shadow-lg`}
            >
              <currentLevelData.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">
                {currentLevelData.name} — {currentLevelData.subtitle}
              </p>
              <p className="text-[12px] text-white">
                Limite: {currentLevelData.limit}/mês
              </p>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div>
          <div className="mb-2 flex justify-between">
            {levels.map((l, i) => (
              <span
                key={l.level}
                className={`text-[11px] font-medium ${
                  i <= currentLevelIndex ? "text-white" : "text-white/90"
                }`}
              >
                {l.name}
              </span>
            ))}
          </div>
          <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[#6F00FF]"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
        </div>

        {/* Usage stats */}
        {limitsData && (
          <>
            <div className="h-px bg-white/10" />
            <div>
              {kycLevel === "LEVEL_3" ? (
                <p className="text-[14px] font-bold text-white">Uso ilimitado</p>
              ) : (
                <>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-[11px] text-white">Utilizado</p>
                      <p className="text-[18px] font-bold text-white">
                        {(limitsData.usedThisMonth ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-white">Disponível</p>
                      <p className="text-[15px] font-semibold text-white">
                        {(limitsData.remainingLimit ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#8B2FFF]"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${limitsData.monthlyLimit > 0 ? Math.min((limitsData.usedThisMonth / limitsData.monthlyLimit) * 100, 100) : 0}%`,
                      }}
                      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>
                  <p className="text-[11px] text-white mt-1.5">
                    Renova em {Math.max(0, Math.ceil((new Date(limitsData.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dia{Math.ceil((new Date(limitsData.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* ---- Status alerts (pending / rejected) ---- */}
      <AnimatePresence>
        {hasPending && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8 }}
            className="fintech-glass-card rounded-[20px] p-5 flex items-start gap-3 border-white/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Clock className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-white">
                Solicitação em Análise
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-white">
                Sua solicitação de upgrade está sendo analisada. Resposta em até
                24h úteis.
              </p>
            </div>
          </motion.div>
        )}

        {latestRejected && (
          <motion.div
            key={latestRejected.id}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8 }}
            className="fintech-glass-card rounded-[20px] p-5 space-y-3 border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <XCircle className="h-[18px] w-[18px] text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-white">
                  Solicitação Rejeitada –{" "}
                  {levels.find((l) => l.level === latestRejected.targetLevel)
                    ?.name || latestRejected.targetLevel}
                </p>
                <p className="mt-0.5 text-[12px] text-white">
                  Você pode enviar uma nova solicitação com os documentos
                  corretos.
                </p>
              </div>
            </div>
            {latestRejected.adminNotes && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white">
                  Motivo
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-white">
                  {latestRejected.adminNotes}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- KYC Level Cards ---- */}
      <motion.div variants={fadeUp}>
        <p className="mb-3 text-[15px] font-bold text-white">
          Níveis de Verificação
        </p>
      </motion.div>

      {levels.map((level, index) => {
        const LevelIcon = level.icon;
        const isCurrent = index === currentLevelIndex;
        const isCompleted = index < currentLevelIndex;
        const isLocked = index > currentLevelIndex;
        const isNext = index === currentLevelIndex + 1;
        const hasPendingForThis = upgradeRequests.some(
          (r) => r.status === "PENDING" && r.targetLevel === level.level,
        );

        return (
          <motion.div
            key={level.level}
            variants={fadeUp}
            className={`fintech-glass-card rounded-[20px] p-5 mb-4 space-y-4 transition-all ${
              isCurrent ? `ring-2 ${level.ring}` : ""
            } ${isLocked ? "opacity-60" : ""}`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] shadow ${
                    isLocked
                      ? "bg-white/10"
                      : level.iconBg
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-white" />
                  ) : (
                    <LevelIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">
                    {level.name}
                  </p>
                  <p className="text-[11px] text-white">
                    {level.subtitle}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              {isCurrent && (
                <span className="rounded-full bg-[#FFB300]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#6F00FF]">
                  Atual
                </span>
              )}
              {isCompleted && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Concluído
                </span>
              )}
              {isLocked && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  Bloqueado
                </span>
              )}
            </div>

            {/* Limit */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-white">
                {level.limit}
              </span>
              <span className="text-[12px] text-white">/mês</span>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white">
                Requisitos
              </p>
              <ul className="space-y-1.5">
                {level.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[13px] text-white"
                  >
                    {isCompleted || isCurrent ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white" />
                    ) : (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                    )}
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action area (only for the next level) */}
            {isNext && (
              <div className="pt-1">
                {hasPendingForThis ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                    <Clock className="h-4 w-4 text-white" />
                    <div>
                      <p className="text-[13px] font-semibold text-white">
                        Em análise
                      </p>
                      <p className="text-[11px] text-white">
                        Resposta em até 24h úteis
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUpgradeModal(level)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-500 hover:bg-yellow-400 px-4 py-3 text-[14px] font-bold text-black shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Solicitar Upgrade
                    <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* ---- Max level reached ---- */}
      {!nextLevelData && (
        <motion.div
          variants={fadeUp}
          className="fintech-glass-card rounded-[20px] p-5 flex flex-col items-center py-8 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B2FFF] to-[#6F00FF] shadow-lg shadow-[#FFB300]/25">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <p className="text-[15px] font-bold text-white">
            Nível Máximo Atingido
          </p>
          <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-white">
            Você tem acesso ilimitado. Não há restrições em suas transações.
          </p>
        </motion.div>
      )}

      {/* ---- Upgrade Modal ---- */}
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
            setUpgradeRequests((prev) => [
              ...prev,
              {
                id: `local-${Date.now()}`,
                targetLevel: upgradeTarget.level,
                status: "PENDING",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]);
          }}
        />
      )}
    </motion.div>
  );
}
