"use client";

import React, { useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Wallet,
  ArrowDownLeft,
  RefreshCw,
  Globe,
  ArrowUpRight,
} from "lucide-react";
import haptic from "@/lib/haptics";
import { IPhoneMockup } from "@/components/ui/iphone-mockup";
import Link from "next/link";

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const springY = useSpring(y1, { stiffness: 80, damping: 20 });

  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
        mass: 0.8
      }
    }
  };

  const wavePath1 = "M 0 50 Q 250 10 500 50 T 1000 50";
  const wavePath2 = "M 0 50 Q 250 90 500 50 T 1000 50";

  return (
    <section className="relative z-10 min-h-[100dvh] flex flex-col pt-20 sm:pt-24 lg:pt-28 overflow-hidden">
      <motion.div
        animate={{
          x: [0, 15, 0],
          y: [0, -10, 0],
          scale: [1, 1.04, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-8%] right-[-12%] w-[75vw] sm:w-[55vw] h-[75vw] sm:h-[55vw] max-w-[450px] max-h-[450px] bg-primary/6 blur-[80px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 15, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-8%] left-[-12%] w-[65vw] sm:w-[45vw] h-[65vw] sm:h-[45vw] max-w-[380px] max-h-[380px] bg-primary/6 blur-[70px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-4 sm:px-6 flex-grow flex flex-col lg:flex-row items-center gap-6 lg:gap-12 py-6 sm:py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] text-left relative z-20"
        >
          <motion.div variants={itemVariants} className="mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#6F00FF]/10 border border-primary/12 shadow-sm text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.18em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="whitespace-nowrap">Sistema sem fronteiras</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-bold tracking-tightest leading-[0.95] mb-5 sm:mb-7 relative"
          >
            <div className="relative mb-0.5">
<span className="text-[12vw] sm:text-5xl md:text-6xl lg:text-[5rem] text-slate-900 block leading-[1.05]">
                  Sua Ponte
                </span>
            </div>

            <div className="relative h-5 sm:h-8 lg:h-10 -my-0.5 sm:-my-2 z-10">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35, type: "spring", stiffness: 50 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg viewBox="0 0 1000 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="waveGradientHero" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity="0" />
                      <stop offset="20%" stopColor="#FACC15" stopOpacity="0.7" />
                      <stop offset="50%" stopColor="#FDE047" stopOpacity="1" />
                      <stop offset="80%" stopColor="#FACC15" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={wavePath1}
                    fill="none"
                    stroke="url(#waveGradientHero)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    animate={{ d: [wavePath1, wavePath2, wavePath1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 6px rgba(250, 204, 21, 0.4))" }}
                  />
                </svg>
              </motion.div>
            </div>

            <div className="relative">
              <span className="text-[12vw] sm:text-5xl md:text-6xl lg:text-[5rem] text-primary leading-[1.05]">
                liquida <span className="text-slate-900">global.</span>
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-md text-[15px] sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed mb-6 sm:mb-8"
          >
            Converta BRL em USDT instantaneamente com <span className="text-slate-900 font-semibold">segurança institucional</span> e as menores taxas do mercado.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
          >
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="block w-full"
                onClick={handleButtonClick}
              >
                <button className="btn-premium w-full sm:w-auto group px-5 sm:px-6 py-3 sm:py-3.5 text-[14px] sm:text-[15px] rounded-[12px] sm:rounded-[14px] font-semibold">
                  Abrir Conta VIP
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </motion.div>
            <motion.a
              href="#como-funciona"
              className="block w-full sm:w-auto"
              onClick={() => haptic.light()}
              whileTap={{ scale: 0.97 }}
            >
              <button className="btn-premium-outline w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 text-[14px] sm:text-[15px] rounded-[12px] sm:rounded-[14px] font-semibold">
                <Globe className="w-4 h-4 text-primary" />
                Explorar
              </button>
            </motion.a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-5 border-t border-slate-100 pt-6 sm:pt-8"
          >
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-white bg-slate-100 overflow-hidden shadow-md"
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 42}`} alt="User" />
                </motion.div>
              ))}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-white bg-primary flex items-center justify-center text-[8px] sm:text-[9px] font-semibold text-white shadow-md">
                +10k
              </div>
            </div>
            <div className="text-[12px] sm:text-[13px] font-medium text-slate-500 leading-snug">
              <span className="text-slate-900 font-semibold">10.000+</span> líderes <br className="sm:hidden" />
              confiam na <span className="text-primary font-semibold">OtsemPay</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: springY, opacity }}
          className="w-full lg:w-[45%] relative hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-5 -right-3 z-30 ios-card-elevated group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Liquidez</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">Instantânea</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -bottom-3 -left-6 z-30 ios-card-elevated group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/15">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Segurança</p>
                <p className="text-base font-semibold text-slate-800 tracking-tight">Institucional</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative z-20"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
          >
            <IPhoneMockup className="scale-100 origin-center">
              <div className="bg-gradient-to-b from-slate-50 to-white h-full overflow-hidden">
                <div className="p-4 pt-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Patrimônio Total</p>
                      <p className="text-2xl font-bold tracking-tight text-slate-800 mt-0.5">R$ 152.480</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                      <Wallet className="w-4.5 h-4.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="ios-card p-3">
                      <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider">BRL Cash</p>
                      <p className="text-base font-bold text-slate-800 mt-0.5">48.2K</p>
                    </div>
                    <div className="ios-card p-3">
                      <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider">USDT Balance</p>
                      <p className="text-base font-bold text-primary mt-0.5">18.4K</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider px-1">Atividade</p>

                    <div className="ios-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-slate-800">PIX Recebido</p>
                          <p className="text-[9px] text-slate-400 font-medium">Hoje, 14:32</p>
                        </div>
                      </div>
                      <p className="text-[12px] font-semibold text-emerald-600">+R$ 12.000</p>
                    </div>

                    <div className="ios-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
                          <RefreshCw className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-slate-800">Swap BRL → USDT</p>
                          <p className="text-[9px] text-slate-400 font-medium">Hoje, 15:45</p>
                        </div>
                      </div>
                      <p className="text-[12px] font-semibold text-primary">-$ 2.450</p>
                    </div>

                    <div className="ios-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-slate-800">Saque USDT</p>
                          <p className="text-[9px] text-slate-400 font-medium">Ontem, 09:12</p>
                        </div>
                      </div>
                      <p className="text-[12px] font-semibold text-blue-600">-$ 500</p>
                    </div>
                  </div>
                </div>
              </div>
            </IPhoneMockup>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
