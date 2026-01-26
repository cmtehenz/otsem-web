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

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
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
              className={`relative premium-card group ${
                plan.popular
                  ? "border-primary/30 shadow-primary/10"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 right-8 z-20">
                  <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-primary rounded-full shadow-xl shadow-primary/40">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 ${plan.popular ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-primary/10 text-primary'}`}>
                    <plan.icon className="h-7 w-7" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                </div>
                <p className="text-base text-muted-foreground font-semibold">{plan.description}</p>
              </div>

              <div className="mb-10 p-6 rounded-3xl bg-black/[0.02] border border-black/[0.03]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{plan.priceLabel}</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                  <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{plan.priceSuffix}</span>
                </div>
              </div>

              <ul className="mb-10 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={4} />
                    </div>
                    <span className="text-base text-slate-700 font-bold">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" onClick={handleButtonClick}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-2xl py-5 text-base font-black transition-all shadow-2xl ${
                    plan.popular
                      ? "btn-premium"
                      : "btn-premium-outline"
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
