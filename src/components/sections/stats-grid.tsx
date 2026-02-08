"use client";

import React from "react";
import { TrendingUp, Globe2, Timer, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const StatsGrid = () => {
  const t = useTranslations("stats");

  const stats = [
    {
      icon: TrendingUp,
      value: "US$ 415B",
      label: t("otcMarket"),
      bgColor: "bg-purple-50",
      iconColor: "text-primary",
      borderColor: "border-purple-200/60",
    },
    {
      icon: Globe2,
      value: "9.1%",
      label: t("latamVolume"),
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200/60",
    },
    {
      icon: Timer,
      value: t("instantValue"),
      label: t("instantSettlement"),
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
      borderColor: "border-sky-200/60",
    },
    {
      icon: BadgeCheck,
      value: "0% IOF",
      label: t("noTax"),
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
      borderColor: "border-amber-200/60",
    },
  ];
  return (
    <section className="relative z-10 section-padding overflow-hidden bg-slate-50/50">
      <div className="container mx-auto container-mobile">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary border border-primary/15 font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("badge")}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest max-w-md leading-[1.1] text-slate-900">
            {t("titleLine1")} <br />
            <span className="text-gradient-primary">{t("titleLine2")}</span>
          </h2>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="rounded-[20px] p-4 sm:p-5 bg-white border border-slate-200/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-[0.4s] h-full flex flex-col hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
                <div className="space-y-3 sm:space-y-4">
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${stat.bgColor} border ${stat.borderColor} transition-transform duration-200 group-hover:scale-105`}
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
                        <span className="text-emerald-500 text-sm sm:text-base">↑</span>
                      )}
                    </div>

                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-snug">
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
