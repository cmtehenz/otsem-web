"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, Zap, X, Check, Crown } from "lucide-react";

const ComparisonSection = () => {
  const traditionalItems = [
    { label: "Spread bancário", value: "6% a 12%" },
    { label: "IOF", value: "3.5%" },
    { label: "Tarifa bancária", value: "0,1% a 2%" },
    { label: "Swift internacional", value: "R$ 100 a R$ 450" },
    { label: "Tempo de liquidação", value: "2 a 5 dias úteis" },
    { label: "Autorização", value: "Do seu banco" },
  ];

  const otcItems = [
    { label: "Spread OTC", value: "A partir de 3%" },
    { label: "IOF", value: "0% (isento)" },
    { label: "Tarifa OTC", value: "Incluso no spread" },
    { label: "Transferência", value: "Sem custo adicional" },
    { label: "Tempo de liquidação", value: "Imediatamente" },
    { label: "Autorização", value: "Nenhuma" },
  ];

  return (
    <section className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Comparativo
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
            Por que migrar para <br />
            <span className="text-primary">o ecossistema OTC?</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="ios-card-elevated group"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 border border-red-100 transition-transform duration-300 group-hover:scale-105">
                <Building2 className="h-5 w-5 text-red-500" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Bancos
                </h3>
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                  Tradicional
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {traditionalItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-[13px] sm:text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] sm:text-sm font-semibold text-red-500">
                      {item.value}
                    </span>
                    <X className="h-3.5 w-3.5 text-red-400" strokeWidth={2.5} />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.15 }}
            className="relative ios-card-elevated bg-emerald-50/30 border-emerald-200/50 group"
          >
            <div className="absolute -top-2.5 right-5">
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white bg-emerald-500 rounded-full shadow-md"
              >
                <Crown className="h-3 w-3" strokeWidth={2} />
                VIP
              </motion.span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200 transition-transform duration-300 group-hover:scale-105">
                <Zap className="h-5 w-5 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Otsem Pay
                </h3>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Futuro Líquido
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {otcItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2.5 border-b border-emerald-100/50 last:border-0"
                >
                  <span className="text-[13px] sm:text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] sm:text-sm font-semibold text-emerald-600">
                      {item.value}
                    </span>
                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} />
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
