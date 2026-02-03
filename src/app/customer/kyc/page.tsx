"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";

import { LimitsCard } from "@/components/kyc/limits-card";
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
      accent: "amber",
      ring: "ring-amber-400/40",
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
      barColor: "bg-amber-500",
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
      accent: "blue",
      ring: "ring-blue-400/40",
      badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      barColor: "bg-blue-500",
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
      accent: "emerald",
      ring: "ring-emerald-400/40",
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      barColor: "bg-emerald-500",
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
      accent: "amber",
      ring: "ring-amber-400/40",
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
      barColor: "bg-amber-500",
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
      accent: "blue",
      ring: "ring-blue-400/40",
      badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      barColor: "bg-blue-500",
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
      accent: "emerald",
      ring: "ring-emerald-400/40",
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      barColor: "bg-emerald-500",
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
        <p className="text-[13px] text-white/60">Carregando...</p>
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
        <p className="mt-0.5 text-[13px] text-white/60">
          Complete etapas e desbloqueie limites maiores
        </p>
      </motion.div>

      {/* ---- Current level badge + progress ---- */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5 space-y-5">
        {/* top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${currentLevelData.iconBg} shadow-lg`}
            >
              <currentLevelData.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/60">
                Seu nível
              </p>
              <p className="text-[15px] font-bold text-white">
                {currentLevelData.name}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${currentLevelData.badge}`}
          >
            {currentLevelData.limit}/mês
          </span>
        </div>

        {/* animated progress bar */}
        <div>
          <div className="mb-2 flex justify-between">
            {levels.map((l, i) => (
              <span
                key={l.level}
                className={`text-[11px] font-medium ${
                  i <= currentLevelIndex
                    ? "text-white"
                    : "text-white/40"
                }`}
              >
                {l.name}
              </span>
            ))}
          </div>
          <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-muted-foreground/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[#6F00FF]"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* ---- Limits overview ---- */}
      <motion.div variants={fadeUp}>
        <LimitsCard showUpgradeLink={false} />
      </motion.div>

      {/* ---- Status alerts (pending / rejected) ---- */}
      <AnimatePresence>
        {hasPending && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -8 }}
            className="fintech-glass-card rounded-[20px] p-5 flex items-start gap-3 border-amber-300/60 bg-amber-50/80 dark:border-amber-700/40 dark:bg-amber-950/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Clock className="h-[18px] w-[18px] text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-amber-900 dark:text-amber-300">
                Solicitação em Análise
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400/80">
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
            className="fintech-glass-card rounded-[20px] p-5 space-y-3 border-red-300/60 bg-red-50/80 dark:border-red-700/40 dark:bg-red-950/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                <XCircle className="h-[18px] w-[18px] text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-red-900 dark:text-red-300">
                  Solicitação Rejeitada –{" "}
                  {levels.find((l) => l.level === latestRejected.targetLevel)
                    ?.name || latestRejected.targetLevel}
                </p>
                <p className="mt-0.5 text-[12px] text-red-700 dark:text-red-400/80">
                  Você pode enviar uma nova solicitação com os documentos
                  corretos.
                </p>
              </div>
            </div>
            {latestRejected.adminNotes && (
              <div className="rounded-2xl border border-red-200/60 bg-white/60 px-4 py-3 dark:border-red-800/40 dark:bg-red-900/20">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
                  Motivo
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-red-900 dark:text-red-300">
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
                      ? "bg-muted-foreground/10"
                      : level.iconBg
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-white/40" />
                  ) : (
                    <LevelIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">
                    {level.name}
                  </p>
                  <p className="text-[11px] text-white/60">
                    {level.subtitle}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              {isCurrent && (
                <span className="rounded-full bg-[#6F00FF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#6F00FF]">
                  Atual
                </span>
              )}
              {isCompleted && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Concluído
                </span>
              )}
              {isLocked && (
                <span className="rounded-full bg-muted-foreground/8 px-2.5 py-0.5 text-[11px] font-semibold text-white/40">
                  Bloqueado
                </span>
              )}
            </div>

            {/* Limit */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold text-white">
                {level.limit}
              </span>
              <span className="text-[12px] text-white/60">/mês</span>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Requisitos
              </p>
              <ul className="space-y-1.5">
                {level.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[13px] text-white/80"
                  >
                    {isCompleted || isCurrent ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
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
                  <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-3">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-300">
                        Em análise
                      </p>
                      <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70">
                        Resposta em até 24h úteis
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openUpgradeModal(level)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6F00FF] px-4 py-3 text-[14px] font-bold text-white shadow-lg shadow-[#6F00FF]/20 active:scale-95 transition-transform"
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <p className="text-[15px] font-bold text-white">
            Nível Máximo Atingido
          </p>
          <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-white/60">
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
