"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe2, Timer, BadgeCheck } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "US$ 415B",
    label: "Mercado OTC global em 2024",
    color: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: Globe2,
    value: "9.1%",
    label: "Volume LATAM do mercado global",
    color: "bg-yellow-400/5",
    iconColor: "text-yellow-600",
  },
  {
    icon: Timer,
    value: "10-30m",
    label: "Tempo de liquidacao ultra-rapida",
    color: "bg-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: BadgeCheck,
    value: "0% IOF",
    label: "Sem imposto sobre operacoes",
    color: "bg-emerald-500/5",
    iconColor: "text-emerald-600",
  },
];

const StatsGrid = () => {
  return (
    <section className="relative z-10 py-24 lg:py-40 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] -z-20 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_70%)] pointer-events-none"
      />

      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-yellow-400 text-yellow-950 font-black text-[10px] uppercase tracking-[0.4em] mb-8 shadow-xl shadow-yellow-400/20"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-950 animate-pulse" />
              SISTEMA BANCÁRIO SEM FRONTEIRAS

          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.1,
            }}
className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tightest max-w-5xl leading-[0.9] text-slate-900"
            >
              Poder financeiro <br />
              <span className="text-primary">sem fronteiras.</span>
          </motion.h2>
        </div>

<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 25,
                  delay: index * 0.05,
                }}
                className="relative group"
              >
              <div className="rich-glass p-8 lg:p-10 rounded-[2.5rem] h-full flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 group-hover:bg-white/60">
                <div className="space-y-8">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color} border border-white/60 shadow-xl shadow-black/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <stat.icon
                      className={`h-7 w-7 ${stat.iconColor}`}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div>
                    <div className="text-4xl lg:text-6xl font-black tracking-tightest text-slate-900 mb-4 flex items-baseline gap-2">
                      {stat.value}
                      {stat.value.includes("%") && (
                        <span className="text-yellow-500 text-2xl">↑</span>
                      )}
                    </div>

                    <div className="text-[10px] lg:text-xs text-muted-foreground font-black uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
                      {stat.label}
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${stat.iconColor} opacity-0 group-hover:opacity-[0.05] blur-[60px] -z-10 rounded-full transition-opacity duration-700`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsGrid;
