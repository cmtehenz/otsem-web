"use client";

import React from "react";
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
        <div className="mb-12 sm:mb-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/12 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
                Recursos Premium
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
                Ecossistema <br />
                <span className="text-primary">completo.</span>
              </h2>
              <p className="mt-4 text-[14px] sm:text-base text-slate-600 leading-relaxed font-medium max-w-sm">
                Ferramentas de elite para gerenciar suas conversões com privacidade e velocidade.
              </p>
            </div>

            <div className="grid gap-2.5 sm:gap-3 grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="ios-card-premium group"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[12px] sm:text-[13px] tracking-tight">{feature.title}</h3>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium leading-snug">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 sm:gap-3 grid-cols-2 lg:grid-cols-4">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="ios-card-premium group"
            >
              <div className="mb-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/12 transition-transform duration-300 group-hover:scale-105">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="text-[12px] sm:text-[14px] font-semibold text-slate-900 mb-1 tracking-tight">{feature.title}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
