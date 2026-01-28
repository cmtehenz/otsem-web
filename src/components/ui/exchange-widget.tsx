"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, Zap, Shield, Clock } from "lucide-react";

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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="w-full max-w-[640px] bg-gradient-to-br from-white via-white to-slate-50/80 backdrop-blur-2xl rounded-3xl shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] p-8 border border-slate-200/60 relative overflow-hidden"
    >
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/15 to-[#6F00FF]/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-emerald-400/10 to-primary/5 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Câmbio Instantâneo</h3>
          <p className="text-sm text-slate-500">Converta BRL para USDT em segundos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isLoading ? "..." : "Ao Vivo"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 transition-all hover:border-slate-300/80 hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Você envia</span>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-4 rounded-sm object-cover" />
              <span className="text-sm font-bold text-slate-700">BRL</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-slate-400 text-3xl font-semibold mr-2">R$</span>
            <input
              type="text"
              value={formatBRL((numericAmount * 100).toString())}
              onChange={handleAmountChange}
              placeholder="0,00"
              className="w-full bg-transparent text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-20">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-xl border-4 border-white">
            <ArrowDownUp className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] rounded-2xl p-6 border border-primary/15 transition-all hover:border-primary/25 hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Você recebe</span>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary/15 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">₮</span>
              </div>
              <span className="text-sm font-bold text-primary">USDT</span>
            </div>
          </div>
          <motion.div
            animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.2 }}
            className="flex items-baseline"
          >
            <span className="text-4xl font-bold text-slate-900">
              {convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-2 text-slate-400 font-semibold text-lg">USDT</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-50/80 rounded-xl border border-slate-100 relative z-10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Taxa de câmbio</span>
          <span className="font-bold text-slate-700">1 USDT = R$ {rate.toFixed(4)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-500">Taxa de serviço</span>
          <span className="font-bold text-emerald-600">0%</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full mt-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-base font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 relative z-10 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Zap className="w-5 h-5 text-primary" />
        <span>Iniciar Conversão</span>
      </motion.button>

      <div className="mt-6 flex items-center justify-center gap-6 relative z-10">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-4 h-4" />
          <span>100% Seguro</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Clock className="w-4 h-4" />
          <span>Processamento Instantâneo</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExchangeWidget;
