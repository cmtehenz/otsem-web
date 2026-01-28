"use client";

import React from "react";
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
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/12 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Fluxo Inteligente
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-slate-900 leading-[1.1]">
            Como funciona <br />
            <span className="text-primary">o ecossistema.</span>
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative ios-card-premium"
            >
              <span
                className="absolute right-4 top-4 text-xl sm:text-2xl font-bold text-primary/15 select-none pointer-events-none"
                aria-hidden="true"
              >
                {step.id}
              </span>

              <div className="relative z-10 space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/12 transition-transform duration-300 group-hover:scale-105">
                  <step.icon
                    className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
                    strokeWidth={1.75}
                  />
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-slate-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
