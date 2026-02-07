"use client";

import React, { useCallback } from "react";
import { Check, ArrowLeftRight, TrendingUp } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Pricing = () => {
  const t = useTranslations("pricing");
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const plans = [
    {
      name: t("otcName"),
      description: t("otcDesc"),
      priceLabel: t("otcPriceLabel"),
      price: t("otcPrice"),
      priceSuffix: t("otcPriceSuffix"),
      features: [
        t("otcFeature1"),
        t("otcFeature2"),
        t("otcFeature3"),
        t("otcFeature4")
      ],
      cta: t("otcCta"),
      icon: ArrowLeftRight,
      popular: false,
    },
    {
      name: t("highVolName"),
      description: t("highVolDesc"),
      priceLabel: t("highVolPriceLabel"),
      price: t("highVolPrice"),
      priceSuffix: t("highVolPriceSuffix"),
      features: [
        t("highVolFeature1"),
        t("highVolFeature2"),
        t("highVolFeature3"),
        t("highVolFeature4")
      ],
      cta: t("highVolCta"),
      icon: TrendingUp,
      popular: true,
    }
  ];

  return (
    <section id="precos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#9B4DFF] font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            {t("badge")}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-white">
            {t("title")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] sm:text-[14px] text-white/60 font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-3 sm:gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[20px] p-4 sm:p-5 bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-[0.4s] group ${
                plan.popular
                  ? "ring-2 ring-[#6F00FF]/30 bg-[#6F00FF]/5"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-2.5 py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-white bg-primary rounded-full shadow-md">
                    {t("mostPopular")}
                  </span>
                </div>
              )}

                <div className="mb-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {'icon' in plan && plan.icon ? (
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${plan.popular ? 'bg-primary text-white shadow-md' : 'bg-[#6F00FF]/15 text-[#9B4DFF]'}`}>
                        <plan.icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                    ) : null}
                    <h3 className="text-[14px] sm:text-base font-bold text-white tracking-tight">{plan.name}</h3>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-white/60 font-medium">{plan.description}</p>
                </div>

              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-white/40">{plan.priceLabel}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{plan.price}</span>
                  <span className="text-[10px] text-white/40 font-medium">{plan.priceSuffix}</span>
                </div>
              </div>

              <ul className="mb-4 space-y-1.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-2.5 w-2.5 text-emerald-400" strokeWidth={3} />
                    </div>
                    <span className="text-[12px] text-white/80 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" onClick={handleButtonClick} className="block">
                <button
                  className={`w-full rounded-xl py-3 text-[12px] sm:text-[13px] font-semibold transition-all active:scale-[0.98] ${
                    plan.popular
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
