"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe2,
  Repeat,
  CreditCard,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Lock
} from "lucide-react";
import * as React from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-white via-white to-[#f5f8ff] text-slate-800">
      <DecorBgLight />

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-white/80 backdrop-blur-lg shadow-sm" : ""
        }`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">otsempay</span>
          </div>
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="#features" className="transition hover:text-slate-900">Recursos</Link>
            <Link href="#pricing" className="transition hover:text-slate-900">Preços</Link>
            <Link href="/login" className="transition hover:text-slate-900">Entrar</Link>
            <Link href="/login">
              <Button size="sm" className="rounded-lg bg-blue-600 hover:bg-blue-500">
                Criar conta
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero com parallax */}
      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-12 text-center md:pt-20">
        <div
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          className="transition-transform will-change-transform"
        >
          <BadgeLight text="BRL ↔ USDT instantâneo • Taxas a partir de 0.79%" />
          <h1 className="mt-6 max-w-4xl bg-linear-to-r from-blue-700 via-indigo-700 to-cyan-700 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            Pagamentos e câmbio sem fronteiras
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Converta BRL para USDT instantaneamente com transparência total, segurança avançada e taxas competitivas.
          </p>
          <div className="mt-10">
            <Link href="/login">
              <Button className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-xl">
                Começar agora
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Liquidação T+0</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>99.98% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Segurança KYC</span>
            </div>
          </div>
        </div>

        {/* Mockups com parallax */}
        <div
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          className="relative mt-16 w-full transition-transform will-change-transform"
        >
          <MockupDeckLight />
        </div>

        <div className="mt-24 h-px w-40 bg-linear-to-r from-transparent via-blue-400/60 to-transparent" />
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <StatCard
            number="R$ 50M+"
            label="Volume transacionado"
            icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            number="5.000+"
            label="Usuários ativos"
            icon={<Globe2 className="h-6 w-6 text-indigo-600" />}
          />
          <StatCard
            number="< 30s"
            label="Tempo médio de conversão"
            icon={<Zap className="h-6 w-6 text-cyan-600" />}
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Tudo o que você precisa
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Uma plataforma completa para gerenciar seus pagamentos e câmbio
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureLight
            icon={<Repeat className="h-5 w-5 text-blue-600" />}
            title="Conversão instantânea"
            desc="Swap BRL ↔ USDT com liquidação otimizada e cotação em tempo real."
          />
          <FeatureLight
            icon={<CreditCard className="h-5 w-5 text-indigo-600" />}
            title="Pagamentos integrados"
            desc="PIX, boleto e saída para carteiras externas com conciliação automática."
          />
          <FeatureLight
            icon={<ShieldCheck className="h-5 w-5 text-teal-600" />}
            title="Segurança e KYC"
            desc="Verificação robusta, antifraude e criptografia de ponta a ponta."
          />
          <FeatureLight
            icon={<Zap className="h-5 w-5 text-amber-600" />}
            title="Performance"
            desc="Baixa latência, alta disponibilidade e infraestrutura escalável."
          />
          <FeatureLight
            icon={<Globe2 className="h-5 w-5 text-cyan-600" />}
            title="Multi-região"
            desc="Preparado para expansão global com suporte a múltiplas moedas."
          />
          <FeatureLight
            icon={<Lock className="h-5 w-5 text-fuchsia-600" />}
            title="Compliance total"
            desc="Adequado às regulamentações locais e internacionais."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Preços transparentes
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Sem taxas escondidas. Simples e direto.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
            title="Conversão BRL → USDT"
            price="0.79%"
            features={[
              "Liquidação instantânea",
              "Sem valor mínimo",
              "Suporte prioritário",
              "API futura incluída"
            ]}
          />
          <PricingCard
            title="Conversão USDT → BRL"
            price="0.99%"
            features={[
              "Saque via PIX",
              "Processamento em até 1h",
              "Suporte 24/7",
              "Dashboard avançado"
            ]}
            highlighted
          />
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-r from-blue-50 via-indigo-50 to-cyan-50 p-10 sm:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Crie sua conta gratuitamente e comece a transacionar BRL ↔ USDT em minutos.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button className="h-12 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-500">
                  Criar conta grátis
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-12 rounded-xl px-8 text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Falar com vendas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">otsempay</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Pagamentos e câmbio BRL ↔ USDT com transparência total.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Produto</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li><Link href="#features" className="hover:text-slate-900">Recursos</Link></li>
                <li><Link href="#pricing" className="hover:text-slate-900">Preços</Link></li>
                <li><Link href="/login" className="hover:text-slate-900">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Empresa</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li><Link href="/login" className="hover:text-slate-900">Sobre</Link></li>
                <li><Link href="/login" className="hover:text-slate-900">Blog</Link></li>
                <li><Link href="/login" className="hover:text-slate-900">Carreiras</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li><Link href="/login" className="hover:text-slate-900">Termos</Link></li>
                <li><Link href="/login" className="hover:text-slate-900">Privacidade</Link></li>
                <li><Link href="/login" className="hover:text-slate-900">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} otsempay. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Components */

function BadgeLight({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
      <Zap className="h-3.5 w-3.5 text-blue-500" />
      {text}
    </span>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-50 to-indigo-50">
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900">{number}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function FeatureLight({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:border-blue-200 hover:shadow-lg">
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-transparent to-indigo-50 opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-slate-100 to-slate-50 transition group-hover:from-blue-100 group-hover:to-indigo-100">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  highlighted
}: {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-8 transition hover:shadow-lg ${highlighted
      ? "border-blue-300 bg-linear-to-br from-blue-50 to-indigo-50 shadow-md"
      : "border-slate-200 bg-white"
      }`}>
      {highlighted && (
        <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Mais popular
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-900">{price}</span>
        <span className="text-sm text-slate-600">por transação</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/login" className="mt-8 block">
        <Button className={`w-full rounded-xl ${highlighted
          ? "bg-blue-600 hover:bg-blue-500"
          : "bg-slate-900 hover:bg-slate-800"
          }`}>
          Começar agora
        </Button>
      </Link>
    </div>
  );
}

function MockupDeckLight() {
  return (
    <div style={{ perspective: "1200px" }} className="relative flex h-[420px] w-full max-w-4xl items-center justify-center">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-linear-to-r from-blue-200/50 via-indigo-200/50 to-cyan-200/50 blur-2xl" />
      <AnimatedCardLight
        rotate={-14}
        gradientClass="from-blue-500 to-indigo-500"
        label="Saldo USDT"
        value="2,340.88"
        code="USDT"
      />
      <AnimatedCardLight
        rotate={6}
        gradientClass="from-cyan-500 to-teal-500"
        label="Saldo BRL"
        value="12,540.10"
        code="BRL"
      />
      <AnimatedCardLight
        rotate={-4}
        gradientClass="from-fuchsia-500 to-violet-500"
        label="Cotação hoje"
        value="R$ 5,01"
        code="1 USDT"
        small
      />
    </div>
  );
}

function AnimatedCardLight({
  rotate,
  gradientClass,
  label,
  value,
  code,
  small,
}: {
  rotate: number;
  gradientClass: string;
  label: string;
  value: string;
  code: string;
  small?: boolean;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`group absolute select-none rounded-2xl border border-slate-200 bg-white px-6 ${small ? "py-4 w-56" : "py-6 w-72"
        } shadow-lg shadow-slate-200/60 backdrop-blur-sm hover:shadow-xl`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-linear-to-br ${gradientClass} opacity-10 transition group-hover:opacity-20`} />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
          {code}
        </span>
      </div>
      <div className="relative mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="relative mt-3 h-1 w-24 rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />
    </div>
  );
}

function DecorBgLight() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-linear-to-tr from-cyan-100 to-teal-100 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-linear-to-tr from-fuchsia-100 to-indigo-100 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[26px_26px]" />
    </div>
  );
}