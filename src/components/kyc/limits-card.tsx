"use client";

import * as React from "react";
import http from "@/lib/http";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, ChevronRight, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

type LimitsData = {
  kycLevel: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  customerType: "PF" | "PJ";
  monthlyLimit: number;
  usedThisMonth: number;
  remainingLimit: number;
  resetDate: string;
};

const LEVEL_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  LEVEL_1: { label: "Nível 1", color: "text-amber-600", bgColor: "bg-amber-100" },
  LEVEL_2: { label: "Nível 2", color: "text-blue-600", bgColor: "bg-blue-100" },
  LEVEL_3: { label: "Nível 3", color: "text-emerald-600", bgColor: "bg-emerald-100" },
};

function formatCurrency(value: number | undefined | null): string {
  const num = value ?? 0;
  if (num >= 1000000) {
    return `R$ ${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `R$ ${(num / 1000).toFixed(0)}k`;
  }
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatFullCurrency(value: number | undefined | null): string {
  const num = value ?? 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface LimitsCardProps {
  compact?: boolean;
  showUpgradeLink?: boolean;
}

export function LimitsCard({ compact = false, showUpgradeLink = true }: LimitsCardProps) {
  const [loading, setLoading] = React.useState(true);
  const [limits, setLimits] = React.useState<LimitsData | null>(null);

  React.useEffect(() => {
    async function fetchLimits() {
      try {
        const res = await http.get<LimitsData>("/customers/me/limits");
        setLimits(res.data);
      } catch (err) {
        console.error("Failed to fetch limits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, []);

  if (loading) {
    return (
      <div className={`premium-card ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
        </div>
      </div>
    );
  }

  if (!limits) {
    return null;
  }

  const usedThisMonth = limits.usedThisMonth ?? 0;
  const monthlyLimit = limits.monthlyLimit ?? 0;
  const remainingLimit = limits.remainingLimit ?? 0;

  const isUnlimited = limits.kycLevel === "LEVEL_3";
  const usagePercent = isUnlimited || monthlyLimit === 0 ? 0 : Math.min((usedThisMonth / monthlyLimit) * 100, 100);
  const isNearLimit = usagePercent >= 80;
  const levelInfo = LEVEL_LABELS[limits.kycLevel] || LEVEL_LABELS.LEVEL_1;

  const resetDate = new Date(limits.resetDate || Date.now());
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Limite Mensal</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${levelInfo.bgColor} ${levelInfo.color}`}>
            {levelInfo.label}
          </span>
        </div>

        {isUnlimited ? (
          <p className="text-lg font-black text-emerald-600">Ilimitado</p>
        ) : (
          <>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-lg font-black text-foreground">
                {formatCurrency(usedThisMonth)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {formatCurrency(monthlyLimit)}
              </span>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isNearLimit ? "bg-amber-500" : "bg-primary"
                }`}
              />
            </div>
            {isNearLimit && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Próximo do limite
              </p>
            )}
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Limite Mensal</h3>
            <p className="text-xs text-muted-foreground">
              Renova em {daysUntilReset} dia{daysUntilReset !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${levelInfo.bgColor} ${levelInfo.color}`}>
          {levelInfo.label}
        </span>
      </div>

      {isUnlimited ? (
        <div className="text-center py-4">
          <p className="text-2xl font-black text-emerald-600">Ilimitado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Você tem acesso total à plataforma
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">Utilizado</p>
                <p className="text-2xl font-black text-foreground">
                  {formatFullCurrency(usedThisMonth)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Limite</p>
                <p className="text-lg font-bold text-muted-foreground">
                  {formatFullCurrency(monthlyLimit)}
                </p>
              </div>
            </div>

            <div className="h-3 bg-black/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isNearLimit ? "bg-amber-500" : "bg-primary"
                }`}
              />
            </div>

            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{usagePercent.toFixed(0)}% utilizado</span>
              <span>Disponível: {formatFullCurrency(remainingLimit)}</span>
            </div>
          </div>

          {isNearLimit && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Você está próximo do seu limite mensal. Considere fazer upgrade do seu nível.
              </p>
            </div>
          )}

          {showUpgradeLink && limits.kycLevel !== "LEVEL_3" && (
            <Link href="/customer/kyc">
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Aumentar limite
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            </Link>
          )}
        </>
      )}
    </motion.div>
  );
}

export function useLimits() {
  const [limits, setLimits] = React.useState<LimitsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLimits() {
      try {
        const res = await http.get<LimitsData>("/customers/me/limits");
        setLimits(res.data);
      } catch (err) {
        console.error("Failed to fetch limits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLimits();
  }, []);

  return { limits, loading };
}
