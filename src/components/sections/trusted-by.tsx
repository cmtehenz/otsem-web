"use client";

import React from "react";
import { motion } from "framer-motion";

const TrustedBy = () => {
  const logos = [
    { name: "OKX", width: 80, height: 30 },
    { name: "Binance", width: 100, height: 30 },
    { name: "Coinbase", width: 100, height: 30 },
    { name: "Kraken", width: 90, height: 30 },
    { name: "Mercado Bitcoin", width: 110, height: 30 },
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white/40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-white/60 border border-white shadow-sm text-primary font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            Ecosystem Partners
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.05 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900 leading-tight"
          >
            Confiado por os gigantes do mercado
          </motion.h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 18,
                delay: index * 0.04
              }}
              className="group relative ios-touch-effect"
            >
              <div className="opacity-40 grayscale hover:grayscale-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105 filter drop-shadow-sm">
                <div className="h-6 sm:h-8 md:h-9 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold text-slate-600">
                  {logo.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
