"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, Zap, X, Check, Crown } from "lucide-react";

const ComparisonSection = () => {
  const traditionalItems = [
    { label: "Spread bancario", value: "6% a 12%" },
    { label: "IOF", value: "0,38%" },
    { label: "Tarifa bancaria", value: "0,1% a 2%" },
    { label: "Swift internacional", value: "R$ 100 a R$ 450" },
    { label: "Tempo de liquidacao", value: "2 a 5 dias uteis" },
  ];

  const otcItems = [
    { label: "Spread OTC", value: "A partir de 3%" },
    { label: "IOF", value: "0% (isento)" },
    { label: "Tarifa OTC", value: "Incluso no spread" },
    { label: "Transferencia", value: "Sem custo adicional" },
    { label: "Tempo de liquidacao", value: "10 a 30 minutos" },
  ];

  return (
    <section className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="mb-16 lg:mb-24 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Comparativo Eficiente
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-slate-900 leading-[0.9]">
            Por que migrar para <br />
            <span className="text-primary/30 text-3xl md:text-5xl lg:text-6xl">o ecossistema OTC?</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.1 }}
            className="rich-glass rounded-[2.5rem] p-8 sm:p-10 border-red-500/10 group transition-all duration-500"
          >
            <div className="mb-10 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <Building2 className="h-7 w-7 text-red-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Bancos</h3>
                <p className="text-[10px] font-black text-red-600/60 uppercase tracking-widest">Modelo Tradicional</p>
              </div>
            </div>

            <ul className="space-y-4">
              {traditionalItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-3.5 border-b border-black/[0.03] last:border-0 group/item">
                  <span className="text-sm font-bold text-slate-500 transition-colors group-hover/item:text-slate-900">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-red-600">{item.value}</span>
                    <X className="h-4 w-4 text-red-600/40" strokeWidth={3} />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 25, delay: 0.2 }}
            className="relative rich-glass rounded-[2.5rem] p-8 sm:p-10 border-emerald-500/20 bg-emerald-500/[0.02] shadow-2xl shadow-emerald-500/5 group"
          >
            <div className="absolute -top-3 right-8">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20"
              >
                <Crown className="h-3.5 w-3.5" strokeWidth={2.5} />
                Vantagem VIP
              </motion.span>
            </div>

            <div className="mb-10 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Zap className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900">Otsem Pay</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Futuro Liquido</p>
              </div>
            </div>

            <ul className="space-y-4">
              {otcItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-3.5 border-b border-emerald-500/10 last:border-0 group/item">
                  <span className="text-sm font-bold text-slate-500 transition-colors group-hover/item:text-slate-900">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-600">{item.value}</span>
                    <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="absolute inset-0 bg-emerald-500/[0.01] rounded-[2.5rem] pointer-events-none group-hover:bg-emerald-500/[0.03] transition-colors duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
