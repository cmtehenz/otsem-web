"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Sparkles, TrendingUp, Shield, Clock } from "lucide-react";

const ExchangeWidget = () => {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(6.01);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [showRateUpdate, setShowRateUpdate] = useState(false);
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
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-[340px] perspective-1000"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-primary/30 to-emerald-500/20 rounded-[28px] blur-xl opacity-60" />
        
        <div className="relative bg-[#0D0D12] rounded-[24px] overflow-hidden border border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[80px] pointer-events-none" />
          
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">OtsemPay</h3>
                  <p className="text-[10px] text-white/40">Câmbio Instantâneo</p>
                </div>
              </div>
              <motion.div 
                animate={showRateUpdate ? { scale: [1, 1.1, 1] } : {}}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400" 
                />
                <span className="text-[10px] font-semibold text-emerald-400">
                  {isLoading ? "..." : "LIVE"}
                </span>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={direction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06] mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {direction === "buy" ? "Você envia" : "Você envia"}
                    </span>
                    <div className="flex items-center gap-1.5 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">
                      {direction === "buy" ? (
                        <>
                          <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-4 h-3 rounded-sm object-cover" />
                          <span className="text-xs font-bold text-white/80">BRL</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">₮</span>
                          </div>
                          <span className="text-xs font-bold text-white/80">USDT</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-2xl font-medium">
                      {direction === "buy" ? "R$" : ""}
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={direction === "buy" ? formatBRL((numericAmount * 100).toString()) : formatBRL((numericAmount * 100).toString())}
                      onChange={handleAmountChange}
                      placeholder="0,00"
                      className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                    />
                  </div>

                  <div className="flex gap-2 mt-3">
                    {presetAmounts.map((preset) => (
                      <motion.button
                        key={preset}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAmount(preset.toString())}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          numericAmount === preset
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                      >
                        {direction === "buy" ? `R$${preset}` : preset}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center -my-1.5 relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDirection}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-[#0D0D12]"
                  >
                    <ArrowUpDown className="w-4 h-4 text-white" />
                  </motion.button>
                </div>

                <div className="relative bg-gradient-to-br from-primary/[0.08] to-violet-600/[0.04] rounded-2xl p-4 border border-primary/20 mt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">Você recebe</span>
                    <div className="flex items-center gap-1.5 bg-white/[0.06] px-2.5 py-1 rounded-full border border-primary/20">
                      {direction === "buy" ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">₮</span>
                          </div>
                          <span className="text-xs font-bold text-white/80">USDT</span>
                        </>
                      ) : (
                        <>
                          <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-4 h-3 rounded-sm object-cover" />
                          <span className="text-xs font-bold text-white/80">BRL</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <motion.div
                    animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex items-baseline gap-2"
                  >
                    {direction === "sell" && <span className="text-white/30 text-2xl font-medium">R$</span>}
                    <span className="text-3xl font-bold text-white">
                      {convertedAmount.toLocaleString(direction === "buy" ? "en-US" : "pt-BR", { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                    <span className="text-white/40 font-medium text-sm">
                      {direction === "buy" ? "USDT" : ""}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4 px-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-white/50">
                  1 USDT = <span className="text-white/80 font-semibold">R$ {rate.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-white/30" />
                <span className="text-[10px] text-white/40">~30s</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-4 bg-gradient-to-r from-primary via-violet-600 to-primary bg-[length:200%_100%] text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <Sparkles className="w-4 h-4" />
              <span>Converter Agora</span>
            </motion.button>

            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-white/40">100% Seguro</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40">Taxa: <span className="text-primary font-semibold">0.98%</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
