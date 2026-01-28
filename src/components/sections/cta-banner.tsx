"use client";

import React, { useCallback } from "react";
import { Check, ArrowRight } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";

const CTABanner = () => {
  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const benefits = [
    "Cadastro grátis",
    "Sem mensalidade",
    "Cancelar quando quiser"
  ];

  return (
    <section className="relative z-10 section-padding container-mobile">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#8B2FFF] to-primary animate-gradient-shift" />

          <div className="absolute -top-16 -left-16 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#6F00FF]/12 rounded-full blur-2xl" />

          <div className="relative z-10 p-6 sm:p-10 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/12 border border-white/15">
                <span className="text-[11px] sm:text-[12px] font-bold tracking-tight text-white">Otsem Pay</span>
              </div>

<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tightest text-white mb-4 leading-tight">
                Pronto para mover seu<br />capital com liberdade?
              </h2>

            <p className="max-w-md mx-auto text-[13px] sm:text-[14px] text-white/75 leading-relaxed font-medium mb-6">
              Crie sua conta gratuitamente e comece a transacionar BRL e USDT em minutos.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mb-6">
              <div className="w-full sm:w-auto">
                <Link href="/register" onClick={handleButtonClick} className="block">
                    <button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-white text-primary font-semibold text-[13px] flex items-center justify-center gap-2 shadow-lg ios-touch-effect active:scale-[0.97] transition-transform">
                      Crie sua conta
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <Link href="/login" onClick={() => haptic.light()} className="block">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-xl border border-white/20 bg-white/8 text-white font-semibold text-[13px] ios-touch-effect active:scale-[0.97] transition-transform">
                    Já tenho conta
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-white/65">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white/15">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
