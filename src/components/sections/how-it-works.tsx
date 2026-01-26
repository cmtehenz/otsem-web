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
    <section id="como-funciona" className="relative z-10 py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="mb-16 lg:mb-24 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Fluxo Inteligente
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-slate-900 leading-[0.9]">
            Como funciona <br />
            <span className="text-violet-500 text-3xl md:text-5xl lg:text-6xl">
              o ecossistema.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 25,
                delay: index * 0.1,
              }}
              className="group relative rich-glass rounded-[2.5rem] p-8 sm:p-10 border border-white/40 shadow-xl shadow-black/5"
            >
              <span
                className="absolute right-8 top-8 text-4xl font-black text-violet-500 select-none pointer-events-none group-hover:text-violet-700 transition-colors duration-500"
                aria-hidden="true"
              >
                {step.id}
              </span>

              <div className="relative z-10 space-y-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-primary/10 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <step.icon
                    className="h-7 w-7 text-primary"
                    strokeWidth={1.5}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 mb-4 transition-colors group-hover:text-violet-600">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
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
