"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, TrendingUp, Info } from "lucide-react";

const ExchangeWidget = () => {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(6.01);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch("https://www.okx.com/api/v5/market/ticker?instId=USDT-BRL");
        const data = await response.json();
        if (data.code === "0" && data.data?.[0]?.last) {
          const baseRate = parseFloat(data.data[0].last);
          setRate(baseRate * 1.0098); // Add 0.98% markup
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
  const convertedAmount = numericAmount / rate;

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

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [amount]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="w-full max-w-[400px] bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.4)] p-8 border border-white/50 relative overflow-hidden group"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/15 transition-colors duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Câmbio Instantâneo</h3>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Global Liquidity</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            {isLoading ? "Fetching..." : "Live"}
          </span>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {/* Input Section */}
        <div className="relative group/input">
          <div className="absolute inset-0 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all duration-300 group-hover/input:bg-slate-50 group-hover/input:border-primary/20" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Você envia
              </span>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-slate-100 shadow-sm">
                <img
                  src="https://flagcdn.com/w20/br.png"
                  alt="BR"
                  className="w-4 h-3 rounded-[1px] object-cover"
                />
                <span className="text-[11px] font-bold text-slate-700">BRL</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 text-2xl font-semibold mr-2 select-none">R$</span>
              <input
                type="text"
                value={formatBRL((numericAmount * 100).toString())}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="w-full bg-transparent text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-200 tracking-tight"
              />
            </div>
          </div>
        </div>

        {/* Swap Button Container */}
        <div className="flex justify-center -my-6 relative z-20">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center cursor-pointer shadow-xl shadow-slate-900/20 border-4 border-white group/swap"
          >
            <ArrowDownUp className="w-5 h-5 text-white transition-transform group-hover/swap:scale-110" />
          </motion.button>
        </div>

        {/* Output Section */}
        <div className="relative group/output">
          <div className="absolute inset-0 bg-primary/[0.03] rounded-2xl border border-primary/5 transition-all duration-300 group-hover/output:bg-primary/[0.05] group-hover/output:border-primary/10" />
          <div className="relative p-5 pt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">
                Você recebe
              </span>
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-full border border-primary/10 shadow-sm">
                <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white leading-none">₮</span>
                </div>
                <span className="text-[11px] font-bold text-primary">USDT</span>
              </div>
            </div>
            <motion.div
              animate={isAnimating ? { y: [0, -2, 0], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.2 }}
              className="flex items-baseline"
            >
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                {convertedAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="ml-2 text-slate-400 font-semibold text-lg select-none">USDT</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 relative z-10">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 group/info cursor-help">
            <span className="text-[11px] font-semibold text-slate-400 group-hover/info:text-slate-600 transition-colors">
              Taxa comercial: <span className="text-slate-900">1 USDT = R$ {rate.toFixed(3)}</span>
            </span>
            <Info className="w-3 h-3 text-slate-300 group-hover/info:text-primary transition-colors" />
          </div>
          <div className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
            -0.2% fee
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01, translateY: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4.5 bg-slate-900 text-white text-[15px] font-bold rounded-2xl shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Iniciar Conversão</span>
          <TrendingUp className="w-4 h-4 text-primary" />
        </motion.button>
        
        <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed px-4">
          Liquidação garantida em menos de 2 minutos via PIX 24/7
        </p>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
