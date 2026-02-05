"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Search,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Loader2,
    ChevronUp,
    ChevronDown,
    X,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTopTokens, type CoinMarketData } from "@/hooks/use-top-tokens";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
} from "@/components/ui/bottom-sheet";

// ─── Animation variants ──────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
    },
};

const stagger = {
    show: { transition: { staggerChildren: 0.04 } },
};

// ─── Helpers ─────────────────────────────────────────────
type Currency = "usd" | "brl";

function formatPrice(value: number, currency: Currency): string {
    if (currency === "brl") {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: value < 1 ? 6 : 2,
        });
    }
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: value < 1 ? 6 : 2,
    });
}

function formatLargeNumber(value: number, currency: Currency): string {
    const symbol = currency === "brl" ? "R$" : "$";
    if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
    return `${symbol}${value.toLocaleString()}`;
}

function formatSupply(value: number): string {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
}

function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
}

// ─── Token Row ───────────────────────────────────────────
function TokenRow({
    token,
    currency,
    onSelect,
}: {
    token: CoinMarketData;
    currency: Currency;
    onSelect: (t: CoinMarketData) => void;
}) {
    const change = token.price_change_percentage_24h ?? 0;
    const isPositive = change >= 0;

    return (
        <motion.button
            variants={fadeUp}
            onClick={() => onSelect(token)}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors text-left"
        >
            {/* Rank */}
            <span className="text-[13px] font-medium text-white/60 w-6 text-right tabular-nums shrink-0">
                {token.market_cap_rank}
            </span>

            {/* Icon */}
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">
                <Image
                    src={token.image}
                    alt={token.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 object-cover"
                    unoptimized
                />
            </div>

            {/* Name + Symbol */}
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[15px] font-semibold text-white truncate">
                    {token.name}
                </span>
                <span className="text-[13px] text-white/70 uppercase">
                    {token.symbol}
                </span>
            </div>

            {/* Price + Change */}
            <div className="flex flex-col items-end shrink-0">
                <span className="text-[15px] font-semibold text-white tabular-nums">
                    {formatPrice(token.current_price, currency)}
                </span>
                <span
                    className={`flex items-center gap-0.5 text-[13px] font-medium tabular-nums ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                >
                    {isPositive ? (
                        <ChevronUp className="w-3 h-3" />
                    ) : (
                        <ChevronDown className="w-3 h-3" />
                    )}
                    {Math.abs(change).toFixed(2)}%
                </span>
            </div>
        </motion.button>
    );
}

// ─── Token Detail Sheet ──────────────────────────────────
function TokenDetailSheet({
    token,
    currency,
    open,
    onClose,
    t,
}: {
    token: CoinMarketData | null;
    currency: Currency;
    open: boolean;
    onClose: () => void;
    t: ReturnType<typeof useTranslations<"mercado">>;
}) {
    if (!token) return null;

    const change = token.price_change_percentage_24h ?? 0;
    const isPositive = change >= 0;

    const stats = [
        {
            label: t("marketCap"),
            value: formatLargeNumber(token.market_cap, currency),
        },
        {
            label: t("volume24h"),
            value: formatLargeNumber(token.total_volume, currency),
        },
        {
            label: t("high24h"),
            value: token.high_24h
                ? formatPrice(token.high_24h, currency)
                : "—",
        },
        {
            label: t("low24h"),
            value: token.low_24h
                ? formatPrice(token.low_24h, currency)
                : "—",
        },
        {
            label: t("circulatingSupply"),
            value: formatSupply(token.circulating_supply),
        },
        {
            label: t("maxSupply"),
            value: token.max_supply ? formatSupply(token.max_supply) : "—",
        },
        {
            label: t("ath"),
            value: formatPrice(token.ath, currency),
        },
        {
            label: t("athChange"),
            value: `${token.ath_change_percentage.toFixed(2)}%`,
        },
    ];

    return (
        <BottomSheet open={open} onOpenChange={(v) => !v && onClose()}>
            <BottomSheetContent className="bg-[#1a0a2e]/95 backdrop-blur-xl border-white/10">
                <BottomSheetHeader>
                    <BottomSheetTitle className="sr-only">
                        {token.name}
                    </BottomSheetTitle>
                    <BottomSheetDescription className="sr-only">
                        {token.name} — {token.symbol}
                    </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="px-1 pb-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 shrink-0">
                            <Image
                                src={token.image}
                                alt={token.name}
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white truncate">
                                {token.name}
                            </h3>
                            <p className="text-[15px] text-white/70 uppercase">
                                {token.symbol} · #{token.market_cap_rank}
                            </p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white/5 rounded-2xl p-4">
                        <p className="text-[13px] text-white/60 mb-1">
                            {t("currentPrice")}
                        </p>
                        <p className="text-3xl font-bold text-white tabular-nums">
                            {formatPrice(token.current_price, currency)}
                        </p>
                        <span
                            className={`inline-flex items-center gap-1 mt-1 text-[15px] font-semibold tabular-nums ${
                                isPositive
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }`}
                        >
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(change).toFixed(2)}% (24h)
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white/5 rounded-xl p-3"
                            >
                                <p className="text-[12px] text-white/60 mb-0.5">
                                    {stat.label}
                                </p>
                                <p className="text-[14px] font-semibold text-white tabular-nums">
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </BottomSheetContent>
        </BottomSheet>
    );
}

// ─── Main Page ───────────────────────────────────────────
export default function MercadoPage() {
    const t = useTranslations("mercado");
    const [currency, setCurrency] = useState<Currency>("usd");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedToken, setSelectedToken] = useState<CoinMarketData | null>(
        null
    );
    const [detailOpen, setDetailOpen] = useState(false);

    const { tokens, loading, error, updatedAt, refresh } = useTopTokens({
        currency,
        perPage: 15,
        refreshInterval: 60_000,
    });

    const filteredTokens = useMemo(() => {
        if (!searchQuery.trim()) return tokens;
        const q = searchQuery.toLowerCase().trim();
        return tokens.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.symbol.toLowerCase().includes(q)
        );
    }, [tokens, searchQuery]);

    function handleSelectToken(token: CoinMarketData) {
        setSelectedToken(token);
        setDetailOpen(true);
    }

    // ─── Loading state ───────────────────────────────────
    if (loading && tokens.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                <p className="text-[15px] text-white/70">{t("loading")}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="pb-32 px-4 pt-2"
        >
            {/* Header */}
            <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 mb-5"
            >
                <Link href="/customer/dashboard">
                    <motion.div
                        whileTap={{ scale: 0.92 }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </motion.div>
                </Link>
                <div className="flex-1">
                    <h1 className="text-[22px] font-bold text-white tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="text-[13px] text-white/70">{t("subtitle")}</p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={refresh}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                    <RefreshCw className="w-4.5 h-4.5 text-white/80" />
                </motion.button>
            </motion.div>

            {/* Search + Currency Toggle */}
            <motion.div variants={fadeUp} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/8 text-[15px] text-white placeholder:text-white/40 outline-none focus:bg-white/12 transition-colors border border-white/10 focus:border-white/20"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <X className="w-4 h-4 text-white/40" />
                        </button>
                    )}
                </div>
                <div className="flex rounded-xl bg-white/8 border border-white/10 p-0.5">
                    <button
                        onClick={() => setCurrency("usd")}
                        className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                            currency === "usd"
                                ? "bg-[#6F00FF] text-white shadow-lg shadow-[#6F00FF]/30"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        USD
                    </button>
                    <button
                        onClick={() => setCurrency("brl")}
                        className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                            currency === "brl"
                                ? "bg-[#6F00FF] text-white shadow-lg shadow-[#6F00FF]/30"
                                : "text-white/60 hover:text-white"
                        }`}
                    >
                        BRL
                    </button>
                </div>
            </motion.div>

            {/* Last updated */}
            {updatedAt && (
                <motion.p
                    variants={fadeUp}
                    className="text-[12px] text-white/50 mb-3 px-1"
                >
                    {t("updated")} {timeAgo(updatedAt)} {t("ago")}
                </motion.p>
            )}

            {/* Error state */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                    >
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-[13px] text-red-300">
                                {error === "RATE_LIMITED"
                                    ? t("rateLimited")
                                    : t("fetchError")}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Token List */}
            <motion.div variants={stagger} className="flex flex-col gap-1.5">
                {filteredTokens.length === 0 && !loading ? (
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col items-center py-16 gap-3"
                    >
                        <Search className="w-8 h-8 text-white/30" />
                        <p className="text-[15px] text-white/50">
                            {t("noResults")} &ldquo;{searchQuery}&rdquo;
                        </p>
                    </motion.div>
                ) : (
                    filteredTokens.map((token) => (
                        <TokenRow
                            key={token.id}
                            token={token}
                            currency={currency}
                            onSelect={handleSelectToken}
                        />
                    ))
                )}
            </motion.div>

            {/* Token Detail Sheet */}
            <TokenDetailSheet
                token={selectedToken}
                currency={currency}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                t={t}
            />
        </motion.div>
    );
}
