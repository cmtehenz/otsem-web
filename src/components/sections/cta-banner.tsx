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
    "Cadastro gratis",
    "Sem mensalidade",
    "Cancelar quando quiser"
  ];

  return (
    <section className="relative z-10 py-16 sm:py-24 px-5 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="relative overflow-hidden rounded-[3rem] shadow-2xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#7c3aed]" />

          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

          <div className="relative z-10 p-10 sm:p-16 md:p-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Oferta limitada</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.15 }}
              className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tightest text-white mb-8 leading-tight"
            >
              Pronto para mover seu <br /> capital com liberdade?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              className="max-w-xl mx-auto text-base sm:text-lg text-white/80 leading-relaxed font-semibold mb-12"
            >
              Crie sua conta gratuitamente e comece a transacionar BRL e USDT em minutos.
              Sem taxas de adesao, sem complicacoes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link href="/register" onClick={handleButtonClick}>
                  <button className="h-16 px-12 rounded-2xl bg-white text-primary font-black text-[15px] flex items-center gap-3 shadow-2xl shadow-black/10 hover:shadow-white/20 transition-all uppercase tracking-tight">
                    Criar conta gratis
                    <ArrowRight className="w-5 h-5" strokeWidth={3} />
                  </button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link href="/login" onClick={() => haptic.light()}>
                  <button className="h-16 px-12 rounded-2xl border border-white/20 bg-white/5 text-white font-black text-[15px] backdrop-blur-sm hover:bg-white/10 transition-all uppercase tracking-tight">
                    Ja tenho conta
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 sm:gap-12"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-[12px] font-black text-white/70">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 border border-white/30">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                  </div>
                  <span className="uppercase tracking-widest">{benefit}</span>
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
