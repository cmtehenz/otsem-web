"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, TrendingUp } from "lucide-react";

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
          setRate(parseFloat(data.data[0].last));
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
      className="w-[300px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_-12px_rgba(111,0,255,0.15),0_0_0_1px_rgba(111,0,255,0.06)] p-5 border border-white/60"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Simulador
        </span>
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[9px] font-semibold">Live</span>
        </div>
      </div>

      <div className="bg-slate-50/80 rounded-xl p-3 mb-2 border border-slate-100/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">
            Você envia
          </span>
          <div className="flex items-center gap-1.5">
            <img
              src="https://flagcdn.com/w20/br.png"
              alt="BR"
              className="w-4 h-3 rounded-[2px] object-cover"
            />
            <span className="text-[11px] font-bold text-slate-700">BRL</span>
          </div>
        </div>
        <div className="flex items-center">
            <span className="text-slate-400 text-base font-medium mr-1">R$</span>
            <input
              type="text"
              value={formatBRL((numericAmount * 100).toString())}
              onChange={handleAmountChange}
              placeholder="0,00"
              className="w-full bg-transparent text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex justify-center -my-1 relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/25"
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-white" />
        </motion.div>
      </div>

      <div className="bg-primary/[0.06] rounded-xl p-3 mt-2 border border-primary/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">
            Você recebe
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">₮</span>
            </div>
            <span className="text-[11px] font-bold text-primary">USDT</span>
          </div>
        </div>
        <motion.div
          animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.2 }}
          className="flex items-baseline"
        >
          <span className="text-xl font-bold text-slate-800">
              ≈ {convertedAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-[9px] text-slate-400">
          Taxa: <span className="font-semibold text-slate-600">1 USDT = R$ {rate.toFixed(2)}</span>
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-3 py-2.5 bg-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
      >
        Converter agora
      </motion.button>
    </motion.div>
  );
};

export default ExchangeWidget;
