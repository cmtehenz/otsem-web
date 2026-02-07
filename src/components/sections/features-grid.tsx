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
      description: t("instantConversionDesc")
    },
    {
      icon: Scan,
      title: t("pixIntegrated"),
      description: t("pixIntegratedDesc")
    },
    {
      icon: ShieldCheck,
      title: t("totalSecurity"),
      description: t("totalSecurityDesc")
    },
    {
      icon: Globe2,
      title: t("noBorders"),
      description: t("noBordersDesc")
    }
  ];

  const mainFeatures = [
    {
      icon: FileCheck2,
      title: t("flexibility"),
      description: t("flexibilityDesc"),
    },
    {
      icon: Zap,
      title: t("agility"),
      description: t("agilityDesc"),
    },
    {
      icon: KeyRound,
      title: t("confidentiality"),
      description: t("confidentialityDesc"),
    },
    {
      icon: ShieldAlert,
      title: t("compliance"),
      description: t("complianceDesc"),
    },
  ];

  return (
    <section id="recursos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-12 sm:mb-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/12 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
                {t("badge")}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
                {t("titleLine1")} <br />
                <span className="text-primary">{t("titleLine2")}</span>
              </h2>
              <p className="mt-4 text-[14px] sm:text-base text-slate-600 leading-relaxed font-medium max-w-sm">
                {t("subtitle")}
              </p>
            </div>

            <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="ios-card-premium group"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
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
              className="ios-card-premium group"
            >
              <div className="mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/12 transition-transform duration-300 group-hover:scale-105">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" strokeWidth={1.75} />
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
