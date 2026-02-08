"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");

  const footerLinks = {
    produto: [
      { label: t("resources"), href: "#recursos" },
      { label: t("prices"), href: "#precos" },
    ],


  };

  const openExternalUrl = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleInstagramClick = () => {
    openExternalUrl("https://www.instagram.com/otsempay");
  };

  const handleTermosClick = () => {
    openExternalUrl("https://drive.google.com/file/d/1w5iM6U1BRHhKemNVXcKiEc1TJ1YjqFCu/view?usp=share_link");
  };

  const handlePrivacidadeClick = () => {
    openExternalUrl("https://drive.google.com/file/d/1X0RHbjkm9uG9k_v7wqBIKMVWkbKI8Qcv/view?usp=share_link");
  };

  const handleCookiesClick = () => {
    openExternalUrl("https://drive.google.com/file/d/1YNdbDQsdICp700B7O6RSOi2oHmbgcn6S/view?usp=share_link");
  };

  return (
    <footer className="relative z-10 w-full px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden bg-slate-50 border-t border-slate-200/60 mobile-safe-area">
      <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 sm:gap-10 lg:gap-12">
            <div className="lg:max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group ios-touch-effect">
                <Image
                  src="/images/logo-64.png"
                  alt="Otsem Pay Logo"
                  width={36}
                  height={36}
                  loading="lazy"
                  className="w-9 h-9 object-contain transition-transform duration-500 group-hover:rotate-12"
                />
                <span className="text-[1.35rem] font-black tracking-tighter flex items-center gap-1">
                  <span className="text-primary">Otsem</span>
                  <span className="text-slate-900">Pay</span>
                </span>
              </Link>
              <p className="max-w-[280px] text-[13px] sm:text-[14px] text-slate-500 leading-relaxed font-medium mb-6">
                {t("description")}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-[0.15em]">{t("globalPlatform")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              <div>
                <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{t("product")}</h3>
                <ul className="space-y-2 sm:space-y-2.5">
                  {footerLinks.produto.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">{t("legal")}</h3>
                <ul className="space-y-2 sm:space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={handleTermosClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {t("terms")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handlePrivacidadeClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {t("privacy")}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleCookiesClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {t("cookies")}
                    </button>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={handleInstagramClick}
                  className="mt-5 sm:mt-6 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-lg shadow-pink-500/25 hover:scale-105 active:scale-95 transition-transform"
                  aria-label={t("followInstagram")}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 sm:pt-6 sm:flex-row">
          <p className="text-[11px] sm:text-[12px] font-medium text-slate-400">
            {t("copyright")}{" "}
            <button
              type="button"
              onClick={() => openExternalUrl("https://linktr.ee/0xdeni")}
              className="text-primary hover:underline transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              0xdeni
            </button>
          </p>
          <p className="text-[11px] sm:text-[12px] font-medium text-slate-400">
            CNPJ: 12.474.440/0001-60
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
