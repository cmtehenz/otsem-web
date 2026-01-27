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
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 sm:pt-4"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          className={`mx-auto flex items-center justify-between transition-all duration-500 ios-glass rounded-2xl ${
            scrolled
              ? "px-4 py-2.5 max-w-3xl mt-2"
              : "px-5 py-3.5 max-w-6xl mt-1"
          }`}
        >
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link
              className="flex items-center gap-2.5 group"
              href="/"
              onClick={handleNavClick}
            >
              <motion.img
                src="/images/logo.png"
                alt="OtsemPay Logo"
                className="w-8 h-8 object-contain relative z-10"
                whileHover={{ rotate: 6, scale: 1.05 }}
              />
              <span className="text-xl font-bold tracking-tight flex items-center">
                <span className="text-primary">Otsem</span>
                <span className="text-slate-900">Pay</span>
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="relative px-4 py-2 text-[13px] font-semibold text-slate-600 transition-all hover:text-primary rounded-xl hover:bg-primary/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                onClick={handleNavClick}
                className="text-[13px] font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2"
              >
                Entrar
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/register" onClick={handleButtonClick}>
                <button
                  type="button"
                  className="btn-premium py-2.5 px-5 rounded-xl text-[13px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Criar conta
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.button
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/80 md:hidden ios-spring"
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
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-4.5 h-4.5 text-slate-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-4.5 h-4.5 text-slate-700" />
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
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-4 top-20 z-50 md:hidden"
            >
              <div className="ios-glass rounded-2xl p-3 shadow-xl overflow-hidden">
                <nav className="space-y-0.5">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-[0.98]"
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </motion.a>
                  ))}

                  <div className="h-px bg-slate-200/60 my-1.5 mx-3" />

                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <Link
                      href="/login"
                      onClick={() => {
                        haptic.selection();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-[0.98]"
                    >
                      Entrar
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </Link>
                  </motion.div>
                </nav>

                <div className="mt-2 px-1.5">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                  >
                    <Link
                      href="/register"
                      onClick={() => {
                        haptic.medium();
                        setMobileMenuOpen(false);
                      }}
                      className="block"
                    >
                      <button className="w-full btn-premium py-3.5 rounded-xl text-[15px]">
                        <Sparkles className="w-4 h-4" />
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
