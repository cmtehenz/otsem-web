"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ShieldCheck,
  Zap,
  ArrowLeftRight,
  Coins,
  Banknote,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-[#f5f8fb] text-slate-800">
      {/* Decor */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-cyan-100 to-teal-100 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gradient-to-tr from-fuchsia-100 to-indigo-100 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:26px_26px]" />
      </div>


      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-12 pt-24 text-center md:pt-28">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
          BRL ↔ USDT instantâneo
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          otsempay
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Pagamentos e câmbio confiáveis.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Plataforma de pagamentos e conversão BRL ↔ USDT com foco em transparência, segurança e taxas competitivas.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/login">
            <Button className="h-12 gap-2 rounded-xl bg-blue-600 px-6 text-white shadow-sm hover:bg-blue-500">
              Acessar otsempay
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="h-12 gap-2 rounded-xl border-slate-300 bg-white px-6 text-slate-700 hover:bg-slate-50"
            >
              Criar conta
            </Button>
          </Link>
        </div>

        {/* Métricas */}
        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Conversão BRL→USDT" value="Instantânea" />
          <MetricCard label="PIX 24/7" value="Disponível" />
          <MetricCard label="Taxas" value="Competitivas" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ArrowLeftRight className="h-5 w-5 text-blue-600" />}
            title="On/Off-Ramp"
            desc="Conversão rápida entre BRL e USDT com clareza de custos."
          />
          <FeatureCard
            icon={<Banknote className="h-5 w-5 text-indigo-600" />}
            title="PIX & Boleto"
            desc="Entradas e saídas conciliadas automaticamente."
          />
          <FeatureCard
            icon={<Coins className="h-5 w-5 text-cyan-600" />}
            title="Carteira USDT"
            desc="Saldo e extrato em tempo real, sem complexidade."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5 text-teal-600" />}
            title="Segurança & KYC"
            desc="Compliance, antifraude e criptografia avançada."
          />
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 p-8 text-center sm:p-14">
          <h2 className="text-2xl font-semibold sm:text-3xl text-slate-800">
            Comece agora
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Acesse sua conta e use câmbio BRL ↔ USDT com total transparência.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button className="h-12 rounded-xl bg-blue-600 px-7 text-white hover:bg-blue-500">
                Acessar minha conta
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className="h-12 rounded-xl px-7 text-slate-700 hover:bg-slate-100"
              >
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} otsempay</span>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-slate-700 transition-colors">Status</Link>
            <Link href="/login" className="hover:text-slate-700 transition-colors">Termos</Link>
            <Link href="/login" className="hover:text-slate-700 transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-200">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}
