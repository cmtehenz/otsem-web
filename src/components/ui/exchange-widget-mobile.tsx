"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Sparkles, TrendingUp, Shield, Clock, Wallet, Home, History, User } from "lucide-react";

const ExchangeWidgetMobile = () => {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(6.01);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [showRateUpdate, setShowRateUpdate] = useState(false);
  const prevRateRef = useRef(rate);

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
    <div className="w-full h-full bg-[#0A0A0F] flex flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-20 right-0 w-48 h-48 bg-violet-600/10 blur-[80px]" />
      </div>

      <div className="relative flex-1 flex flex-col pt-12 px-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">OtsemPay</h1>
              <p className="text-[11px] text-white/40 font-medium">Câmbio Instantâneo</p>
            </div>
          </div>
          <motion.div 
            animate={showRateUpdate ? { scale: [1, 1.1, 1] } : {}}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
          >
            <motion.div 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400" 
            />
            <span className="text-[11px] font-bold text-emerald-400">
              {isLoading ? "..." : "LIVE"}
            </span>
          </motion.div>
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-white/50">
              1 USDT = <span className="text-white/90 font-semibold">R$ {rate.toFixed(2)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[11px] text-white/40">~30s</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={direction}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="relative bg-white/[0.03] rounded-3xl p-5 border border-white/[0.06] mb-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Você envia</span>
                <div className="flex items-center gap-2 bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/[0.08]">
                  {direction === "buy" ? (
                    <>
                      <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-3.5 rounded-sm object-cover" />
                      <span className="text-sm font-bold text-white/90">BRL</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">₮</span>
                      </div>
                      <span className="text-sm font-bold text-white/90">USDT</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/30 text-3xl font-medium">
                  {direction === "buy" ? "R$" : ""}
                </span>
                <input
                  type="text"
                  value={formatBRL((numericAmount * 100).toString())}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full bg-transparent text-4xl font-bold text-white outline-none placeholder:text-white/20"
                />
              </div>

              <div className="flex gap-2">
                {presetAmounts.map((preset) => (
                  <motion.button
                    key={preset}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAmount(preset.toString())}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all ${
                      numericAmount === preset
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/[0.04] text-white/50 border border-white/[0.06] active:bg-white/[0.08]"
                    }`}
                  >
                    {direction === "buy" ? `R$${preset}` : preset}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={toggleDirection}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-xl shadow-primary/40 border-4 border-[#0A0A0F]"
              >
                <ArrowUpDown className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            <div className="relative bg-gradient-to-br from-primary/[0.08] to-violet-600/[0.05] rounded-3xl p-5 border border-primary/20 mt-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-primary/60 uppercase tracking-wider">Você recebe</span>
                <div className="flex items-center gap-2 bg-white/[0.06] px-3 py-1.5 rounded-full border border-primary/20">
                  {direction === "buy" ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">₮</span>
                      </div>
                      <span className="text-sm font-bold text-white/90">USDT</span>
                    </>
                  ) : (
                    <>
                      <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-3.5 rounded-sm object-cover" />
                      <span className="text-sm font-bold text-white/90">BRL</span>
                    </>
                  )}
                </div>
              </div>
              
              <motion.div
                animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-2"
              >
                {direction === "sell" && <span className="text-white/30 text-3xl font-medium">R$</span>}
                <span className="text-4xl font-bold text-white">
                  {convertedAmount.toLocaleString(direction === "buy" ? "en-US" : "pt-BR", { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
                <span className="text-white/40 font-medium text-base">
                  {direction === "buy" ? "USDT" : ""}
                </span>
              </motion.div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full mt-5 py-4 bg-gradient-to-r from-primary via-violet-600 to-primary bg-[length:200%_100%] text-white text-base font-bold rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5 relative overflow-hidden"
            >
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <Sparkles className="w-5 h-5" />
              <span>Converter Agora</span>
            </motion.button>

            <div className="flex items-center justify-center gap-5 mt-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-white/40">100% Seguro</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/40">Taxa: <span className="text-primary font-semibold">0.98%</span></span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative bg-[#0D0D12]/90 backdrop-blur-xl border-t border-white/[0.06] px-6 py-3 pb-6">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-white/30">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <div className="relative">
              <Wallet className="w-5 h-5" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </div>
            <span className="text-[10px] font-semibold">Câmbio</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/30">
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">Histórico</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/30">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeWidgetMobile;
