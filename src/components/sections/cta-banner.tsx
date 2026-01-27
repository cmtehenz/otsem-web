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
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-primary" />

          <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-violet-400/15 rounded-full blur-2xl" />

          <div className="relative z-10 p-8 sm:p-12 md:p-14 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.08 }}
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white/15 border border-white/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white">Oferta limitada</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.12 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-white mb-5 leading-tight"
            >
              Pronto para mover seu <br className="hidden sm:block" /> capital com liberdade?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.16 }}
              className="max-w-md mx-auto text-sm sm:text-base text-white/80 leading-relaxed font-medium mb-8"
            >
              Crie sua conta gratuitamente e comece a transacionar BRL e USDT em minutos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8"
            >
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/register" onClick={handleButtonClick} className="block">
                  <button className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white text-primary font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg">
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link href="/login" onClick={() => haptic.light()} className="block">
                  <button className="w-full sm:w-auto h-12 px-7 rounded-xl border border-white/25 bg-white/10 text-white font-semibold text-[14px]">
                    Já tenho conta
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.24 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-[11px] sm:text-[12px] font-medium text-white/70">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
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
