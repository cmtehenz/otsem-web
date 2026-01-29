"use client";

import React from "react";
import Link from "next/link";
import { Instagram } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    produto: [
      { label: "Recursos", href: "#recursos" },
      { label: "Precos", href: "#precos" },
      { label: "API", href: "#" },
      { label: "Integracoes", href: "#" },
    ],


  };

  const openExternalUrl = (url: string) => {
    if (typeof window !== "undefined") {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    }
  };

  const handleInstagramClick = () => {
    openExternalUrl("https://instagram.com/otsempay");
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
    <footer className="relative z-10 w-full px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden bg-white/40 backdrop-blur-md mobile-safe-area">
      <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-8 sm:gap-10 lg:gap-12">
            <div className="lg:max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group ios-touch-effect">
                <img
                  src="/images/logo-light.png"
                  alt="Otsem Pay Logo"
                  className="w-9 h-9 object-contain transition-transform duration-500 group-hover:rotate-12"
                />
                <span className="text-[1.35rem] font-black tracking-tighter flex items-center gap-1">
                  <span className="text-primary">Otsem</span>
                  <span className="text-slate-900">Pay</span>
                </span>
              </Link>
              <p className="max-w-[280px] text-[13px] sm:text-[14px] text-slate-500 leading-relaxed font-medium mb-6">
                Redefinindo a liquidez global com tecnologia de ponta e seguranca absoluta. Sua ponte entre o tradicional e o digital.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-bold text-yellow-600 uppercase tracking-[0.15em]">Plataforma Financeira Global</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
              <div>
                <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Produto</h3>
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
                <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Legal</h3>
                <ul className="space-y-2 sm:space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={handleTermosClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Termos de uso
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handlePrivacidadeClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Privacidade
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleCookiesClick}
                      className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      Cookies
                    </button>
                  </li>
                  <li>
                    <Link href="#" className="text-[13px] sm:text-[14px] font-medium text-slate-500 transition-colors hover:text-primary ios-touch-effect inline-block">
                      Status
                    </Link>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={handleInstagramClick}
                  className="mt-5 sm:mt-6 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#6F00FF] via-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/25 hover:scale-105 active:scale-95 transition-transform"
                  aria-label="Seguir no Instagram"
                >
                  <Instagram className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

        <div className="mt-12 sm:mt-16 flex flex-col items-center justify-between gap-3 border-t border-foreground/[0.05] pt-6 sm:pt-8 sm:flex-row">
          <p className="text-[11px] sm:text-[12px] font-medium text-slate-400">
            © 2026 Otsem Pay. Todos os direitos reservados.
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
