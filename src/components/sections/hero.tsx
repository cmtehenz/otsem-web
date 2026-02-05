"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
} from "lucide-react";
import haptic from "@/lib/haptics";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Lazy-load exchange widget — heavy component with polling + animations
const ExchangeWidget = dynamic(
  () => import("@/components/ui/exchange-widget"),
  { ssr: false }
);

// Lightweight CSS-only wave — replaces expensive SVG morphing + Framer infinite animations
const AnimatedWave = () => {
  return (
    <div className="relative h-6 sm:h-8 lg:h-10 -my-1 sm:-my-2 z-10 overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full opacity-80" />
      </div>
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <div className="h-[3px] w-24 bg-gradient-to-r from-transparent via-yellow-200 to-transparent rounded-full blur-sm animate-[shimmer_3s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

const HeroSection = () => {
  const t = useTranslations("hero");
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <section className="relative z-10 min-h-[100dvh] flex flex-col pt-20 sm:pt-24 lg:pt-28 overflow-hidden">
      {/* Static background elements */}
      <div className="absolute top-[-8%] right-[-12%] w-[75vw] sm:w-[55vw] h-[75vw] sm:h-[55vw] max-w-[450px] max-h-[450px] bg-primary/6 blur-[40px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[-12%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] max-w-[380px] max-h-[380px] bg-primary/6 blur-[40px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 flex-grow flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-6 sm:py-10">
        {/* Left side - Text content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[50%] text-left relative z-20"
        >
          <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/12 shadow-sm text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.18em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="whitespace-nowrap">{t("badge")}</span>
            </div>
          </motion.div>

<motion.h1
              variants={itemVariants}
              className="font-black tracking-tighter leading-[0.95] mb-5 sm:mb-7 relative"
            >
              <div className="relative mb-0.5">
                <span className="text-[12vw] sm:text-5xl md:text-6xl lg:text-[5rem] text-slate-900 block leading-[1.05]">
                  {t("titleLine1")}
                </span>
              </div>

              {/* Animated wave stripe */}
              <AnimatedWave />

              <div className="relative">
                <span className="text-[12vw] sm:text-5xl md:text-6xl lg:text-[5rem] text-primary leading-[1.05]">
                  {t("titleLine2Highlight")} <span className="text-slate-900">{t("titleLine2")}</span>
                </span>
              </div>
            </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-md text-[15px] sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8"
          >
            {t.rich("description", { bold: (chunks) => <span className="text-slate-900 font-semibold">{chunks}</span> })}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
          >
            <Link
              href="/register"
              className="block w-full sm:w-auto"
              onClick={handleButtonClick}
            >
              <button className="btn-premium w-full sm:w-auto group px-5 sm:px-6 py-3 sm:py-3.5 text-[14px] sm:text-[15px] rounded-[12px] sm:rounded-[14px] font-semibold transition-transform duration-150 active:scale-[0.98]">
                {t("cta")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link
              href="/login"
              className="block w-full sm:w-auto"
              onClick={() => haptic.light()}
            >
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-[14px] sm:text-[15px] rounded-[12px] sm:rounded-[14px] font-semibold transition-transform duration-150 active:scale-[0.98] bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/25">
                {t("learnMore")}
              </button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-5 border-t border-slate-100 pt-6 sm:pt-8"
          >
            <div className="flex -space-x-2.5">
              {[
                { bg: "bg-violet-500", initials: "MR" },
                { bg: "bg-emerald-500", initials: "AS" },
                { bg: "bg-amber-500", initials: "LC" },
                { bg: "bg-sky-500", initials: "JP" },
              ].map((avatar) => (
                <div
                  key={avatar.initials}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-white ${avatar.bg} flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shadow-md`}
                >
                  {avatar.initials}
                </div>
              ))}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-white bg-primary flex items-center justify-center text-[8px] sm:text-[9px] font-semibold text-white shadow-md">
                +6k
              </div>
            </div>
            <div className="text-[12px] sm:text-[13px] font-medium text-slate-500 leading-snug">
                {t.rich("socialProof", {
                  bold: (chunks) => <span className="text-slate-900 font-semibold">{chunks}</span>,
                  highlight: (chunks) => <span className="text-primary font-semibold">{chunks}</span>,
                })}
              </div>
          </motion.div>
        </motion.div>

        {/* Right side - Exchange Widget */}
        <div className="w-full lg:w-[50%] relative flex items-center justify-center">
          {/* Static floating badges - no continuous animations */}
          <div className="absolute -top-8 sm:-top-6 -left-8 sm:-left-16 z-30 ios-card-elevated hidden sm:block">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("badgeLiquidity")}</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">{t("badgeLiquidityValue")}</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 sm:-bottom-6 -right-4 sm:-right-8 z-30 ios-card-elevated hidden sm:block">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/15">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("badgeSecurity")}</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">{t("badgeSecurityValue")}</p>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 -left-12 z-30 ios-card-elevated hidden xl:block">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("badgeCoverage")}</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">{t("badgeCoverageValue")}</p>
              </div>
            </div>
          </div>

          <div className="absolute top-4 -right-8 z-30 ios-card-elevated hidden xl:block">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{t("badgeTime")}</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">{t("badgeTimeValue")}</p>
              </div>
            </div>
          </div>

          {/* The Exchange Widget */}
          <div className="relative z-20 w-full flex justify-center px-2 sm:px-0">
            <ExchangeWidget />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
