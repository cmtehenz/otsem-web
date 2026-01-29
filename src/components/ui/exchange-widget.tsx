"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, TrendingUp, Shield, Zap, Check, ArrowLeft, LogIn, UserPlus, Repeat, Globe } from "lucide-react";
import Link from "next/link";

const ExchangeWidget = () => {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(6.01);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
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
    const interval = setInterval(fetchRate, 15000);
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="relative">
        {/* Simplified outer glow - static */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/30 via-primary/20 to-emerald-400/15 rounded-[32px] blur-xl opacity-40" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 rounded-[30px] opacity-70" />
        
        {/* Main card */}
        <div className="relative bg-white rounded-[28px] overflow-hidden shadow-2xl shadow-primary/10 border border-slate-100">
          {/* Static gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-primary/[0.02] pointer-events-none" />
          
          {/* Static decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/8 to-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/8 to-primary/5 blur-3xl rounded-full -translate-x-10 translate-y-10 pointer-events-none" />
          
          <div className="relative p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
<div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Globe className="w-5 h-5 text-white" />
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600">
                  {isLoading ? "..." : "LIVE"}
                </span>
              </div>
            </div>

            {/* Exchange rate banner */}
            <div className="flex items-center justify-between px-4 py-3 mb-5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-100">
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
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-3xl p-5 border border-slate-100">
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
                  </div>

                  {/* Swap button */}
                  <div className="flex justify-center -my-5 relative z-10">
                    <button
                      onClick={toggleDirection}
                      className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white transition-transform duration-150 hover:scale-105 active:scale-95"
                    >
                      <ArrowDownUp className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Output section - You receive */}
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-3xl p-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Você recebe</span>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
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
                    
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* CTA Button */}
              <button
                onClick={() => setShowAuthScreen(true)}
                className="w-full mt-6 py-4 text-base rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold flex items-center justify-center gap-2.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-400/30"
              >
                <span>Converter Agora</span>
              </button>

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

          {/* Auth Screen Overlay */}
          <AnimatePresence>
            {showAuthScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white rounded-[28px] overflow-hidden z-30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-primary/[0.02] pointer-events-none" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/8 to-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/8 to-primary/5 blur-3xl rounded-full -translate-x-10 translate-y-10 pointer-events-none" />
                
                <div className="relative p-6 sm:p-7 h-full flex flex-col">
                  {/* Back button */}
                  <button
                    onClick={() => setShowAuthScreen(false)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 self-start"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Voltar</span>
                  </button>

                  {/* Auth content */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 mb-6">
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
                        <button className="btn-premium w-full py-4 text-base rounded-2xl">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                          <LogIn className="w-5 h-5" />
                          <span>Entrar</span>
                        </button>
                      </Link>

                      <Link href="/register" className="block">
                        <button className="w-full py-4 bg-white border-2 border-primary/20 text-primary text-base font-bold rounded-2xl flex items-center justify-center gap-2.5 hover:border-primary/40 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
                          <UserPlus className="w-5 h-5" />
                          <span>Criar Conta</span>
                        </button>
                      </Link>
                    </div>

                    {/* Conversion summary */}
                    <div className="mt-8 w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Sua conversão:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">
                            {direction === "buy" ? "R$" : ""}{numericAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} {direction === "sell" ? "USDT" : ""}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-primary">
                            {direction === "sell" ? "R$" : ""}{convertedAmount.toLocaleString(direction === "buy" ? "en-US" : "pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {direction === "buy" ? "USDT" : ""}
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
