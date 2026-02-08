"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Header = () => {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback(() => {
    haptic.light();
  }, []);

  const handleButtonClick = useCallback(() => {
    haptic.medium();
  }, []);

  const toggleMenu = useCallback(() => {
    haptic.impact();
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const navLinks = [
    { href: "#como-funciona", label: t("nav.howItWorks") },
    { href: "#recursos", label: t("nav.features") },
    { href: "#precos", label: t("nav.pricing") },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-2 sm:pt-3">
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 rounded-2xl ${
            scrolled
              ? "px-3 sm:px-4 py-2 max-w-2xl sm:max-w-3xl mt-1 bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)]"
              : "px-4 sm:px-5 py-2.5 sm:py-3 max-w-5xl sm:max-w-6xl mt-0.5 bg-white/60 backdrop-blur-lg border border-slate-200/40 shadow-[0_1px_8px_-4px_rgba(0,0,0,0.04)]"
          }`}
        >
          <Link
            className="flex items-center gap-2 group"
            href="/"
            onClick={handleNavClick}
          >
            <Image
              src="/images/logo-64.png"
              alt="Otsem Pay Logo"
              width={32}
              height={32}
              priority
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain relative z-10 transition-transform duration-150 group-hover:scale-105"
            />
            <span className="text-[1.35rem] font-black tracking-tighter flex items-center gap-1">
              <span className="text-primary">Otsem</span>
              <span className="text-slate-900">Pay</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="relative px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold text-slate-500 transition-all hover:text-slate-900 rounded-xl hover:bg-slate-100/70"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher className="text-slate-500" />
            <Link
              href="/login"
              onClick={handleNavClick}
              className="text-[12px] sm:text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1.5"
            >
              {t("common.login")}
            </Link>
            <Link href="/register" onClick={handleButtonClick}>
              <button
                type="button"
                className="py-2 px-4 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all duration-150 active:scale-[0.98] bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:bg-[#5800CC]"
              >
                {t("common.register")}
              </button>
            </Link>
          </div>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 md:hidden ios-touch-effect transition-transform duration-150 active:scale-95"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-slate-700" />
            ) : (
              <Menu className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-x-3 top-16 z-50 md:hidden"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-2.5 shadow-xl overflow-hidden">
                <nav className="space-y-0.5">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          haptic.selection();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center px-3 py-3 text-[14px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all ios-touch-effect"
                      >
                        {link.label}
                      </a>
                    ))}

                    <div className="h-px bg-slate-100 my-1 mx-2" />

                    <LanguageSwitcher className="text-slate-500 justify-start px-3 py-3" />

                    <Link
                      href="/login"
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-3 text-[14px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all ios-touch-effect"
                    >
                      {t("common.login")}
                    </Link>
                </nav>

                <div className="mt-1.5 px-1">
                  <Link
                    href="/register"
                    onClick={() => {
                      haptic.medium();
                      setMobileMenuOpen(false);
                    }}
                    className="block"
                  >
                    <button className="w-full py-3 rounded-xl text-[14px] font-semibold bg-primary text-white shadow-md shadow-primary/20 active:scale-[0.98] transition-transform">
                      {t("common.register")}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
