"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Scan,
  ShieldCheck,
  Globe2,
  Zap,
  ShieldAlert,
  KeyRound,
  FileCheck2
} from "lucide-react";

const FeaturesGrid = () => {
  const secondaryFeatures = [
    {
      icon: ArrowLeftRight,
      title: "Conversão instantânea",
      description: "BRL ↔ USDT em segundos"
    },
    {
      icon: Scan,
      title: "PIX integrado",
      description: "Depósitos e saques rápidos"
    },
    {
      icon: ShieldCheck,
      title: "Segurança total",
      description: "Criptografia de ponta"
    },
    {
      icon: Globe2,
      title: "Sem fronteiras",
      description: "Opere de qualquer lugar"
    }
  ];

  const mainFeatures = [
    {
      icon: FileCheck2,
      title: "Flexibilidade Contratual",
      description: "Contratos ajustados entre as partes. Condições personalizadas.",
    },
    {
      icon: Zap,
      title: "Maior Agilidade",
      description: "Negociações rápidas e adaptadas à urgência.",
    },
    {
      icon: KeyRound,
      title: "Confidencialidade",
      description: "Transações não são públicas como nas bolsas.",
    },
    {
      icon: ShieldAlert,
      title: "Segurança e Compliance",
      description: "KYC rigoroso e monitoramento 24/7.",
    },
  ];

  return (
    <section id="recursos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-16 sm:mb-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-5">
                Recursos Premium
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
                Ecossistema <br />
                <span className="text-primary">completo.</span>
              </h2>
              <p className="mt-5 text-base text-slate-600 leading-relaxed font-medium max-w-sm">
                Ferramentas de elite para gerenciar suas conversões com privacidade e velocidade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.08 }}
              className="grid gap-3 grid-cols-2"
            >
              {secondaryFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 18,
                    delay: index * 0.05
                  }}
                  className="ios-card group active:scale-[0.98] transition-transform duration-200"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[13px] sm:text-sm tracking-tight">{feature.title}</h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium leading-snug">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 18,
                delay: index * 0.08
              }}
              className="ios-card-elevated group active:scale-[0.98] transition-transform duration-200"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 transition-transform duration-300 group-hover:scale-105">
                <feature.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
