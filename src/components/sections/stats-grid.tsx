"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe2, Timer, BadgeCheck } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "US$ 415B",
    label: "Mercado OTC global",
    color: "bg-primary/8",
    iconColor: "text-primary",
  },
  {
    icon: Globe2,
    value: "9.1%",
    label: "Volume LATAM global",
    color: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    icon: Timer,
    value: "Imediato",
    label: "Liquidação ultra-rápida",
    color: "bg-primary/8",
    iconColor: "text-primary",
  },
  {
    icon: BadgeCheck,
    value: "0% IOF",
    label: "Sem imposto",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const StatsGrid = () => {
  return (
    <section className="relative z-10 section-padding overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.04, 0.07, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] max-w-[600px] max-h-[600px] -z-20 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_70%)] pointer-events-none"
      />

      <div className="container mx-auto container-mobile">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-yellow-400 text-yellow-950 font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-6 shadow-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-950 animate-pulse" />
            Sistema sem fronteiras
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.08 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tightest max-w-lg leading-[1.1] text-slate-900"
          >
            Poder financeiro <br />
            <span className="text-primary">sem fronteiras.</span>
          </motion.h2>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.06,
              }}
              className="relative group"
            >
              <div className="ios-card-elevated h-full flex flex-col transition-all duration-300 active:scale-[0.98]">
                <div className="space-y-4 sm:space-y-6">
                  <div
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${stat.color} border border-slate-100 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <stat.icon
                      className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${stat.iconColor}`}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-1.5 flex items-baseline gap-1.5">
                      {stat.value}
                      {stat.value.includes("%") && (
                        <span className="text-yellow-500 text-lg">↑</span>
                      )}
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold uppercase tracking-wider leading-snug">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
