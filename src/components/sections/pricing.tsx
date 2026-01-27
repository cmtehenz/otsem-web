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
      description: "Spread que diminui com volumetria",
      priceLabel: "A partir de",
      price: "3%",
      priceSuffix: "por transação",
      features: [
        "Liquidação em 10-30 min",
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
    <section id="precos" className="relative z-10 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-12 sm:mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] uppercase tracking-wider mb-6">
            Preços Claros
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tightest text-slate-900">Taxas transparentes</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 font-medium leading-relaxed">
            Sem taxas escondidas. Você sabe exatamente quanto vai pagar em cada operação.
          </p>
        </motion.div>

<div className="mx-auto grid max-w-5xl gap-6 lg:gap-8 md:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: index * 0.1
                }}
                className={`relative p-8 lg:p-10 rounded-3xl bg-white border group transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? "border-primary/40 shadow-xl shadow-primary/10"
                    : "border-slate-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-5 py-2 text-[11px] font-black uppercase tracking-widest text-white bg-primary rounded-full shadow-lg shadow-primary/30">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${plan.popular ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary'}`}>
                      <plan.icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{plan.description}</p>
                </div>

                <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{plan.priceLabel}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-semibold">{plan.priceSuffix}</span>
                  </div>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-slate-700 font-semibold">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" onClick={handleButtonClick}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl py-4 text-sm font-bold transition-all ${
                      plan.popular
                        ? "bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                        : "bg-slate-900 text-white hover:bg-slate-800"
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
