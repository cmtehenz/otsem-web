"use client";

import React from "react";

const TrustedBy = () => {
  const logos = [
    { name: "Bitso", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462967.png" },
    { name: "Kraken", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462968.png" },
    { name: "Mercado Bitcoin", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462976.png" },
    { name: "Wolf", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462977.png" },
    { name: "Coinbase", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462981.png" },
    { name: "Binance", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462983.png" },
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-white/40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1.5 rounded-full bg-white/60 border border-white shadow-sm text-primary font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            Parceiros do Ecossistema
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tightest text-slate-900 leading-tight">
            Confiado por os gigantes do mercado
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {logos.map((logo) => (
              <div
                key={logo.name}
                className="group relative ios-touch-effect"
              >
                <div className="transition-all duration-500 group-hover:scale-105">
                    <img 
                      src={logo.src} 
                      alt={logo.name} 
                      className="h-8 sm:h-10 md:h-12 w-auto object-contain"
                    />
                  </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
