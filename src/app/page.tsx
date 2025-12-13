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
  Lock,
  Clock,
  BadgeCheck,
  Building2,
  Users,
  ChevronRight,
  Star,
  ArrowRight,
  Shield,
  Smartphone,
  Banknote,
  PiggyBank,
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
    <main className="relative min-h-screen bg-[#0a0118] text-white">
      <GradientBackground />
      
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? "bg-[#0a0118]/80 backdrop-blur-xl border-b border-white/5" : ""
      }`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 blur-sm opacity-80" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">Otsem Bank</span>
          </Link>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#como-funciona" className="text-sm font-medium text-white/70 transition hover:text-white">
              Como funciona
            </Link>
            <Link href="#recursos" className="text-sm font-medium text-white/70 transition hover:text-white">
              Recursos
            </Link>
            <Link href="#precos" className="text-sm font-medium text-white/70 transition hover:text-white">
              Preços
            </Link>
            <Link href="/login" className="text-sm font-medium text-white/70 transition hover:text-white">
              Entrar
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-white px-6 text-sm font-semibold text-[#0a0118] hover:bg-white/90">
                Criar conta
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-20">
        <div className="text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-violet-200">
              Mais de R$ 50M transacionados com segurança
            </span>
          </div>

          <h1 className="mx-auto max-w-5xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Revolucionando a forma
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              de mover dinheiro
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            Operações OTC com transparência total. Converta BRL ↔ USDT em minutos 
            com taxas até 75% menores que o câmbio tradicional.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button className="group h-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="ghost" className="h-14 rounded-full border border-white/10 px-8 text-base font-medium text-white hover:bg-white/5">
                Ver como funciona
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span>Verificação KYC</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Liquidação instantânea</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-400" />
              <span>Criptografia end-to-end</span>
            </div>
          </div>
        </div>

        <div className="relative mt-16 w-full max-w-4xl animate-fade-in-up">
          <PhoneMockup />
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/40 animate-bounce">
            <span className="text-xs">Role para explorar</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-white/40">
            Confiado por empresas e traders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {["Mercado Bitcoin", "Binance", "Coinbase", "FTX", "Kraken"].map((partner) => (
              <div key={partner} className="text-lg font-bold text-white/60">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard number="US$ 415B" label="Mercado OTC global em 2024" icon={<TrendingUp />} />
            <StatCard number="9.1%" label="Volume LATAM do mercado global" icon={<Globe2 />} />
            <StatCard number="10-30min" label="Tempo de liquidação" icon={<Clock />} />
            <StatCard number="0% IOF" label="Sem imposto sobre operações" icon={<ShieldCheck />} />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
              Comparativo
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Por que escolher OTC?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
              Compare o câmbio tradicional com operações via ativos digitais
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                  <Building2 className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Câmbio Convencional</h3>
                  <p className="text-sm text-white/50">Bancos tradicionais</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Spread bancário</span>
                  <span className="font-semibold text-red-400">6% a 12%</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">IOF</span>
                  <span className="font-semibold text-red-400">0,38%</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Tarifa bancária</span>
                  <span className="font-semibold text-red-400">0,1% a 2%</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Swift internacional</span>
                  <span className="font-semibold text-red-400">R$ 100 a R$ 450</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-white/60">Tempo de liquidação</span>
                  <span className="font-semibold text-red-400">2 a 5 dias úteis</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 ring-2 ring-green-500/20">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">OTC com Stablecoins</h3>
                  <p className="text-sm text-white/50">Otsem Bank</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Spread OTC</span>
                  <span className="font-semibold text-green-400">A partir de 3%</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">IOF</span>
                  <span className="font-semibold text-green-400">0% (isento)</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Tarifa OTC</span>
                  <span className="font-semibold text-green-400">Incluso no spread</span>
                </li>
                <li className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-white/60">Transferência</span>
                  <span className="font-semibold text-green-400">Sem custo adicional</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-white/60">Tempo de liquidação</span>
                  <span className="font-semibold text-green-400">10 a 30 minutos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
              Simples e rápido
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Como funciona
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
              Em apenas 3 passos, converta seu dinheiro de forma segura e instantânea
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard 
              step="01" 
              title="Crie sua conta" 
              description="Cadastro rápido com verificação KYC em minutos. Só precisamos de alguns dados básicos."
              icon={<Users />}
            />
            <StepCard 
              step="02" 
              title="Deposite via PIX" 
              description="Transfira BRL para sua carteira usando PIX. O saldo é creditado instantaneamente."
              icon={<Banknote />}
            />
            <StepCard 
              step="03" 
              title="Converta para USDT" 
              description="Com um clique, converta seu saldo para USDT com a melhor taxa do mercado."
              icon={<Repeat />}
            />
          </div>
        </div>
      </section>

      <section id="recursos" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-4 inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
                  Recursos
                </span>
                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Tudo que você precisa em um só lugar
                </h2>
                <p className="mt-4 text-lg text-white/60">
                  Ferramentas poderosas para gerenciar suas conversões com total controle e transparência.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCard icon={<Repeat />} title="Conversão instantânea" description="BRL ↔ USDT em segundos" />
                <FeatureCard icon={<CreditCard />} title="PIX integrado" description="Depósitos e saques rápidos" />
                <FeatureCard icon={<Shield />} title="Segurança total" description="Criptografia de ponta" />
                <FeatureCard icon={<Globe2 />} title="Sem fronteiras" description="Opere de qualquer lugar" />
              </div>
            </div>
          </div>

          <div className="mt-24 grid gap-6 lg:grid-cols-3">
            <BigFeatureCard
              icon={<Repeat />}
              title="Flexibilidade Contratual"
              description="Contratos ajustados entre as partes. Condições de valores, prazos e volumes personalizados de acordo com a necessidade de cada operação."
              gradient="from-violet-500/20 to-purple-500/20"
            />
            <BigFeatureCard
              icon={<Zap />}
              title="Maior Agilidade"
              description="Negociações rápidas e adaptadas à urgência do cliente. Liquidação em 10 a 30 minutos, não em dias. Disponibilidade imediata de recursos."
              gradient="from-yellow-500/20 to-orange-500/20"
            />
            <BigFeatureCard
              icon={<Lock />}
              title="Confidencialidade"
              description="Transações não são públicas como nas bolsas. Vantagem estratégica para operações de alto volume sem impacto no mercado."
              gradient="from-green-500/20 to-emerald-500/20"
            />
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <BigFeatureCard
              icon={<ShieldCheck />}
              title="Segurança e Compliance"
              description="Operamos dentro de todas as regulamentações brasileiras. KYC rigoroso, políticas AML e total transparência nas operações. Monitoramento 24/7."
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <BigFeatureCard
              icon={<BadgeCheck />}
              title="Instrumentos Customizados"
              description="Acesso a estruturas personalizadas com derivativos OTC que protegem suas operações de riscos cambiais e outros fatores de mercado."
              gradient="from-fuchsia-500/20 to-pink-500/20"
            />
          </div>
        </div>
      </section>

      <section id="precos" className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block rounded-full bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
              Preços
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Taxas transparentes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
              Sem taxas escondidas. Você sabe exatamente quanto vai pagar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
            <PricingCard
              title="Operação OTC"
              price="A partir de 3%"
              description="Spread que diminui com volumetria"
              features={[
                "Liquidação em 10-30 min",
                "0% IOF (isento)",
                "Contratos personalizados",
                "Suporte dedicado"
              ]}
            />
            <PricingCard
              title="Alta Volumetria"
              price="Sob consulta"
              description="Para operações acima de R$ 500k"
              features={[
                "Spreads negociáveis",
                "Atendimento VIP",
                "Mesa OTC dedicada",
                "Condições especiais"
              ]}
              highlighted
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 p-12 sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.3),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(192,132,252,0.2),transparent_60%)]" />
            
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                Pronto para começar?
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Crie sua conta gratuitamente e comece a transacionar BRL ↔ USDT em minutos. 
                Sem compromisso, cancele quando quiser.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button className="h-14 rounded-full bg-white px-8 text-base font-semibold text-[#0a0118] hover:bg-white/90">
                    Criar conta grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="h-14 rounded-full border border-white/20 px-8 text-base font-medium text-white hover:bg-white/10">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-white/50">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Cadastro grátis</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Sem mensalidade</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-[#0a0118]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Otsem Bank</span>
              </div>
              <p className="mt-4 text-sm text-white/50">
                Revolucionando a forma como o mundo interage com o dinheiro. Transparência, responsabilidade e agilidade em cada transação.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Todos os sistemas operacionais
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Produto</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#recursos" className="text-sm text-white/60 transition hover:text-white">Recursos</Link></li>
                <li><Link href="#precos" className="text-sm text-white/60 transition hover:text-white">Preços</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">API</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Integrações</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Empresa</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Sobre nós</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Carreiras</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Termos de uso</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Política de privacidade</Link></li>
                <li><Link href="/cookies" className="text-sm text-white/60 transition hover:text-white">Política de cookies</Link></li>
                <li><Link href="#" className="text-sm text-white/60 transition hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Otsem Bank. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-white/30">CNPJ: 00.000.000/0001-00</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function GradientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/30 via-purple-600/20 to-transparent blur-3xl" />
      <div className="absolute top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-fuchsia-600/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[800px] w-[800px] rounded-full bg-gradient-to-l from-violet-600/15 to-transparent blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-fuchsia-500/30 blur-3xl" />
      
      <div className="relative mx-auto w-72 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-2 shadow-2xl backdrop-blur-xl">
        <div className="absolute left-1/2 top-4 h-6 w-20 -translate-x-1/2 rounded-full bg-black" />
        
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#1a0a2e] to-[#0f0520]">
          <div className="p-6 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Saldo total</p>
                <p className="text-2xl font-bold">R$ 12.540,10</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                <PiggyBank className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-white/50">BRL</p>
                <p className="text-lg font-semibold">R$ 5.200</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-white/50">USDT</p>
                <p className="text-lg font-semibold">$ 1.468</p>
              </div>
            </div>
            
            <div className="mb-4 flex gap-2">
              <button className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-semibold">
                Converter
              </button>
              <button className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-semibold">
                Depositar
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs font-medium text-white/40">Últimas transações</p>
              <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <ArrowUpRight className="h-4 w-4 text-green-400 rotate-180" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Depósito PIX</p>
                    <p className="text-xs text-white/50">Hoje, 14:32</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-400">+R$ 500</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20">
                    <Repeat className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">BRL → USDT</p>
                    <p className="text-xs text-white/50">Ontem, 18:15</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">$100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          {icon}
        </div>
        <div className="text-3xl font-bold">{number}</div>
        <div className="mt-1 text-sm text-white/50">{label}</div>
      </div>
    </div>
  );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <div className="absolute -right-4 -top-4 text-8xl font-bold text-white/[0.03]">{step}</div>
      <div className="relative">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-white/60">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-violet-500/30 hover:bg-white/10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition group-hover:bg-violet-500/20">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{description}</p>
    </div>
  );
}

function BigFeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-8 backdrop-blur-sm`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-white/70">{description}</p>
    </div>
  );
}

function PricingCard({ 
  title, 
  price, 
  description, 
  features, 
  highlighted 
}: { 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  highlighted?: boolean 
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-8 ${
        highlighted 
          ? "border-violet-500/50 bg-gradient-to-br from-violet-600/20 to-purple-600/20" 
          : "border-white/10 bg-white/5"
      }`}>
      {highlighted && (
        <div className="absolute -right-12 top-6 rotate-45 bg-violet-600 px-12 py-1 text-xs font-semibold">
          Popular
        </div>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-white/50">{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-white/50">por transação</span>
      </div>
      <ul className="mt-8 space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
            <span className="text-white/80">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/register" className="mt-8 block">
        <Button className={`w-full rounded-xl py-6 font-semibold ${
          highlighted 
            ? "bg-white text-[#0a0118] hover:bg-white/90" 
            : "bg-white/10 hover:bg-white/20"
        }`}>
          Começar agora
        </Button>
      </Link>
    </div>
  );
}
