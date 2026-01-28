"use client";

import React, { useCallback } from "react";
import { Check, ArrowLeftRight, TrendingUp } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";

const Pricing = () => {
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const plans = [
    {
      name: "Operação OTC",
      description: "Spread que diminui com volume",
      priceLabel: "A partir de",
      price: "0.98%",
      priceSuffix: "por transação",
      features: [
        "Liquidação imediata",
        "0% IOF (isento)",
        "Contratos personalizados",
        "Suporte dedicado"
      ],
      cta: "Começar agora",
        icon: ArrowLeftRight,
      popular: false,
    },
      {
          name: "Alta Volumetria",
          description: "Para operações acima de R$ 500k",
          priceLabel: "Taxa sob",
          price: "Consulta",
          priceSuffix: "por transação",
          features: [
            "Spreads negociáveis",
            "Atendimento VIP",
            "Mesa OTC dedicada",
            "Condições especiais"
          ],
          cta: "Falar com especialista",
          icon: TrendingUp,
          popular: true,
        }
  ];

  return (
    <section id="precos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/12 text-primary font-semibold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            Preços Claros
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-slate-900">
            Taxas transparentes
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
            Sem taxas ocultas. Você sabe exatamente quanto vai pagar.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-3 sm:gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative ios-card-premium group ${
                plan.popular
                  ? "ring-2 ring-primary/25 bg-primary/[0.02]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-2.5 py-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-white bg-primary rounded-full shadow-md">
                    Mais Popular
                  </span>
                </div>
              )}

                <div className="mb-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {'icon' in plan && plan.icon ? (
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${plan.popular ? 'bg-primary text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
                        <plan.icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                    ) : null}
                    <h3 className="text-[14px] sm:text-base font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">{plan.description}</p>
                </div>

              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">{plan.priceLabel}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{plan.priceSuffix}</span>
                </div>
              </div>

              <ul className="mb-4 space-y-1.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                    </div>
                    <span className="text-[12px] text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" onClick={handleButtonClick} className="block">
                <button
                  className={`w-full rounded-xl py-3 text-[12px] sm:text-[13px] font-semibold transition-all active:scale-[0.98] ${
                    plan.popular
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
