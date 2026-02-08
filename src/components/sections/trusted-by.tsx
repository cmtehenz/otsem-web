"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const TrustedBy = () => {
  const t = useTranslations("trustedBy");
  const logos = [
    { name: "Bitso", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462967.png" },
    { name: "Kraken", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462968.png" },
    { name: "Mercado Bitcoin", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462976.png" },
    { name: "Wolf", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462977.png" },
    { name: "Coinbase", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462981.png" },
    { name: "Binance", src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769575462983.png" },
  ];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] mb-4">
            {t("badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tightest text-slate-900 leading-tight">
            {t("title")}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {logos.map((logo) => (
              <div
                key={logo.name}
                className="group relative ios-touch-effect"
              >
                <div className="transition-all duration-500 group-hover:scale-105 opacity-60 grayscale hover:opacity-100 hover:grayscale-0">
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={120}
                      height={48}
                      loading="lazy"
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
