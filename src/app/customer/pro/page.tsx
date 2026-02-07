"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import http from "@/lib/http";
import { toast } from "sonner";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetHeader,
    BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] } },
};

const stagger = {
    show: { transition: { staggerChildren: 0.06 } },
};

type PairMeta = {
    id: string;
    base: string;
    quote: string;
    price: number;
    priceDecimals: number;
    qtyDecimals: number;
    change: number;
};

const PAIRS: PairMeta[] = [
    { id: "BTC-USDT", base: "BTC", quote: "USDT", price: 43120, priceDecimals: 2, qtyDecimals: 4, change: 1.42 },
    { id: "ETH-USDT", base: "ETH", quote: "USDT", price: 2310.5, priceDecimals: 2, qtyDecimals: 4, change: 0.82 },
    { id: "SOL-USDT", base: "SOL", quote: "USDT", price: 106.3, priceDecimals: 2, qtyDecimals: 2, change: -2.14 },
    { id: "TRX-USDT", base: "TRX", quote: "USDT", price: 0.1238, priceDecimals: 4, qtyDecimals: 0, change: 0.44 },
    { id: "XRP-USDT", base: "XRP", quote: "USDT", price: 0.5442, priceDecimals: 4, qtyDecimals: 1, change: 3.11 },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"] as const;
const ASSETS = ["USDT", "BTC", "ETH", "SOL", "TRX", "XRP"] as const;
const PRO_FEE_RATE = (() => {
    const raw = Number(process.env.NEXT_PUBLIC_PRO_FEE_RATE ?? "0.0098");
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return raw;
})();

type Timeframe = typeof TIMEFRAMES[number];

const BAR_MAP: Record<Timeframe, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "1h": "1H",
    "4h": "4H",
    "1D": "1D",
};

function formatNumber(value: number, decimals: number) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function formatCompact(value: number) {
    if (!Number.isFinite(value)) return "—";
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(2);
}

function toNumber(value: string) {
    const cleaned = value.replace(/[^\d.,]/g, "");
    if (cleaned.includes(",")) {
        return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
    }
    return Number(cleaned) || 0;
}

type SpotTicker = {
    instId: string;
    last: number;
    open24h: number;
    high24h: number;
    low24h: number;
    vol24h: number;
    changePct: number;
};

type OrderBookRow = {
    price: number;
    size: number;
};

type OrderBook = {
    instId: string;
    ts: number;
    asks: OrderBookRow[];
    bids: OrderBookRow[];
};

type SpotTrade = {
    price: number;
    size: number;
    side: "buy" | "sell";
    ts: number;
};

type SpotCandle = {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

type CandlesResponse = {
    candles: SpotCandle[];
};

type TradesResponse = {
    trades: SpotTrade[];
};

type SpotBalance = {
    currency: string;
    available: number;
    locked: number;
};

type WalletItem = {
    id: string;
    network: string;
    balance: string | number;
};

type SpotTransferItem = {
    id: string;
    amount: number;
    currency: string;
    direction: "TO_PRO" | "TO_WALLET";
    network: string | null;
    createdAt: string;
};

type SpotOrderItem = {
    id: string;
    instId: string;
    side: "buy" | "sell";
    ordType: "limit" | "market";
    status: string;
    sz: number;
    px: number | null;
    filledBase: number;
    filledQuote: number;
    avgPx: number | null;
    createdAt: string;
};

type Paginated<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

export default function ProTradingPage() {
    const [selectedPair, setSelectedPair] = useState(PAIRS[0].id);
    const pair = useMemo(() => PAIRS.find((item) => item.id === selectedPair) ?? PAIRS[0], [selectedPair]);
    const [ticker, setTicker] = useState<SpotTicker | null>(null);
    const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
    const [trades, setTrades] = useState<SpotTrade[]>([]);
    const [candles, setCandles] = useState<SpotCandle[]>([]);
    const [timeframe, setTimeframe] = useState<Timeframe>("1h");
    const [spotBalances, setSpotBalances] = useState<SpotBalance[]>([]);
    const [walletUsdt, setWalletUsdt] = useState(0);
    const [proUsdt, setProUsdt] = useState(0);
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferDirection, setTransferDirection] = useState<"toPro" | "toWallet">("toPro");
    const [transferAmount, setTransferAmount] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);
    const [transferHistory, setTransferHistory] = useState<SpotTransferItem[]>([]);
    const [orderHistory, setOrderHistory] = useState<SpotOrderItem[]>([]);
    const [transferPage, setTransferPage] = useState(1);
    const [transferHasNext, setTransferHasNext] = useState(false);
    const [transferHasPrev, setTransferHasPrev] = useState(false);
    const [orderPage, setOrderPage] = useState(1);
    const [orderHasNext, setOrderHasNext] = useState(false);
    const [orderHasPrev, setOrderHasPrev] = useState(false);
    const [orderFilterPair, setOrderFilterPair] = useState<string>("all");
    const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");
    const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
    const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState<"limit" | "market">("limit");
    const [priceInput, setPriceInput] = useState(formatNumber(pair.price, pair.priceDecimals));
    const [amountInput, setAmountInput] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        setPriceInput(formatNumber(pair.price, pair.priceDecimals));
        setAmountInput("");
        setTicker(null);
        setOrderBook(null);
        setTrades([]);
        setCandles([]);
    }, [pair]);

    const refreshBalances = async () => {
        try {
            const [spotRes, walletRes] = await Promise.all([
                http.get<SpotBalance[]>("/okx/spot/balances"),
                http.get<WalletItem[]>("/wallet/usdt"),
            ]);
            const spot = spotRes.data || [];
            const walletItems = walletRes.data || [];
            const walletTotal = walletItems.reduce((sum, item) => sum + Number(item.balance || 0), 0);
            const usdtSpot = spot.find((b) => b.currency === "USDT");
            setSpotBalances(spot);
            setWalletUsdt(walletTotal);
            setProUsdt(usdtSpot ? Number(usdtSpot.available) : 0);
        } catch {
            setSpotBalances([]);
            setWalletUsdt(0);
            setProUsdt(0);
        }
    };

    const refreshHistory = async () => {
        try {
            const [transferRes, orderRes] = await Promise.all([
                http.get<Paginated<SpotTransferItem>>("/okx/spot/transfers", {
                    params: { page: transferPage, limit: 8 },
                }),
                http.get<Paginated<SpotOrderItem>>("/okx/spot/orders", {
                    params: {
                        page: orderPage,
                        limit: 8,
                        instId: orderFilterPair === "all" ? undefined : orderFilterPair,
                        status: orderFilterStatus === "all" ? undefined : orderFilterStatus,
                    },
                }),
            ]);
            setTransferHistory(transferRes.data.data || []);
            setTransferHasNext(transferRes.data.hasNext);
            setTransferHasPrev(transferRes.data.hasPrev);
            setOrderHistory(orderRes.data.data || []);
            setOrderHasNext(orderRes.data.hasNext);
            setOrderHasPrev(orderRes.data.hasPrev);
        } catch {
            setTransferHistory([]);
            setOrderHistory([]);
            setTransferHasNext(false);
            setTransferHasPrev(false);
            setOrderHasNext(false);
            setOrderHasPrev(false);
        }
    };

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!active) return;
            await refreshBalances();
        };
        load();
        const interval = setInterval(load, 7000);
        return () => {
            active = false;
            clearInterval(interval);
        };
         
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!active) return;
            await refreshHistory();
        };
        load();
        const interval = setInterval(load, 12000);
        return () => {
            active = false;
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transferPage, orderPage, orderFilterPair, orderFilterStatus]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await http.get<SpotTicker>("/okx/spot/ticker", {
                    params: { instId: selectedPair },
                });
                if (active) setTicker(res.data);
            } catch {
                if (active) setTicker(null);
            }
        };
        load();
        const interval = setInterval(load, 2000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [selectedPair]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await http.get<OrderBook>("/okx/spot/orderbook", {
                    params: { instId: selectedPair, depth: 5 },
                });
                if (active) setOrderBook(res.data);
            } catch {
                if (active) setOrderBook(null);
            }
        };
        load();
        const interval = setInterval(load, 2000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [selectedPair]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await http.get<TradesResponse>("/okx/spot/trades", {
                    params: { instId: selectedPair, limit: 20 },
                });
                if (active) setTrades(res.data.trades || []);
            } catch {
                if (active) setTrades([]);
            }
        };
        load();
        const interval = setInterval(load, 2500);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [selectedPair]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const res = await http.get<CandlesResponse>("/okx/spot/candles", {
                    params: { instId: selectedPair, bar: BAR_MAP[timeframe], limit: 60 },
                });
                if (active) setCandles(res.data.candles || []);
            } catch {
                if (active) setCandles([]);
            }
        };
        load();
        const interval = setInterval(load, 20000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [selectedPair, timeframe]);

    const lastPrice = ticker?.last ?? pair.price;
    const change = ticker?.changePct ?? pair.change;
    const high24h = ticker?.high24h ?? lastPrice * 1.02;
    const low24h = ticker?.low24h ?? lastPrice * 0.98;
    const vol24h = ticker?.vol24h ?? lastPrice * 1800;

    const candleSeries = useMemo(() => {
        return [...candles].sort((a, b) => a.ts - b.ts);
    }, [candles]);

    const chartPoints = useMemo(() => {
        if (candleSeries.length >= 2) {
            return candleSeries.map((candle) => candle.close);
        }
        return Array.from({ length: 30 }).map((_, idx) => lastPrice * (1 + Math.sin(idx / 4) * 0.002));
    }, [candleSeries, lastPrice]);

    const chartPath = useMemo(() => {
        if (chartPoints.length < 2) return "M0,50 L100,50";
        const min = Math.min(...chartPoints);
        const max = Math.max(...chartPoints);
        const range = max - min || 1;
        return chartPoints
            .map((point, index) => {
                const x = (index / (chartPoints.length - 1)) * 100;
                const y = 100 - ((point - min) / range) * 100;
                return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(" ");
    }, [chartPoints]);

    const depth = useMemo(() => {
        const asksRaw = orderBook?.asks ?? [];
        const bidsRaw = orderBook?.bids ?? [];
        const asks = asksRaw.slice(0, 5).map((row) => ({
            price: row.price,
            size: row.size,
            total: row.price * row.size,
        }));
        const bids = bidsRaw.slice(0, 5).map((row) => ({
            price: row.price,
            size: row.size,
            total: row.price * row.size,
        }));
        const maxSize = Math.max(
            1,
            ...asks.map((row) => row.size),
            ...bids.map((row) => row.size)
        );
        return { asks, bids, maxSize };
    }, [orderBook]);

    const balanceMap = useMemo(() => {
        return spotBalances.reduce<Record<string, number>>((acc, item) => {
            acc[item.currency] = Number(item.available || 0);
            return acc;
        }, {});
    }, [spotBalances]);

    const availableBase = balanceMap[pair.base] ?? 0;
    const availableQuote = balanceMap[pair.quote] ?? 0;

    const displayTrades = useMemo(() => {
        return trades.slice(0, 12).map((trade) => ({
            ...trade,
            time: new Date(trade.ts).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
        }));
    }, [trades]);

    const isPositive = change >= 0;
    const priceValue = orderType === "market" ? lastPrice : toNumber(priceInput) || lastPrice;
    const amountValue = toNumber(amountInput);
    const totalValue = priceValue * amountValue;
    const feeValue = totalValue * PRO_FEE_RATE;
    const feeRateLabel = (PRO_FEE_RATE * 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const netValue = orderSide === "buy" ? totalValue + feeValue : Math.max(0, totalValue - feeValue);
    const canSubmit = amountValue > 0 && (orderType === "market" || priceValue > 0) && !placingOrder;

    const handlePlaceOrder = async () => {
        if (!canSubmit) return;
        setPlacingOrder(true);
        try {
            const payload: {
                instId: string;
                side: "buy" | "sell";
                ordType: "limit" | "market";
                sz: string | number;
                px?: string | number;
                tgtCcy?: "base_ccy" | "quote_ccy";
            } = {
                instId: selectedPair,
                side: orderSide,
                ordType: orderType,
                sz: amountValue.toString(),
            };
            if (orderType === "limit") {
                payload.px = priceValue.toString();
            }
            if (orderType === "market" && orderSide === "buy") {
                payload.tgtCcy = "base_ccy";
            }
            const res = await http.post("/okx/spot/order", payload);
            const ordId = res.data?.data?.[0]?.ordId || res.data?.data?.[0]?.sCode;
            toast.success("Ordem enviada", {
                description: ordId ? `ID: ${ordId}` : `Par: ${selectedPair}`,
            });
            setAmountInput("");
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error("Não foi possível enviar a ordem", {
                description: msg || "Tente novamente em instantes",
            });
        } finally {
            setPlacingOrder(false);
        }
    };

    const openTransfer = (direction: "toPro" | "toWallet") => {
        setTransferDirection(direction);
        setTransferAmount("");
        setTransferOpen(true);
    };

    useEffect(() => {
        setOrderPage(1);
    }, [orderFilterPair, orderFilterStatus]);

    const formatDateTime = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCancelOrder = async (orderId: string) => {
        setCancelingOrderId(orderId);
        try {
            await http.post("/okx/spot/cancel-order", { orderId });
            await Promise.all([refreshHistory(), refreshBalances()]);
            toast.success("Ordem cancelada");
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error("Não foi possível cancelar", {
                description: msg || "Tente novamente",
            });
        } finally {
            setCancelingOrderId(null);
        }
    };

    const handleTransfer = async () => {
        const amount = toNumber(transferAmount);
        if (!amount || amount <= 0) {
            toast.error("Informe um valor válido");
            return;
        }
        if (transferDirection === "toPro" && amount > walletUsdt) {
            toast.error("Saldo insuficiente na carteira");
            return;
        }
        if (transferDirection === "toWallet" && amount > proUsdt) {
            toast.error("Saldo insuficiente no PRO");
            return;
        }
        setTransferLoading(true);
        try {
            const endpoint = transferDirection === "toPro"
                ? "/okx/spot/transfer-to-pro"
                : "/okx/spot/transfer-to-wallet";
            await http.post(endpoint, { amount });
            await Promise.all([refreshBalances(), refreshHistory()]);
            toast.success("Transferência concluída");
            setTransferOpen(false);
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error("Não foi possível transferir", {
                description: msg || "Tente novamente em instantes",
            });
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="pro-trading pb-28">
            <motion.div variants={fadeUp} className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                    <Link
                        href="/customer/dashboard"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[18px] font-bold text-white">PRO</span>
                            <span className="text-[11px] font-semibold text-white">Spot</span>
                        </div>
                        <p className="text-[12px] text-white">Trading com livro de ofertas</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/10 border border-white/10">
                    <span className="text-[11px] font-semibold text-white/80">PRO</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                {PAIRS.map((item) => {
                    const active = item.id === selectedPair;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setSelectedPair(item.id)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all",
                                active
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white/8 text-white border-white/10"
                            )}
                        >
                            {item.base}/{item.quote}
                        </button>
                    );
                })}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 rounded-3xl fintech-glass-card p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[12px] text-white">Carteira USDT</p>
                        <p className="text-[18px] font-semibold text-white tabular-nums">
                            {formatNumber(walletUsdt, 4)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openTransfer("toPro")}
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-white bg-white/10 border border-white/10"
                    >
                        Transferir para PRO
                    </button>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <div>
                        <p className="text-[12px] text-white">Saldo PRO (USDT)</p>
                        <p className="text-[18px] font-semibold text-white tabular-nums">
                            {formatNumber(proUsdt, 4)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openTransfer("toWallet")}
                        className="px-3.5 py-2 rounded-full text-[11px] font-semibold text-white bg-white/10 border border-white/10"
                    >
                        Transferir para carteira
                    </button>
                </div>
                <p className="text-[10px] text-white mt-2">
                    Transferências usam USDT (Solana/Tron). BTC/ETH/XRP são apenas para trading.
                </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 rounded-3xl fintech-glass-card p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-white">Saldos PRO</h3>
                    <span className="text-[11px] text-white">Disponível / Bloqueado</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {ASSETS.map((asset) => {
                        const balance = spotBalances.find((item) => item.currency === asset);
                        const available = balance ? Number(balance.available) : 0;
                        const locked = balance ? Number(balance.locked) : 0;
                        return (
                            <div
                                key={asset}
                                className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2"
                            >
                                <p className="text-[12px] font-semibold text-white">{asset}</p>
                                <p className="text-[11px] text-white tabular-nums">
                                    {formatNumber(available, 4)} / {formatNumber(locked, 4)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 rounded-3xl fintech-glass-card p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[13px] text-white">Preço atual</p>
                        <p className="text-[26px] font-bold text-white tabular-nums">
                            {formatNumber(lastPrice, pair.priceDecimals)}
                            <span className="text-[13px] font-semibold text-white ml-1">USDT</span>
                        </p>
                    </div>
                    <div
                        className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-semibold",
                            isPositive ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                        )}
                    >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? "+" : ""}{change.toFixed(2)}%
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-white">
                    <span>24h Máxima</span>
                    <span>24h Mínima</span>
                    <span>Volume</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[12px] text-white/90 font-semibold">
                    <span>{formatNumber(high24h, pair.priceDecimals)}</span>
                    <span>{formatNumber(low24h, pair.priceDecimals)}</span>
                    <span>{formatCompact(vol24h)}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 overflow-x-auto">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={cn(
                                "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                                tf === timeframe
                                    ? "bg-white/15 text-white border-white/20"
                                    : "bg-white/5 text-white border-white/10"
                            )}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                <div className="mt-4 h-36 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <linearGradient id="pro-chart" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#6F00FF" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#6F00FF" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={`${chartPath} L 100 100 L 0 100 Z`} fill="url(#pro-chart)" />
                        <path d={chartPath} fill="none" stroke="#6F00FF" strokeWidth="1.6" />
                    </svg>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-3xl fintech-glass-card p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-white">Livro de ofertas</h3>
                        <div className="flex items-center gap-1 text-[11px] text-white">
                            5 níveis
                            <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-[1.1fr_1fr_1fr] text-[11px] text-white">
                        <span>Preço</span>
                        <span>Qtd</span>
                        <span className="text-right">Total</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        {depth.asks.map((row) => (
                            <div key={`ask-${row.price}`} className="relative grid grid-cols-[1.1fr_1fr_1fr] text-[11px] font-medium">
                                <div
                                    className="absolute inset-y-0 right-0 bg-rose-500/10"
                                    style={{ width: `${(row.size / depth.maxSize) * 100}%` }}
                                />
                                <span className="relative text-rose-300 tabular-nums">
                                    {formatNumber(row.price, pair.priceDecimals)}
                                </span>
                                <span className="relative text-white/80 tabular-nums">
                                    {formatNumber(row.size, pair.qtyDecimals)}
                                </span>
                                <span className="relative text-white tabular-nums text-right">
                                    {formatNumber(row.total, pair.priceDecimals)}
                                </span>
                            </div>
                        ))}
                        <div className="py-2 text-center text-[12px] font-semibold text-white">
                            {formatNumber(lastPrice, pair.priceDecimals)}
                            <span className="text-[11px] text-white ml-1">USDT</span>
                        </div>
                        {depth.bids.map((row) => (
                            <div key={`bid-${row.price}`} className="relative grid grid-cols-[1.1fr_1fr_1fr] text-[11px] font-medium">
                                <div
                                    className="absolute inset-y-0 right-0 bg-emerald-500/10"
                                    style={{ width: `${(row.size / depth.maxSize) * 100}%` }}
                                />
                                <span className="relative text-emerald-300 tabular-nums">
                                    {formatNumber(row.price, pair.priceDecimals)}
                                </span>
                                <span className="relative text-white/80 tabular-nums">
                                    {formatNumber(row.size, pair.qtyDecimals)}
                                </span>
                                <span className="relative text-white tabular-nums text-right">
                                    {formatNumber(row.total, pair.priceDecimals)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl fintech-glass-card p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-white">Negócios</h3>
                        <span className="text-[11px] text-white">Atualizações</span>
                    </div>
                    <div className="mt-3 grid grid-cols-[1.2fr_1fr_1fr] text-[11px] text-white">
                        <span>Preço</span>
                        <span>Qtd</span>
                        <span className="text-right">Hora</span>
                    </div>
                    <div className="mt-2 space-y-1">
                        {displayTrades.map((trade, index) => (
                            <div key={`${trade.time}-${index}`} className="grid grid-cols-[1.2fr_1fr_1fr] text-[11px] font-medium">
                                <span
                                    className={cn(
                                        "tabular-nums",
                                        trade.side === "buy" ? "text-emerald-300" : "text-rose-300"
                                    )}
                                >
                                    {formatNumber(trade.price, pair.priceDecimals)}
                                </span>
                                <span className="text-white/80 tabular-nums">
                                    {formatNumber(trade.size, pair.qtyDecimals)}
                                </span>
                                <span className="text-white tabular-nums text-right">
                                    {trade.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 rounded-3xl fintech-glass-card p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-white">Nova ordem</h3>
                    <span className="text-[11px] text-white">Conta de trading</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <ToggleGroup
                        type="single"
                        value={orderSide}
                        onValueChange={(value) => value && setOrderSide(value as "buy" | "sell")}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                    >
                        <ToggleGroupItem
                            value="buy"
                            className="flex-1 text-[12px] font-semibold text-white data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-200"
                        >
                            Comprar
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="sell"
                            className="flex-1 text-[12px] font-semibold text-white data-[state=on]:bg-rose-500/20 data-[state=on]:text-rose-200"
                        >
                            Vender
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <ToggleGroup
                        type="single"
                        value={orderType}
                        onValueChange={(value) => value && setOrderType(value as "limit" | "market")}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                    >
                        <ToggleGroupItem
                            value="limit"
                            className="flex-1 text-[12px] font-semibold text-white data-[state=on]:bg-white/20"
                        >
                            Limite
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="market"
                            className="flex-1 text-[12px] font-semibold text-white data-[state=on]:bg-white/20"
                        >
                            Mercado
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <Label className="text-[12px] text-white">Preço (USDT)</Label>
                        <Input
                            value={orderType === "market" ? formatNumber(lastPrice, pair.priceDecimals) : priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            disabled={orderType === "market"}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[12px] text-white">Quantidade ({pair.base})</Label>
                        <Input
                            value={amountInput}
                            onChange={(e) => setAmountInput(e.target.value)}
                            placeholder={`0.00 ${pair.base}`}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white">
                        <span>Disponível</span>
                        <span className="text-white/80 font-semibold tabular-nums">
                            {orderSide === "buy"
                                ? `${formatNumber(availableQuote, 4)} USDT`
                                : `${formatNumber(availableBase, pair.qtyDecimals)} ${pair.base}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-white">
                        <span>Total estimado</span>
                        <span className="text-white/90 font-semibold tabular-nums">
                            {amountValue > 0 ? formatNumber(totalValue, pair.priceDecimals) : "0,00"} USDT
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-white">
                        <span>Taxa PRO ({feeRateLabel}%)</span>
                        <span className="text-white/80 font-semibold tabular-nums">
                            {amountValue > 0 ? formatNumber(feeValue, pair.priceDecimals) : "0,00"} USDT
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-white/80">
                        <span>{orderSide === "buy" ? "Total com taxa" : "Recebe líquido"}</span>
                        <span className="text-white font-semibold tabular-nums">
                            {amountValue > 0 ? formatNumber(netValue, pair.priceDecimals) : "0,00"} USDT
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={!canSubmit}
                        className={cn(
                            "w-full py-3 rounded-2xl text-[14px] font-semibold text-white transition-all",
                            orderSide === "buy"
                                ? "bg-emerald-500/80 hover:bg-emerald-500"
                                : "bg-rose-500/80 hover:bg-rose-500",
                            !canSubmit && "opacity-60"
                        )}
                    >
                        {placingOrder ? "Enviando..." : `${orderSide === "buy" ? "Comprar" : "Vender"} ${pair.base}`}
                    </button>
                    <p className="text-[11px] text-white text-center">
                        Ordens spot e limite do seu portfólio PRO
                    </p>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-3xl fintech-glass-card p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-white">Transferências PRO</h3>
                        <span className="text-[11px] text-white">USDT</span>
                    </div>
                    <div className="mt-3 space-y-2">
                        {transferHistory.length === 0 ? (
                            <p className="text-[12px] text-white">Sem transferências</p>
                        ) : (
                            transferHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3 py-2"
                                >
                                    <div>
                                        <p className="text-[12px] font-semibold text-white">
                                            {item.direction === "TO_PRO" ? "Para PRO" : "Para carteira"}
                                        </p>
                                        <p className="text-[10px] text-white">
                                            {item.network ? `${item.network} • ` : ""}{formatDateTime(item.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-semibold text-white tabular-nums">
                                            {formatNumber(item.amount, 4)} USDT
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setTransferPage((prev) => Math.max(1, prev - 1))}
                            disabled={!transferHasPrev}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[11px] font-semibold border",
                                transferHasPrev
                                    ? "bg-white/10 text-white border-white/10"
                                    : "bg-white/5 text-white border-white/5"
                            )}
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            onClick={() => setTransferPage((prev) => prev + 1)}
                            disabled={!transferHasNext}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[11px] font-semibold border",
                                transferHasNext
                                    ? "bg-white/10 text-white border-white/10"
                                    : "bg-white/5 text-white border-white/5"
                            )}
                        >
                            Próxima
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl fintech-glass-card p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-white">Ordens PRO</h3>
                        <span className="text-[11px] text-white">Histórico</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <Select value={orderFilterPair} onValueChange={setOrderFilterPair}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white text-[11px] h-8">
                                <SelectValue placeholder="Par" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0b1a] border-white/10 text-white">
                                <SelectItem value="all">Todos</SelectItem>
                                {PAIRS.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.base}/{item.quote}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={orderFilterStatus} onValueChange={setOrderFilterStatus}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white text-[11px] h-8">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0b1a] border-white/10 text-white">
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="OPEN">Aberta</SelectItem>
                                <SelectItem value="PARTIAL">Parcial</SelectItem>
                                <SelectItem value="FILLED">Executada</SelectItem>
                                <SelectItem value="CANCELED">Cancelada</SelectItem>
                                <SelectItem value="FAILED">Falhou</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-3 space-y-2">
                        {orderHistory.length === 0 ? (
                            <p className="text-[12px] text-white">Sem ordens</p>
                        ) : (
                            orderHistory.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3 py-2"
                                >
                                    <div>
                                        <p className="text-[12px] font-semibold text-white">
                                            {order.side === "buy" ? "Compra" : "Venda"} {order.instId.replace("-", "/")}
                                        </p>
                                        <p className="text-[10px] text-white">
                                            {order.ordType === "limit" ? "Limite" : "Mercado"} • {order.status} • {formatDateTime(order.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-[12px] font-semibold text-white tabular-nums">
                                                {formatNumber(order.sz, 4)} {order.instId.split("-")[0]}
                                            </p>
                                            <p className="text-[10px] text-white tabular-nums">
                                                {order.avgPx ? `${formatNumber(order.avgPx, 4)} USDT` : order.px ? `${formatNumber(order.px, 4)} USDT` : "—"}
                                            </p>
                                        </div>
                                        {order.ordType === "limit" && (order.status === "OPEN" || order.status === "PARTIAL") ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancelingOrderId === order.id}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                                                    cancelingOrderId === order.id
                                                        ? "bg-white/10 text-white border-white/10"
                                                        : "bg-rose-500/20 text-rose-200 border-rose-500/30"
                                                )}
                                            >
                                                {cancelingOrderId === order.id ? "Cancelando..." : "Cancelar"}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                            disabled={!orderHasPrev}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[11px] font-semibold border",
                                orderHasPrev
                                    ? "bg-white/10 text-white border-white/10"
                                    : "bg-white/5 text-white border-white/5"
                            )}
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            onClick={() => setOrderPage((prev) => prev + 1)}
                            disabled={!orderHasNext}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[11px] font-semibold border",
                                orderHasNext
                                    ? "bg-white/10 text-white border-white/10"
                                    : "bg-white/5 text-white border-white/5"
                            )}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </motion.div>

            <BottomSheet open={transferOpen} onOpenChange={setTransferOpen}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>
                            {transferDirection === "toPro" ? "Transferir para PRO" : "Transferir para carteira"}
                        </BottomSheetTitle>
                        <BottomSheetDescription>
                            {transferDirection === "toPro"
                                ? "Mover USDT da sua carteira para o saldo PRO."
                                : "Mover USDT do saldo PRO para a carteira."}
                        </BottomSheetDescription>
                    </BottomSheetHeader>
                    <div className="px-5 pb-6 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[12px] text-foreground/70">Valor em USDT</Label>
                            <Input
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="0.00"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="flex items-center justify-between text-[12px] text-white">
                            <span>Disponível</span>
                            <span className="text-white/90 font-semibold tabular-nums">
                                {transferDirection === "toPro"
                                    ? `${formatNumber(walletUsdt, 4)} USDT`
                                    : `${formatNumber(proUsdt, 4)} USDT`}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleTransfer}
                            disabled={transferLoading}
                            className={cn(
                                "w-full py-3 rounded-2xl text-[14px] font-semibold text-white transition-all",
                                transferDirection === "toPro"
                                    ? "bg-primary/80 hover:bg-primary"
                                    : "bg-white/20 hover:bg-white/30",
                                transferLoading && "opacity-60"
                            )}
                        >
                            {transferLoading ? "Transferindo..." : "Confirmar transferência"}
                        </button>
                    </div>
                </BottomSheetContent>
            </BottomSheet>
        </motion.div>
    );
}
