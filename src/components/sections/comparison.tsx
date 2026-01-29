"use client";

import React from "react";
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
      { label: "Spread OTC", value: "A partir de 0.98%" },
    { label: "IOF", value: "0% (isento)" },
    { label: "Tarifa OTC", value: "Incluso no spread" },
    { label: "Transferência", value: "Sem custo adicional" },
    { label: "Tempo de liquidação", value: "Imediatamente" },
    { label: "Autorização", value: "Nenhuma" },
  ];

  return (
    <section className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/12 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Comparativo
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
            Por que migrar para <br />
            <span className="text-primary">o ecossistema OTC?</span>
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 max-w-4xl mx-auto">
          <div className="ios-card-premium group">
            <div className="mb-4 sm:mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-100 transition-transform duration-300 group-hover:scale-105">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  Bancos
                </h3>
                <p className="text-[9px] sm:text-[10px] font-semibold text-red-500 uppercase tracking-wider">
                  Tradicional
                </p>
              </div>
            </div>

            <ul className="space-y-2">
              {traditionalItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-[12px] sm:text-[13px] font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] sm:text-[13px] font-semibold text-red-500">
                      {item.value}
                    </span>
                    <X className="h-3 w-3 text-red-400" strokeWidth={2.5} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative ios-card-premium bg-emerald-50/30 border-emerald-200/50 group">
            <div className="absolute -top-2 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-white bg-emerald-500 rounded-full shadow-md">
                <Crown className="h-2.5 w-2.5" strokeWidth={2} />
                VIP
              </span>
            </div>

            <div className="mb-4 sm:mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200 transition-transform duration-300 group-hover:scale-105">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  Otsem Pay
                </h3>
                <p className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Futuro Líquido
                </p>
              </div>
            </div>

            <ul className="space-y-2">
              {otcItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-emerald-100/50 last:border-0"
                >
                  <span className="text-[12px] sm:text-[13px] font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] sm:text-[13px] font-semibold text-emerald-600">
                      {item.value}
                    </span>
                    <Check className="h-3 w-3 text-emerald-500" strokeWidth={2.5} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
