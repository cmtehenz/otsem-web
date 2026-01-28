"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, Sparkles, TrendingUp, Shield, Zap, Check, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

const ExchangeWidget = () => {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(6.01);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [showRateUpdate, setShowRateUpdate] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const prevRateRef = useRef(rate);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch("https://www.okx.com/api/v5/market/ticker?instId=USDT-BRL");
        const data = await response.json();
        if (data.code === "0" && data.data?.[0]?.last) {
          const baseRate = parseFloat(data.data[0].last);
          const newRate = baseRate * 1.0098;
          if (Math.abs(newRate - prevRateRef.current) > 0.01) {
            setShowRateUpdate(true);
            setTimeout(() => setShowRateUpdate(false), 2000);
          }
          prevRateRef.current = newRate;
          setRate(newRate);
        }
      } catch (error) {
        console.error("Failed to fetch OKX rate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 10000);
    return () => clearInterval(interval);
  }, []);

  const numericAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const convertedAmount = direction === "buy" ? numericAmount / rate : numericAmount * rate;

  const formatBRL = (value: string) => {
    const num = value.replace(/[^\d]/g, "");
    if (!num) return "";
    const formatted = (parseInt(num) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    if (raw.length <= 10) {
      setAmount(raw ? (parseInt(raw) / 100).toString() : "");
    }
  };

  const toggleDirection = () => {
    setDirection(prev => prev === "buy" ? "sell" : "buy");
    setIsAnimating(true);
  };

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [amount, direction]);

  const presetAmounts = [500, 1000, 2500, 5000];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="relative">
        {/* Outer glow effects */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/40 via-violet-500/30 to-emerald-400/20 rounded-[32px] blur-2xl opacity-50" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-[30px] opacity-80" />
        
        {/* Main card */}
        <div className="relative bg-white rounded-[28px] overflow-hidden shadow-2xl shadow-primary/10 border border-slate-100">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-primary/[0.02] pointer-events-none" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/8 to-violet-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/8 to-primary/5 blur-3xl rounded-full -translate-x-10 translate-y-10 pointer-events-none" />
          
          <div className="relative p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Câmbio Instantâneo</h3>
                  <p className="text-xs text-slate-500 font-medium">Cotação em tempo real</p>
                </div>
              </div>
              <motion.div 
                animate={showRateUpdate ? { scale: [1, 1.1, 1] } : {}}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100"
              >
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-500" 
                />
                <span className="text-xs font-bold text-emerald-600">
                  {isLoading ? "..." : "LIVE"}
                </span>
              </motion.div>
            </div>

            {/* Exchange rate banner */}
            <motion.div 
              animate={showRateUpdate ? { scale: [1, 1.02, 1] } : {}}
              className="flex items-center justify-between px-4 py-3 mb-5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-600 font-medium">
                  1 USDT = <span className="text-slate-900 font-bold">R$ {rate.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Zap className="w-3.5 h-3.5" />
                <span>~30s</span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={direction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Input section - You send */}
                <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-3xl p-5 border border-slate-100 mb-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Você envia</span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      {direction === "buy" ? (
                        <>
                          <img src="https://flagcdn.com/w40/br.png" alt="BR" className="w-5 h-3.5 rounded object-cover" />
                          <span className="text-sm font-bold text-slate-700">BRL</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">₮</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700">USDT</span>
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
                      value={formatBRL((numericAmount * 100).toString())}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      className="w-full bg-transparent text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
                    />
                  </div>

                  {/* Preset amounts */}
                  <div className="flex gap-2 mt-4">
                    {presetAmounts.map((preset) => (
                      <motion.button
                        key={preset}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAmount(preset.toString())}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                          numericAmount === preset
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "bg-white text-slate-500 border border-slate-200 hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        {direction === "buy" ? `R$${preset}` : preset}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDirection}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white"
                  >
                    <ArrowDownUp className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* Output section - You receive */}
                <div className="relative bg-gradient-to-br from-primary/[0.04] to-violet-500/[0.03] rounded-3xl p-5 border border-primary/15 mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary/50 uppercase tracking-wider">Você recebe</span>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm">
                      {direction === "buy" ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">₮</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700">USDT</span>
                        </>
                      ) : (
                        <>
                          <img src="https://flagcdn.com/w40/br.png" alt="BR" className="w-5 h-3.5 rounded object-cover" />
                          <span className="text-sm font-bold text-slate-700">BRL</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <motion.div
                    animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-baseline gap-2"
                  >
                    {direction === "sell" && <span className="text-slate-300 text-3xl font-semibold">R$</span>}
                    <span className="text-4xl font-bold text-slate-900">
                      {convertedAmount.toLocaleString(direction === "buy" ? "en-US" : "pt-BR", { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                    <span className="text-slate-400 font-semibold text-lg">
                      {direction === "buy" ? "USDT" : ""}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-primary via-violet-600 to-primary bg-[length:200%_100%] text-white text-base font-bold rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-2.5 relative overflow-hidden group"
            >
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
              />
              <Sparkles className="w-5 h-5" />
              <span>Converter Agora</span>
            </motion.button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-xs text-slate-500 font-medium">100% Seguro</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Taxa:</span>
                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">0.98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
