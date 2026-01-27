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
    { href: "#precos", label: "Precos" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:pt-6"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 120, damping: 25 }}
          className={`mx-auto flex items-center justify-between transition-all duration-700 liquid-glass rounded-3xl ${
            scrolled
              ? "px-6 py-3 max-w-4xl mt-4"
              : "px-8 py-5 max-w-7xl mt-2 border-white/80"
          }`}
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              className="flex items-center gap-3 group"
              href="/"
              onClick={handleNavClick}
            >
<motion.img
                  src="/images/logo.png"
                  alt="OtsemPay Logo"
                  className="w-9 h-9 object-contain relative z-10"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                />
              <span className="text-[1.65rem] font-black tracking-tighter flex items-center">
                <span className="text-violet-600">Otsem</span>
                <span className="text-slate-900">Pay</span>
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="relative px-5 py-2.5 text-sm font-black text-slate-600 transition-all hover:text-violet-600 rounded-2xl hover:bg-violet-50"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <motion.div whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                onClick={handleNavClick}
                className="text-sm font-black text-slate-600 hover:text-violet-600 transition-colors px-2"
              >
                Entrar
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" onClick={handleButtonClick}>
                <button
                  type="button"
                  className="btn-premium py-3 px-8 rounded-2xl text-sm shadow-2xl shadow-primary/40"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  Criar conta
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.button
            className="flex items-center justify-center w-10 h-10 rounded-xl glass-nav md:hidden"
            onClick={toggleMenu}
            whileTap={{ scale: 0.92 }}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5 text-slate-800" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5 text-slate-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-white/40 backdrop-blur-xl z-40 md:hidden"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-24 z-50 md:hidden"
            >
              <div className="liquid-glass rounded-3xl p-4 shadow-2xl overflow-hidden">
                <nav className="space-y-1">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-5 py-4 text-base font-bold text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all"
                    >
                      {link.label}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </motion.a>
                  ))}

                  <div className="h-px bg-slate-200 my-2 mx-4" />

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-5 py-4 text-base font-bold text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all"
                    >
                      Entrar
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </Link>
                  </motion.div>
                </nav>

                <div className="mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <Link
                      href="/register"
                      onClick={() => {
                        haptic.medium();
                        setMobileMenuOpen(false);
                      }}
                      className="block"
                    >
                      <button className="w-full btn-premium py-4 rounded-2xl text-base shadow-xl shadow-primary/30">
                        <Sparkles className="w-5 h-5" />
                        Criar conta agora
                      </button>
                    </Link>
                  </motion.div>
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
