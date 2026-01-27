"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Landmark, ArrowLeftRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: "01",
      icon: UserPlus,
      title: "Crie sua conta",
      description:
        "Cadastro rápido com verificação KYC em minutos. Só precisamos de alguns dados básicos.",
    },
    {
      id: "02",
      icon: Landmark,
      title: "Deposite via PIX",
      description:
        "Transfira BRL para sua carteira usando PIX. O saldo é creditado instantaneamente.",
    },
    {
      id: "03",
      icon: ArrowLeftRight,
      title: "Converta para USDT",
      description:
        "Com um clique, converta seu saldo para USDT com a melhor taxa do mercado.",
    },
  ];

  return (
    <section id="como-funciona" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Fluxo Inteligente
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
            Como funciona <br />
            <span className="text-primary">o ecossistema.</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 18,
                delay: index * 0.08,
              }}
              className="group relative ios-card-elevated active:scale-[0.98] transition-transform duration-200"
            >
              <span
                className="absolute right-5 top-5 text-2xl sm:text-3xl font-bold text-primary/20 select-none pointer-events-none"
                aria-hidden="true"
              >
                {step.id}
              </span>

              <div className="relative z-10 space-y-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 transition-transform duration-300 group-hover:scale-105">
                  <step.icon
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.75}
                  />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
