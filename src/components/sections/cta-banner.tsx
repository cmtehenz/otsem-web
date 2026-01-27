"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";

const CTABanner = () => {
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const benefits = [
    "Cadastro grátis",
    "Sem mensalidade",
    "Cancelar quando quiser"
  ];

  return (
    <section className="relative z-10 section-padding container-mobile">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-primary animate-gradient-shift" />

          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-violet-400/12 rounded-full blur-2xl" />

          <div className="relative z-10 p-6 sm:p-10 md:p-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.06 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/12 border border-white/15"
            >
              <Sparkles className="h-3 w-3 text-white" strokeWidth={2} />
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white">Oferta limitada</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.1 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-white mb-4 leading-tight"
            >
              Pronto para mover seu <br className="hidden sm:block" /> capital com liberdade?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.14 }}
              className="max-w-md mx-auto text-[13px] sm:text-[14px] text-white/75 leading-relaxed font-medium mb-6"
            >
              Crie sua conta gratuitamente e comece a transacionar BRL e USDT em minutos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.18 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mb-6"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/register" onClick={handleButtonClick} className="block">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-primary font-semibold text-[13px] flex items-center justify-center gap-2 shadow-lg ios-touch-effect">
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/login" onClick={() => haptic.light()} className="block">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-xl border border-white/20 bg-white/8 text-white font-semibold text-[13px] ios-touch-effect">
                    Já tenho conta
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.22 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-5"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-white/65">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white/15">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
