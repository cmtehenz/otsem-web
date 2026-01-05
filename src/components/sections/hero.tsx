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
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const springY = useSpring(y1, { stiffness: 100, damping: 20 });

  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 25,
        mass: 1
      }
    }
  };

  const wavePath1 = "M 0 50 Q 250 10 500 50 T 1000 50";
  const wavePath2 = "M 0 50 Q 250 90 500 50 T 1000 50";

  return (
    <section className="relative z-10 min-h-[100dvh] flex flex-col pt-24 lg:pt-32 overflow-hidden">
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-primary/10 blur-[140px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-6 flex-grow flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[55%] text-left relative z-20"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/40 backdrop-blur-3xl border border-white/60 shadow-xl shadow-black/5 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
              <span className="whitespace-nowrap">WEB3 BORDERLESS BANKING</span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-black tracking-tightest text-foreground leading-[0.9] mb-12 relative"
          >
            <div className="relative mb-1 overflow-visible">
              <span className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] text-foreground block drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/80">
                Sua ponte
              </span>
            </div>

            <div className="relative h-8 sm:h-12 lg:h-14 -my-2 sm:-my-4 lg:-my-6 z-10 overflow-visible">
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 60 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg viewBox="0 0 1000 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="waveGradientHero" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FACC15" stopOpacity="0" />
                      <stop offset="20%" stopColor="#FACC15" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#FDE047" stopOpacity="1" />
                      <stop offset="80%" stopColor="#FACC15" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={wavePath1}
                    fill="none"
                    stroke="url(#waveGradientHero)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    animate={{ d: [wavePath1, wavePath2, wavePath1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "drop-shadow(0 0 12px rgba(250, 204, 21, 0.6))" }}
                  />
                  <motion.path
                    d={wavePath2}
                    fill="none"
                    stroke="url(#waveGradientHero)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.3"
                    animate={{ d: [wavePath2, wavePath1, wavePath2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            </div>

            <div className="relative overflow-visible">
              <span className="text-[10vw] sm:text-[9vw] lg:text-[7rem] xl:text-[8rem] text-primary leading-none drop-shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                liquida <span className="text-foreground">global.</span>
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-12"
          >
            Converta BRL em USDT instantaneamente com <span className="text-foreground font-black">seguranca institucional</span> e as menores taxas do mercado global.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/register"
                className="w-full sm:w-auto"
                onClick={handleButtonClick}
              >
                <button className="btn-premium w-full sm:w-auto group px-8 py-4 text-lg rounded-2xl font-black tracking-tight">
                  Abrir Conta VIP
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </button>
              </Link>
            </motion.div>
            <motion.a
              href="#como-funciona"
              className="w-full sm:w-auto"
              onClick={() => haptic.light()}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <button className="btn-premium-outline w-full sm:w-auto px-8 py-4 text-lg rounded-2xl font-black tracking-tight">
                <Globe className="w-5 h-5 text-primary" />
                Explorar
              </button>
            </motion.a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-14 flex items-center gap-8 border-t border-black/[0.05] pt-10"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg ring-1 ring-black/5"
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 42}`} alt="User" />
                </motion.div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-white bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-1 ring-black/5">
                +10k
              </div>
            </div>
            <div className="text-sm font-bold text-muted-foreground leading-snug">
              <span className="text-foreground font-black text-lg">10.000+</span> lideres globais <br />
              confiam na <span className="text-primary font-black">OtsemPay</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: springY, opacity }}
          className="w-full lg:w-[45%] relative hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-6 z-30 rich-glass p-6 rounded-[2rem] shadow-2xl group hover:scale-105 transition-transform duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-600 border border-yellow-400/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Liquidez</p>
                <p className="text-xl font-black text-foreground tracking-tight">Instantanea</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-8 -left-12 z-30 rich-glass p-6 rounded-[2rem] shadow-2xl group hover:scale-105 transition-transform duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Seguranca</p>
                <p className="text-xl font-black text-foreground tracking-tight">Institucional</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative z-20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <IPhoneMockup className="scale-105 origin-center">
              <div className="bg-gradient-to-b from-slate-50 to-white h-full overflow-hidden">
                <div className="p-7 pt-14 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Patrimonio Total</p>
                      <p className="text-4xl font-black tracking-tightest text-foreground mt-2">R$ 152.480</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                      <Wallet className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/90 border border-black/[0.03] p-5 rounded-[2rem] shadow-sm">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">BRL Cash</p>
                      <p className="text-xl font-black text-foreground mt-1">48.2K</p>
                    </div>
                    <div className="bg-white/90 border border-black/[0.03] p-5 rounded-[2rem] shadow-sm">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em]">USDT Balance</p>
                      <p className="text-xl font-black text-primary mt-1">18.4K</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Atividade</p>
                    </div>

                    <div className="p-4 rounded-[2rem] bg-white border border-black/[0.02] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">PIX Recebido</p>
                          <p className="text-[10px] text-muted-foreground font-bold">Hoje, 14:32</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-emerald-500">+R$ 12.000</p>
                    </div>

                    <div className="p-4 rounded-[2rem] bg-white border border-black/[0.02] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <RefreshCw className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">Swap BRL → USDT</p>
                          <p className="text-[10px] text-muted-foreground font-bold">Hoje, 15:45</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-primary">-$ 2.450</p>
                    </div>

                    <div className="p-4 rounded-[2rem] bg-white border border-black/[0.02] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <ArrowUpRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">Saque USDT</p>
                          <p className="text-[10px] text-muted-foreground font-bold">Ontem, 09:12</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-blue-500">-$ 500</p>
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
