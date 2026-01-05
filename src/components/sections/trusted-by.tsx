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
    <section className="relative py-20 overflow-hidden bg-white/40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-white shadow-sm text-primary font-bold text-xs uppercase tracking-widest mb-4">
            Ecosystem Partners
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-3xl md:text-4xl font-black text-foreground"
          >
            Confiado por os gigantes do mercado
          </motion.h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                delay: index * 0.05
              }}
              className="group relative"
            >
              <div className="opacity-40 grayscale hover:grayscale-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110 filter drop-shadow-sm">
                <div className="h-8 md:h-10 flex items-center justify-center text-2xl font-black text-slate-600">
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
