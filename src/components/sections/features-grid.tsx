"use client";

import React from "react";
import {
  ArrowLeftRight,
  Scan,
  ShieldCheck,
  Globe2,
  Zap,
  ShieldAlert,
  KeyRound,
  FileCheck2
} from "lucide-react";
import { useTranslations } from "next-intl";

const FeaturesGrid = () => {
  const t = useTranslations("features");

  const secondaryFeatures = [
    {
      icon: ArrowLeftRight,
      title: t("instantConversion"),
      description: t("instantConversionDesc"),
      bgColor: "bg-purple-50",
      iconColor: "text-primary",
      borderColor: "border-purple-200/60",
    },
    {
      icon: Scan,
      title: t("pixIntegrated"),
      description: t("pixIntegratedDesc"),
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200/60",
    },
    {
      icon: ShieldCheck,
      title: t("totalSecurity"),
      description: t("totalSecurityDesc"),
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
      borderColor: "border-sky-200/60",
    },
    {
      icon: Globe2,
      title: t("noBorders"),
      description: t("noBordersDesc"),
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
      borderColor: "border-amber-200/60",
    }
  ];

  const mainFeatures = [
    {
      icon: FileCheck2,
      title: t("flexibility"),
      description: t("flexibilityDesc"),
      bgColor: "bg-violet-50",
      iconColor: "text-violet-500",
      borderColor: "border-violet-200/60",
    },
    {
      icon: Zap,
      title: t("agility"),
      description: t("agilityDesc"),
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
      borderColor: "border-amber-200/60",
    },
    {
      icon: KeyRound,
      title: t("confidentiality"),
      description: t("confidentialityDesc"),
      bgColor: "bg-rose-50",
      iconColor: "text-rose-500",
      borderColor: "border-rose-200/60",
    },
    {
      icon: ShieldAlert,
      title: t("compliance"),
      description: t("complianceDesc"),
      bgColor: "bg-teal-50",
      iconColor: "text-teal-500",
      borderColor: "border-teal-200/60",
    },
  ];

  return (
    <section id="recursos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-12 sm:mb-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
                {t("badge")}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
                {t("titleLine1")} <br />
                <span className="text-gradient-primary">{t("titleLine2")}</span>
              </h2>
              <p className="mt-4 text-[14px] sm:text-base text-slate-500 leading-relaxed font-medium max-w-sm">
                {t("subtitle")}
              </p>
            </div>

            <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-[20px] p-4 sm:p-5 bg-white border border-slate-200/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-[0.4s] group hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${feature.bgColor} border ${feature.borderColor} transition-transform duration-300 group-hover:scale-105`}>
                    <feature.icon className={`h-4 w-4 ${feature.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[12px] sm:text-[13px] tracking-tight">{feature.title}</h3>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium leading-snug">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="rounded-[20px] p-4 sm:p-5 bg-white border border-slate-200/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-[0.4s] group hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
            >
              <div className={`mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${feature.bgColor} border ${feature.borderColor} transition-transform duration-300 group-hover:scale-105`}>
                <feature.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${feature.iconColor}`} strokeWidth={1.75} />
              </div>
              <h3 className="text-[12px] sm:text-[14px] font-semibold text-slate-900 mb-1 tracking-tight">{feature.title}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
