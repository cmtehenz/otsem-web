"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Users, DollarSign, Clock, Check, Share2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";

// ─── Types ───────────────────────────────────────────────

type Referral = {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
    totalVolume: number;
    commissionEarned: number;
    status: "active" | "inactive";
};

type AffiliateStats = {
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    commissionRate: number;
    totalEarningsUsdt: number;
    pendingEarningsUsdt: number;
};

type Commission = {
    id: string;
    referralId: string;
    referralName: string;
    amount: number;
    amountUsdt: number;
    transactionAmount: number;
    conversionType: "BUY" | "SELL";
    settlementTxId?: string;
    status: "pending" | "paid";
    createdAt: string;
    paidAt?: string;
};

// ─── Helpers ─────────────────────────────────────────────

function formatCurrency(value: number | undefined | null): string {
    return (value ?? 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatUsdt(value: number | undefined | null): string {
    const v = value ?? 0;
    return `$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// ─── Animations ──────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

// ─── Page ────────────────────────────────────────────────

export default function AffiliatesPage() {
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState<AffiliateStats | null>(null);
    const [referrals, setReferrals] = React.useState<Referral[]>([]);
    const [commissions, setCommissions] = React.useState<Commission[]>([]);
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"referrals" | "commissions">("referrals");

    const loadAffiliateData = React.useCallback(async () => {
        try {
            const [statsRes, referralsRes, commissionsRes] = await Promise.all([
                http.get<{ data: AffiliateStats }>("/customers/me/affiliate"),
                http.get<{ data: Referral[] }>("/customers/me/affiliate/referrals"),
                http.get<{ data: Commission[] }>("/customers/me/affiliate/commissions"),
            ]);

            setStats(statsRes.data.data);
            setReferrals(referralsRes.data.data || []);
            setCommissions(commissionsRes.data.data || []);
        } catch {
            setStats(null);
        }
    }, []);

    React.useEffect(() => {
        async function loadData() {
            await loadAffiliateData();
            setLoading(false);
        }

        loadData();
    }, [loadAffiliateData]);

    const referralLink = stats?.referralCode
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${stats.referralCode}`
        : "";

    const copyLink = async () => {
        if (referralLink) {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success("Link copiado!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyCode = async () => {
        if (stats?.referralCode) {
            await navigator.clipboard.writeText(stats.referralCode);
            toast.success("Código copiado!");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "OtsemPay",
                text: "Use meu código de indicação e ganhe benefícios!",
                url: referralLink,
            });
        } else {
            copyLink();
        }
    };

    // ─── Loading ─────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#6F00FF]/30 border-t-[#6F00FF] animate-spin" />
                    <span className="text-[13px] text-muted-foreground">Carregando...</span>
                </div>
            </div>
        );
    }

    // ─── Not available ───────────────────────────────────

    if (!stats) {
        return (
            <motion.div
                className="px-1 space-y-6"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
                <motion.div variants={fadeUp}>
                    <h1 className="text-[22px] font-bold text-foreground">Afiliados</h1>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Indique amigos e ganhe comissões</p>
                </motion.div>

                <motion.div variants={fadeUp} className="premium-card !p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#6F00FF]/10 dark:bg-[#6F00FF]/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-[#6F00FF]" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-foreground mb-1">Recurso não disponível</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                        O programa de afiliados não está habilitado para a sua conta. Entre em contato com o suporte para solicitar acesso.
                    </p>
                </motion.div>
            </motion.div>
        );
    }

    // ─── Main ────────────────────────────────────────────

    return (
        <motion.div
            className="px-1 space-y-5 pb-8"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-[22px] font-bold text-foreground">Afiliados</h1>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                    Indique amigos e ganhe comissões em cada transação
                </p>
            </motion.div>

            {/* Referral link card */}
            <motion.div variants={fadeUp}>
                <div className="relative overflow-hidden rounded-[20px] p-5">
                    {/* Glass gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6F00FF] via-[#8B2FFF] to-[#6F00FF]" />
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative space-y-4">
                        {/* Top: link */}
                        <div>
                            <p className="text-white/60 text-[12px] font-medium mb-1.5">Seu link de indicação</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                                    <p className="text-white text-[13px] font-mono truncate">{referralLink}</p>
                                </div>
                                <button
                                    onClick={copyLink}
                                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 active:scale-95 transition-transform"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                                    ) : (
                                        <Copy className="w-4 h-4 text-white" strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Bottom: code + share */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/50 text-[11px] font-medium mb-0.5">Seu código</p>
                                <button
                                    onClick={copyCode}
                                    className="text-white text-[18px] font-bold tracking-wide active:opacity-70 transition-opacity"
                                >
                                    {stats.referralCode}
                                </button>
                            </div>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#6F00FF] text-[13px] font-semibold active:scale-95 transition-transform"
                            >
                                <Share2 className="w-4 h-4" strokeWidth={2} />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats grid (2x2) */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                {/* Total referrals */}
                <div className="premium-card !p-4 !rounded-[20px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#6F00FF]/10 dark:bg-[#6F00FF]/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#6F00FF]" strokeWidth={2} />
                        </div>
                    </div>
                    <p className="text-[20px] font-bold text-foreground">{stats.totalReferrals ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Total indicados</p>
                    <p className="text-[11px] text-[#6F00FF] dark:text-[#8B2FFF] font-medium mt-0.5">
                        {stats.activeReferrals ?? 0} ativos
                    </p>
                </div>

                {/* Total earnings */}
                <div className="premium-card !p-4 !rounded-[20px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                    </div>
                    <p className="text-[20px] font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(stats.totalEarnings)}
                    </p>
                    {(stats.totalEarningsUsdt ?? 0) > 0 && (
                        <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatUsdt(stats.totalEarningsUsdt)} USDT
                        </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">Total ganho</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {stats.commissionRate ?? 0}% comissão
                    </p>
                </div>

                {/* Pending */}
                <div className="premium-card !p-4 !rounded-[20px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                        </div>
                    </div>
                    <p className="text-[20px] font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(stats.pendingEarnings)}
                    </p>
                    {(stats.pendingEarningsUsdt ?? 0) > 0 && (
                        <p className="text-[12px] text-amber-600 dark:text-amber-400 font-medium">
                            {formatUsdt(stats.pendingEarningsUsdt)} USDT
                        </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">Pendente</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Aguardando pgto</p>
                </div>

                {/* Paid */}
                <div className="premium-card !p-4 !rounded-[20px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                        </div>
                    </div>
                    <p className="text-[20px] font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(stats.paidEarnings)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Já recebido</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Total pago</p>
                </div>
            </motion.div>

            {/* Tab pills */}
            <motion.div variants={fadeUp} className="flex gap-2">
                <button
                    onClick={() => setActiveTab("referrals")}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold active:scale-95 transition-all ${
                        activeTab === "referrals"
                            ? "bg-[#6F00FF] text-white shadow-lg shadow-[#6F00FF]/25"
                            : "bg-white/60 dark:bg-white/[0.06] text-muted-foreground border border-white/60 dark:border-white/[0.08]"
                    }`}
                >
                    Indicações
                </button>
                <button
                    onClick={() => setActiveTab("commissions")}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold active:scale-95 transition-all ${
                        activeTab === "commissions"
                            ? "bg-[#6F00FF] text-white shadow-lg shadow-[#6F00FF]/25"
                            : "bg-white/60 dark:bg-white/[0.06] text-muted-foreground border border-white/60 dark:border-white/[0.08]"
                    }`}
                >
                    Comissões
                </button>
            </motion.div>

            {/* List content */}
            <motion.div variants={fadeUp} className="premium-card !p-5 !rounded-[20px]">
                {activeTab === "referrals" ? (
                    referrals.length === 0 ? (
                        <div className="py-10 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#6F00FF]/10 dark:bg-[#6F00FF]/20 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-[#6F00FF]" strokeWidth={1.8} />
                            </div>
                            <p className="text-[14px] font-medium text-foreground mb-1">Nenhum indicado ainda</p>
                            <p className="text-[13px] text-muted-foreground">Compartilhe seu link para começar!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {referrals.map((referral) => (
                                <div key={referral.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-[#6F00FF]/10 dark:bg-[#6F00FF]/20 flex items-center justify-center shrink-0">
                                            <span className="text-[14px] font-bold text-[#6F00FF] dark:text-[#8B2FFF]">
                                                {referral.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-semibold text-foreground truncate">{referral.name}</p>
                                            <p className="text-[12px] text-muted-foreground">
                                                Desde {formatDate(referral.registeredAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 pl-3">
                                        <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(referral.commissionEarned)}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Vol: {formatCurrency(referral.totalVolume)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : commissions.length === 0 ? (
                    <div className="py-10 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
                        </div>
                        <p className="text-[14px] font-medium text-foreground mb-1">Nenhuma comissão ainda</p>
                        <p className="text-[13px] text-muted-foreground">Suas comissões aparecerão aqui.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {commissions.map((commission) => (
                            <div key={commission.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-[14px] font-semibold text-foreground truncate">{commission.referralName}</p>
                                        {commission.conversionType && (
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                commission.conversionType === "BUY"
                                                    ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                                    : "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                                            }`}>
                                                {commission.conversionType === "BUY" ? "Compra" : "Venda"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-muted-foreground">
                                        Transação {formatCurrency(commission.transactionAmount)}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">{formatDate(commission.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 pl-3">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                            commission.status === "paid"
                                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                        }`}
                                    >
                                        {commission.status === "paid" ? "Pago" : "Pendente"}
                                    </span>
                                    <div className="text-right">
                                        <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                                            {formatCurrency(commission.amount)}
                                        </span>
                                        {(commission.amountUsdt ?? 0) > 0 && (
                                            <span className="text-[11px] text-muted-foreground">
                                                {formatUsdt(commission.amountUsdt)} USDT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
