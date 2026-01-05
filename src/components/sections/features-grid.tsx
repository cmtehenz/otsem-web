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
      title: "Conversao instantanea",
      description: "BRL ↔ USDT em segundos"
    },
    {
      icon: Scan,
      title: "PIX integrado",
      description: "Depositos e saques rapidos"
    },
    {
      icon: ShieldCheck,
      title: "Seguranca total",
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
      description: "Contratos ajustados entre as partes. Condicoes de valores, prazos e volumes personalizados.",
    },
    {
      icon: Zap,
      title: "Maior Agilidade",
      description: "Negociacoes rapidas e adaptadas a urgencia. Liquidacao em 10 a 30 minutos.",
    },
    {
      icon: KeyRound,
      title: "Confidencialidade",
      description: "Transacoes nao sao publicas como nas bolsas. Vantagem estrategica para alto volume.",
    },
    {
      icon: ShieldAlert,
      title: "Seguranca e Compliance",
      description: "Operamos dentro de todas as regulamentacoes. KYC rigoroso e monitoramento 24/7.",
    },
  ];

  return (
    <section id="recursos" className="relative z-10 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-24 sm:mb-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8">
                Recursos Premium
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tightest text-slate-900 leading-[1.1]">
                Ecossistema <br />
                <span className="text-primary/40">completo.</span>
              </h2>
              <p className="mt-8 text-lg text-muted-foreground leading-relaxed font-semibold max-w-md">
                Ferramentas de elite para gerenciar suas conversoes com total privacidade e velocidade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="grid gap-6 grid-cols-2"
            >
              {secondaryFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: index * 0.05
                  }}
                  className="liquid-glass rounded-[2rem] p-6 border-white/40 group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 transition-all duration-500 group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-black text-slate-900 text-[15px] tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-[12px] text-muted-foreground font-semibold leading-snug">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.1
              }}
              className="liquid-glass p-10 rounded-[3rem] border-white/40 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                <feature.icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
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
