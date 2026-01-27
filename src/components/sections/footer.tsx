"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Footer = () => {
  const footerLinks = {
    produto: [
      { label: "Recursos", href: "#recursos" },
      { label: "Precos", href: "#precos" },
      { label: "API", href: "#" },
      { label: "Integracoes", href: "#" },
    ],
    empresa: [
      { label: "Sobre nos", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Contato", href: "#" },
    ],
    legal: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "/privacidade" },
      { label: "Cookies", href: "/cookies" },
      { label: "Status", href: "#" },
    ],
  };

  return (
    <footer className="relative z-10 w-full px-5 sm:px-6 pt-24 pb-12 overflow-hidden bg-white/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 lg:col-span-2"
          >
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <img
                src="/images/logo-light.png"
                alt="OtsemPay Logo"
                className="w-10 h-10 object-contain transition-transform duration-500 group-hover:rotate-12"
              />
              <span className="text-[1.5rem] font-black tracking-tighter">
                <span className="text-violet-600">Otsem</span>
                <span className="text-slate-900">Pay</span>
              </span>
            </Link>
            <p className="max-w-[320px] text-[15px] text-slate-500 leading-relaxed font-semibold mb-8">
              Redefinindo a liquidez global com tecnologia de ponta e seguranca absoluta. Sua ponte entre o tradicional e o digital.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em]">Snapshot Global Ativo</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Produto</h3>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[14px] font-semibold text-slate-500 transition-colors hover:text-violet-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-[14px] font-semibold text-slate-500 transition-colors hover:text-violet-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] font-semibold text-slate-500 transition-colors hover:text-violet-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 sm:mt-24 flex flex-col items-center justify-between gap-4 border-t border-foreground/[0.05] pt-8 sm:flex-row"
        >
          <p className="text-[12px] font-medium text-slate-400">
            © 2025 OtsemPay. Todos os direitos reservados.
          </p>
            <p className="text-[12px] font-medium text-slate-400">
              CNPJ: 12.474.440/0001-60
            </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
