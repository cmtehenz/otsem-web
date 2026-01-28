"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
import haptic from "@/lib/haptics";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#recursos", label: "Recursos" },
    { href: "#precos", label: "Preços" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-2 sm:pt-3">
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ios-glass rounded-2xl ${
            scrolled
              ? "px-3 sm:px-4 py-2 max-w-2xl sm:max-w-3xl mt-1"
              : "px-4 sm:px-5 py-2.5 sm:py-3 max-w-5xl sm:max-w-6xl mt-0.5"
          }`}
        >
          <Link
            className="flex items-center gap-2 group"
            href="/"
            onClick={handleNavClick}
          >
            <img
              src="/images/logo.png"
              alt="Otsem Pay Logo"
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
                className="relative px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold text-slate-600 transition-all hover:text-primary rounded-xl hover:bg-primary/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              onClick={handleNavClick}
              className="text-[12px] sm:text-[13px] font-semibold text-slate-600 hover:text-primary transition-colors px-2.5 py-1.5"
            >
              Entrar
            </Link>
            <Link href="/register" onClick={handleButtonClick}>
              <button
                type="button"
                className="btn-premium py-2 px-4 rounded-xl text-[12px] sm:text-[13px] transition-transform duration-150 active:scale-[0.98]"
              >
                Crie sua conta
              </button>
            </Link>
          </div>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100/80 md:hidden ios-touch-effect transition-transform duration-150 active:scale-95"
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
              className="fixed inset-0 bg-black/15 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-x-3 top-16 z-50 md:hidden"
            >
              <div className="ios-glass rounded-2xl p-2.5 shadow-xl overflow-hidden">
                <nav className="space-y-0.5">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          haptic.selection();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center px-3 py-3 text-[14px] font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all ios-touch-effect"
                      >
                        {link.label}
                      </a>
                    ))}

                    <div className="h-px bg-slate-200/60 my-1 mx-2" />

                    <Link
                      href="/login"
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-3 text-[14px] font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all ios-touch-effect"
                    >
                      Entrar
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
<button className="w-full btn-premium py-3 rounded-xl text-[14px]">
                        Crie sua conta
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
