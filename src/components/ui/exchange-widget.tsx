"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

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
          setRate(baseRate * 1.0098);
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
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="w-full max-w-[560px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] p-6 border border-slate-100 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/8 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">Câmbio Instantâneo</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {isLoading ? "..." : "Live"}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          1 USDT = R$ {rate.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-3 relative z-10">
          <div className="flex-1 basis-0 min-w-0 bg-slate-50/80 rounded-xl p-5 border border-slate-100 h-[110px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Você envia</span>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-4 h-3 rounded-sm object-cover" />
                <span className="text-[11px] font-bold text-slate-600">BRL</span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-slate-400 text-xl font-medium mr-1">R$</span>
              <input
                type="text"
                value={formatBRL((numericAmount * 100).toString())}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
              />
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 basis-0 min-w-0 bg-primary/[0.04] rounded-xl p-5 border border-primary/10 h-[110px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary/50 uppercase tracking-wider">Você recebe</span>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-primary/10">
                <div className="w-4 h-4 rounded-full bg-[#26A17B] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">₮</span>
                </div>
                <span className="text-[11px] font-bold text-primary">USDT</span>
              </div>
            </div>
            <motion.div
              animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.2 }}
              className="flex items-baseline mt-2"
            >
              <span className="text-2xl font-bold text-slate-900">
                {convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="ml-1.5 text-slate-400 font-medium text-sm">USDT</span>
            </motion.div>
          </div>
        </div>

      <div className="flex items-center justify-between mt-5 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
        >
          <span>Iniciar Conversão</span>
          <TrendingUp className="w-4 h-4 text-primary" />
        </motion.button>
        <div className="ml-4 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100/50">
          0% fee
        </div>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
