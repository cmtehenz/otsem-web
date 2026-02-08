"use client";

import React, { useCallback } from "react";
import { Check, ArrowRight } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";
import { useTranslations } from "next-intl";

const CTABanner = () => {
  const t = useTranslations("cta");
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3")
  ];

  return (
    <section className="relative z-10 section-padding container-mobile">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-xl shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#8B2FFF] to-primary animate-gradient-shift" />

          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#6F00FF]/15 rounded-full blur-2xl" />

          <div className="relative z-10 p-6 sm:p-10 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/15 border border-white/20">
                <span className="text-[11px] sm:text-[12px] font-bold tracking-tight text-white">{t("badge")}</span>
              </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-white mb-4 leading-tight">
                {t("titleLine1")}<br />{t("titleLine2")}
              </h2>

            <p className="max-w-md mx-auto text-[13px] sm:text-[14px] text-white/80 leading-relaxed font-medium mb-6">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mb-6">
              <div className="w-full sm:w-auto">
                <Link href="/register" onClick={handleButtonClick} className="block">
                    <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-primary font-semibold text-[13px] flex items-center justify-center gap-2 shadow-lg ios-touch-effect active:scale-[0.97] transition-transform hover:bg-white/90">
                      {t("createAccount")}
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <Link href="/login" onClick={() => haptic.light()} className="block">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-xl border border-white/30 bg-white/10 text-white font-semibold text-[13px] ios-touch-effect active:scale-[0.97] transition-transform hover:bg-white/20">
                    {t("haveAccount")}
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-white/75">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white/20">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
