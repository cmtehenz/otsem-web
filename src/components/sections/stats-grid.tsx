"use client";

import React from "react";
import { TrendingUp, Globe2, Timer, BadgeCheck } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "US$ 415B",
    label: "Mercado OTC global",
    color: "bg-primary/8",
    iconColor: "text-primary",
  },
  {
    icon: Globe2,
    value: "9.1%",
    label: "Volume LATAM global",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    icon: Timer,
    value: "Imediato",
    label: "Liquidação ultra-rápida",
    color: "bg-primary/8",
    iconColor: "text-primary",
  },
  {
    icon: BadgeCheck,
    value: "0% IOF",
    label: "Sem imposto",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const StatsGrid = () => {
  return (
    <section className="relative z-10 section-padding overflow-hidden">
      {/* Static background - no animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] max-w-[550px] max-h-[550px] -z-20 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_70%)] pointer-events-none" />

      <div className="container mx-auto container-mobile">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400 text-yellow-950 font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-5 shadow-md">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-950 animate-pulse" />
            Plataforma Financeira Global
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest max-w-md leading-[1.1] text-slate-900">
            Poder financeiro <br />
            <span className="text-primary">sem fronteiras.</span>
          </h2>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="ios-card-premium h-full flex flex-col">
                <div className="space-y-3 sm:space-y-4">
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${stat.color} border border-slate-100/80 transition-transform duration-200 group-hover:scale-105`}
                  >
                    <stat.icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-baseline gap-1">
                      {stat.value}
                      {stat.value.includes("%") && (
                        <span className="text-yellow-500 text-sm sm:text-base">↑</span>
                      )}
                    </div>

                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
