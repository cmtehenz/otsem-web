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
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
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
          x: [0, 20, 0],
          y: [0, -15, 0],
          scale: [1, 1.06, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] right-[-10%] w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] max-w-[500px] max-h-[500px] bg-primary/8 blur-[100px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -25, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-5%] left-[-15%] w-[70vw] sm:w-[50vw] h-[70vw] sm:h-[50vw] max-w-[400px] max-h-[400px] bg-primary/8 blur-[80px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-5 sm:px-6 flex-grow flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] text-left relative z-20"
        >
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-50 border border-primary/15 shadow-sm text-primary font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="whitespace-nowrap">Sistema sem fronteiras</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-bold tracking-tightest leading-[0.95] mb-6 sm:mb-8 relative"
          >
            <div className="relative mb-1">
              <span className="text-[11vw] sm:text-5xl md:text-6xl lg:text-[5.5rem] text-slate-900 block leading-[1.05]">
                Sua ponte
              </span>
            </div>

            <div className="relative h-6 sm:h-10 lg:h-12 -my-1 sm:-my-3 z-10">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50 }}
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
                    strokeWidth="6"
                    strokeLinecap="round"
                    animate={{ d: [wavePath1, wavePath2, wavePath1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.5))" }}
                  />
                </svg>
              </motion.div>
            </div>

            <div className="relative">
              <span className="text-[11vw] sm:text-5xl md:text-6xl lg:text-[5.5rem] text-primary leading-[1.05]">
                liquida <span className="text-slate-900">global.</span>
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-lg text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-8 sm:mb-10"
          >
            Converta BRL em USDT instantaneamente com <span className="text-slate-900 font-semibold">segurança institucional</span> e as menores taxas do mercado.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
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
                <button className="btn-premium w-full sm:w-auto group px-6 sm:px-7 py-3.5 text-[15px] rounded-[14px] font-semibold">
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
              <button className="btn-premium-outline w-full sm:w-auto px-6 sm:px-7 py-3.5 text-[15px] rounded-[14px] font-semibold">
                <Globe className="w-4 h-4 text-primary" />
                Explorar
              </button>
            </motion.a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-10 sm:mt-12 flex items-center gap-5 sm:gap-6 border-t border-slate-100 pt-8 sm:pt-10"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] border-white bg-slate-100 overflow-hidden shadow-md"
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 42}`} alt="User" />
                </motion.div>
              ))}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] border-white bg-primary flex items-center justify-center text-[9px] font-semibold text-white shadow-md">
                +10k
              </div>
            </div>
            <div className="text-[13px] sm:text-sm font-medium text-slate-500 leading-snug">
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
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-4 z-30 ios-card-elevated group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Liquidez</p>
                <p className="text-lg font-semibold text-slate-800 tracking-tight">Instantânea</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-4 -left-8 z-30 ios-card-elevated group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Segurança</p>
                <p className="text-lg font-semibold text-slate-800 tracking-tight">Institucional</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative z-20"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          >
            <IPhoneMockup className="scale-100 origin-center">
              <div className="bg-gradient-to-b from-slate-50 to-white h-full overflow-hidden">
                <div className="p-5 pt-12 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Patrimônio Total</p>
                      <p className="text-3xl font-bold tracking-tight text-slate-800 mt-1">R$ 152.480</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="ios-card">
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">BRL Cash</p>
                      <p className="text-lg font-bold text-slate-800 mt-0.5">48.2K</p>
                    </div>
                    <div className="ios-card">
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">USDT Balance</p>
                      <p className="text-lg font-bold text-primary mt-0.5">18.4K</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-1">Atividade</p>

                    <div className="ios-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">PIX Recebido</p>
                          <p className="text-[10px] text-slate-400 font-medium">Hoje, 14:32</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-semibold text-emerald-600">+R$ 12.000</p>
                    </div>

                    <div className="ios-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15">
                          <RefreshCw className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">Swap BRL → USDT</p>
                          <p className="text-[10px] text-slate-400 font-medium">Hoje, 15:45</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-semibold text-primary">-$ 2.450</p>
                    </div>

                    <div className="ios-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                          <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">Saque USDT</p>
                          <p className="text-[10px] text-slate-400 font-medium">Ontem, 09:12</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-semibold text-blue-600">-$ 500</p>
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
