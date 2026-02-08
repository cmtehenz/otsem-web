"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, TrendingUp, Shield, Zap, Check, ArrowLeft, LogIn, UserPlus, Repeat, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const BrazilFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="14" rx="1" fill="#009B3A" />
    <path d="M10 1.5L18.5 7L10 12.5L1.5 7L10 1.5Z" fill="#FEDF00" />
    <circle cx="10" cy="7" r="3.5" fill="#002776" />
    <path d="M7 6.2C8.2 5.5 11.8 5.5 13 6.2" stroke="white" strokeWidth="0.5" fill="none" />
  </svg>
);

const ExchangeWidget = () => {
  const [amount, setAmount] = useState("1000");
  const [buyRate, setBuyRate] = useState<number | null>(null);
  const [sellRate, setSellRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const prevRateRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch rate from OKX via public quote API — visibility-aware to save
  // battery and bandwidth when the tab/page is not visible.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    const fetchRate = async () => {
      try {
        const response = await fetch(`/api/public/quote`);
        const data = await response.json();
        if (data.buyRate && data.sellRate) {
          prevRateRef.current = data.buyRate;
          setBuyRate(data.buyRate);
          setSellRate(data.sellRate);
          setCountdown(30);
        }
      } catch (error) {
        console.error("Failed to fetch quote:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const startPolling = () => {
      if (interval) return; // Already running
      fetchRate();
      interval = setInterval(fetchRate, 30000); // Poll every 30s instead of 15s
      countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
    };

    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = null; }
      if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const numericAmount = parseFloat(amount) || 0;
  const rate = direction === "buy" ? buyRate : sellRate;
  const convertedAmount = rate ? (direction === "buy" ? numericAmount / rate : numericAmount * rate) : 0;

  const formatBRL = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-numeric characters except dots and commas
    const cleaned = value.replace(/[^\d.,]/g, '');

    // Replace comma with dot for decimal
    const normalized = cleaned.replace(',', '.');

    // Ensure only one decimal point
    const parts = normalized.split('.');
    if (parts.length > 2) {
      return; // Ignore if more than one decimal point
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    // Limit total length to prevent huge numbers
    if (normalized.replace('.', '').length > 12) {
      return;
    }

    setAmount(normalized);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === "buy" ? "sell" : "buy");
  };

  const handleConvert = () => {
    if (!rate) return;
    if (user) {
      // User is logged in - redirect to dashboard with exchange parameters
      const params = new URLSearchParams({
        action: 'convert',
        direction: direction,
        amount: numericAmount.toString(),
        rate: rate.toString(),
      });
      router.push(`/customer/dashboard?${params.toString()}`);
    } else {
      // User is not logged in - show auth screen
      setShowAuthScreen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="relative">
        {/* Main card */}
        <div className="relative bg-white rounded-[28px] overflow-hidden shadow-[0_8px_40px_-8px_rgba(111,0,255,0.12),0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200/60">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F00FF]/[0.02] via-transparent to-emerald-400/[0.02] pointer-events-none" />

          <div className="relative p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Câmbio Instantâneo</h3>
                    <p className="text-xs text-slate-400 font-medium">Cotação em tempo real</p>
                  </div>
                </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">
                  {isLoading ? "..." : "LIVE"}
                </span>
              </div>
            </div>

            {/* Exchange rate banner with countdown */}
            <div className="flex items-center justify-between px-4 py-3 mb-5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-500 font-medium">
                  1 USDT = <span className="text-slate-900 font-bold">{rate != null ? `R$ ${rate.toFixed(2)}` : "..."}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold">{countdown}s</span>
              </div>
            </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={direction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Input section - You send */}
                  <div className="relative bg-slate-50 rounded-3xl p-5 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Você envia</span>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
                        {direction === "buy" ? (
                          <>
                            <BrazilFlag className="w-5 h-3.5 rounded" />
                            <span className="text-sm font-bold text-slate-800">BRL</span>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">₮</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">USDT</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-3xl font-semibold">
                        {direction === "buy" ? "R$" : ""}
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-transparent text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Swap button */}
                  <div className="flex justify-center -my-5 relative z-10">
                    <button
                      onClick={toggleDirection}
                      className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/25 border-4 border-white transition-transform duration-150 hover:scale-105 active:scale-95"
                    >
                      <ArrowDownUp className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Output section - You receive */}
                  <div className="relative bg-slate-50 rounded-3xl p-5 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Você recebe</span>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm">
                        {direction === "buy" ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">₮</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">USDT</span>
                          </>
                        ) : (
                          <>
                            <BrazilFlag className="w-5 h-3.5 rounded" />
                            <span className="text-sm font-bold text-slate-800">BRL</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {direction === "sell" && <span className="text-slate-300 text-3xl font-semibold">R$</span>}
                      <span className="text-4xl font-bold text-slate-900">
                        {isLoading ? "..." : formatBRL(convertedAmount)}
                      </span>
                      <span className="text-slate-400 font-semibold text-lg">
                        {direction === "buy" ? "USDT" : ""}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              <button
                onClick={handleConvert}
                className="w-full mt-6 py-4 text-base rounded-2xl bg-primary hover:bg-[#5800CC] text-white font-bold flex items-center justify-center gap-2.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25"
              >
                <span>Converter Agora</span>
              </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-200/60">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-xs text-slate-500 font-medium">100% Seguro</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Taxa:</span>
                <span className="text-xs text-primary font-bold bg-primary/8 px-2 py-0.5 rounded-md">0.98%</span>
              </div>
            </div>
          </div>

          {/* Auth Screen Overlay */}
          <AnimatePresence>
            {showAuthScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-[28px] overflow-hidden z-30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6F00FF]/[0.03] via-transparent to-emerald-400/[0.02] pointer-events-none" />

                <div className="relative p-6 sm:p-7 h-full flex flex-col">
                  {/* Back button */}
                  <button
                    onClick={() => setShowAuthScreen(false)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors mb-6 self-start"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Voltar</span>
                  </button>

                  {/* Auth content */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
                        <Repeat className="w-8 h-8 text-white" />
                      </div>

                    <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                      Acesse sua conta
                    </h3>

                    <p className="text-sm text-slate-500 text-center mb-8 max-w-[260px]">
                      Para continuar com sua conversão, faça login ou crie uma conta
                    </p>

                    {/* Auth buttons */}
                    <div className="w-full space-y-3">
                      <Link href="/login" className="block">
                        <button className="w-full py-4 text-base rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 hover:bg-[#5800CC] transition-all active:scale-[0.98]">
                          <LogIn className="w-5 h-5" />
                          <span>Entrar</span>
                        </button>
                      </Link>

                      <Link href="/register" className="block">
                        <button className="w-full py-4 bg-slate-50 border-2 border-slate-200 text-slate-700 text-base font-bold rounded-2xl flex items-center justify-center gap-2.5 hover:border-slate-300 hover:bg-slate-100 transition-all duration-150 active:scale-[0.98]">
                          <UserPlus className="w-5 h-5" />
                          <span>Criar Conta</span>
                        </button>
                      </Link>
                    </div>

                    {/* Conversion summary */}
                    <div className="mt-8 w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Sua conversão:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {direction === "buy" ? "R$" : ""}{formatBRL(numericAmount)} {direction === "sell" ? "USDT" : ""}
                          </span>
                          <span className="text-slate-300">→</span>
                          <span className="font-bold text-primary">
                            {direction === "sell" ? "R$" : ""}{formatBRL(convertedAmount)} {direction === "buy" ? "USDT" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
