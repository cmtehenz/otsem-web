"use client";

import React from "react";
import { UserPlus, Landmark, ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";

const HowItWorks = () => {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      id: "01",
      icon: UserPlus,
      title: t("step1Title"),
      description: t("step1Desc"),
      bgColor: "bg-purple-50",
      iconColor: "text-primary",
      borderColor: "border-purple-200/60",
    },
    {
      id: "02",
      icon: Landmark,
      title: t("step2Title"),
      description: t("step2Desc"),
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
      borderColor: "border-sky-200/60",
    },
    {
      id: "03",
      icon: ArrowLeftRight,
      title: t("step3Title"),
      description: t("step3Desc"),
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200/60",
    },
  ];

  return (
    <section id="como-funciona" className="relative z-10 section-padding bg-slate-50/50">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t("badge")}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
            {t("titleLine1")} <br />
            <span className="text-gradient-primary">{t("titleLine2")}</span>
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative rounded-[20px] p-4 sm:p-5 bg-white border border-slate-200/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-[0.4s] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
            >
              <span
                className="absolute right-4 top-4 text-xl sm:text-2xl font-bold text-slate-100 select-none pointer-events-none"
                aria-hidden="true"
              >
                {step.id}
              </span>

              <div className="relative z-10 space-y-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.bgColor} border ${step.borderColor} transition-transform duration-300 group-hover:scale-105`}>
                  <step.icon
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${step.iconColor}`}
                    strokeWidth={1.75}
                  />
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
