"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Headphones } from "lucide-react";
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
      price: "3%",
      priceSuffix: "por transação",
      features: [
        "Liquidação imediata",
        "0% IOF (isento)",
        "Contratos personalizados",
        "Suporte dedicado"
      ],
      cta: "Começar agora",
      icon: Sparkles,
      popular: false,
    },
    {
      name: "Alta Volumetria",
      description: "Para operações acima de R$ 500k",
      priceLabel: "Taxa sob",
      price: "consulta",
      priceSuffix: "por transação",
      features: [
        "Spreads negociáveis",
        "Atendimento VIP",
        "Mesa OTC dedicada",
        "Condições especiais"
      ],
      cta: "Falar com especialista",
      icon: Headphones,
      popular: true,
    }
  ];

  return (
    <section id="precos" className="relative z-10 section-padding">
      <div className="mx-auto max-w-5xl container-mobile">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-5">
            Preços Claros
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900">
            Taxas transparentes
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Sem taxas escondidas. Você sabe exatamente quanto vai pagar.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-3xl gap-4 sm:gap-5 md:grid-cols-2">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 18,
                delay: index * 0.08
              }}
              className={`relative ios-card-elevated group active:scale-[0.99] transition-transform duration-200 ${
                plan.popular
                  ? "ring-2 ring-primary/30 bg-primary/[0.02]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white bg-primary rounded-full shadow-md">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${plan.popular ? 'bg-primary text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
                    <plan.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                </div>
                <p className="text-[12px] sm:text-[13px] text-slate-500 font-medium">{plan.description}</p>
              </div>

              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{plan.priceLabel}</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{plan.price}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{plan.priceSuffix}</span>
                </div>
              </div>

              <ul className="mb-5 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-2.5 w-2.5 text-emerald-600" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" onClick={handleButtonClick} className="block">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl py-3.5 text-[13px] sm:text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
