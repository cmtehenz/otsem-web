"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Repeat,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Lock,
  Clock,
  Smartphone,
  Banknote,
  QrCode,
  Wallet,
  PiggyBank,
  ChevronDown,
  Star,
  Shield,
  CircleDollarSign,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import * as React from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState<"pix" | "crypto">("pix");

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0a0118] text-white overflow-x-hidden">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-[#0a0118]/95 backdrop-blur-xl border-b border-white/5"
            : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              OtsemPay
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="#recursos"
              className="px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white rounded-lg hover:bg-white/5"
            >
              Recursos
            </Link>
            <Link
              href="#seguranca"
              className="px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white rounded-lg hover:bg-white/5"
            >
              Segurança
            </Link>
            <Link
              href="#precos"
              className="px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white rounded-lg hover:bg-white/5"
            >
              Preços
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-sm font-medium text-white hover:bg-white/10 rounded-full px-5"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full bg-white px-5 text-sm font-semibold text-[#0a0118] hover:bg-white/90">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              Mude a forma
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              como você usa dinheiro
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg sm:text-xl text-white/60">
            Em casa ou no mundo, local ou global — mova-se livremente entre moedas. 
            Cadastre-se grátis, em um toque.
          </p>

          <div className="mt-10">
            <Link href="/register">
              <Button className="h-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all">
                Baixar o app
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-16 flex justify-center px-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-[3rem] blur-2xl" />
            <div className="relative bg-gradient-to-b from-[#1a1025] to-[#0d0515] rounded-[2.5rem] p-3 border border-white/10 shadow-2xl">
              <div className="w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] rounded-[2rem] bg-[#0a0118] border border-white/5 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="px-6 pt-12 pb-6">
                    <p className="text-sm text-white/50">Saldo total</p>
                    <p className="text-4xl font-bold mt-1">R$ 24.850,00</p>
                    <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12.5% este mês
                    </p>
                  </div>

                  <div className="px-4 flex gap-2">
                    <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ArrowDownLeft className="h-5 w-5 text-green-400" />
                      </div>
                      <span className="text-xs font-medium">Receber</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition">
                      <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-violet-400" />
                      </div>
                      <span className="text-xs font-medium">Enviar</span>
                    </button>
                    <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition">
                      <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Repeat className="h-5 w-5 text-purple-400" />
                      </div>
                      <span className="text-xs font-medium">Converter</span>
                    </button>
                  </div>

                  <div className="mt-6 px-4 flex-1">
                    <p className="text-sm font-medium text-white/50 mb-3">Suas carteiras</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">R$</div>
                        <div className="flex-1">
                          <p className="font-medium">Real Brasileiro</p>
                          <p className="text-sm text-white/50">BRL</p>
                        </div>
                        <p className="font-semibold">R$ 18.350</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">$</div>
                        <div className="flex-1">
                          <p className="font-medium">Tether USDT</p>
                          <p className="text-sm text-white/50">USDT</p>
                        </div>
                        <p className="font-semibold">$ 1.125</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/30" />
        </div>
      </section>

      <section className="relative py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-medium text-white/40 mb-12">
            Junte-se a milhares de usuários em todo o Brasil
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 mb-4">
                <Star className="h-8 w-8 text-violet-400" />
              </div>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-white/50 mt-1">Avaliação na App Store</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-2xl font-bold">R$ 50M+</p>
              <p className="text-sm text-white/50 mt-1">Transacionados</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 mb-4">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold">{"<"}30min</p>
              <p className="text-sm text-white/50 mt-1">Tempo de liquidação</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-white/50 mt-1">Seguro e verificado</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Seu salário, reimaginado
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Gaste com inteligência, envie rapidamente, organize automaticamente 
              e veja suas economias crescerem — tudo com OtsemPay.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                <FeatureItem
                  icon={<QrCode className="h-6 w-6" />}
                  title="PIX instantâneo"
                  description="Receba e envie dinheiro em segundos usando PIX. Sem taxas, sem limites."
                  color="green"
                />
                <FeatureItem
                  icon={<Repeat className="h-6 w-6" />}
                  title="Conversão BRL ↔ USDT"
                  description="Converta seu saldo para dólar digital com as melhores taxas do mercado."
                  color="violet"
                />
                <FeatureItem
                  icon={<PiggyBank className="h-6 w-6" />}
                  title="Poupança automática"
                  description="Configure regras para economizar automaticamente a cada transação."
                  color="yellow"
                />
                <FeatureItem
                  icon={<CreditCard className="h-6 w-6" />}
                  title="Cartão virtual"
                  description="Crie cartões virtuais instantaneamente para compras online seguras."
                  color="blue"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-green-500/10 to-violet-500/10 rounded-[3rem] blur-3xl" />
                <div className="relative bg-gradient-to-b from-[#1a1025] to-[#0d0515] rounded-3xl p-6 border border-white/10">
                  <div className="w-[300px] space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/50">Recebido via PIX</span>
                        <span className="text-xs text-green-400">Agora</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">+ R$ 5.000,00</p>
                      <p className="text-sm text-white/50 mt-1">De: João Silva</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/50">Conversão automática</span>
                        <span className="text-xs text-violet-400">2min atrás</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-lg font-bold">R$ 1.000</p>
                          <p className="text-xs text-white/50">BRL</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-violet-400" />
                        <div className="flex-1 text-right">
                          <p className="text-lg font-bold text-violet-400">$ 172.41</p>
                          <p className="text-xs text-white/50">USDT</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/50">Economizado</span>
                        <span className="text-xs text-yellow-400">Automático</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">+ R$ 50,00</p>
                      <p className="text-sm text-white/50 mt-1">Regra: 1% de cada recebimento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="relative py-24 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Eleve seus gastos
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Ganhe pontos em suas compras. Depois, troque por benefícios exclusivos.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full bg-white/5 p-1">
              <button
                onClick={() => setActiveTab("pix")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "pix"
                    ? "bg-white text-[#0a0118]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                PIX
              </button>
              <button
                onClick={() => setActiveTab("crypto")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "crypto"
                    ? "bg-white text-[#0a0118]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Crypto
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              {activeTab === "pix" ? (
                <div className="relative">
                  <div className="absolute -inset-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
                  <div className="relative grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                      <QrCode className="h-10 w-10 mb-4" />
                      <p className="font-bold text-lg">PIX QR Code</p>
                      <p className="text-sm text-white/80 mt-1">Escaneie e pague</p>
                    </div>
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
                      <Smartphone className="h-10 w-10 mb-4" />
                      <p className="font-bold text-lg">Chave PIX</p>
                      <p className="text-sm text-white/80 mt-1">CPF, email ou telefone</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                      <Clock className="h-10 w-10 mb-4" />
                      <p className="font-bold text-lg">24/7</p>
                      <p className="text-sm text-white/80 mt-1">Disponível sempre</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
                      <Banknote className="h-10 w-10 mb-4" />
                      <p className="font-bold text-lg">Sem taxas</p>
                      <p className="text-sm text-white/80 mt-1">Transferências grátis</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -inset-8 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                  <div className="relative space-y-4 w-[340px]">
                    <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl p-6 border border-violet-500/20">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">$</div>
                        <div>
                          <p className="font-bold text-xl">USDT</p>
                          <p className="text-sm text-white/50">Tether</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-bold text-xl">$ 1,125.00</p>
                          <p className="text-sm text-green-400">+2.3%</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <Globe2 className="h-8 w-8 text-violet-400 mb-3" />
                        <p className="font-medium">Solana</p>
                        <p className="text-sm text-white/50">Rede rápida</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <Lock className="h-8 w-8 text-green-400 mb-3" />
                        <p className="font-medium">TRC20</p>
                        <p className="text-sm text-white/50">Rede Tron</p>
                      </div>
                    </div>

                    <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                        <div>
                          <p className="font-medium text-green-400">Whitelist ativa</p>
                          <p className="text-sm text-white/50">Saques automáticos liberados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {activeTab === "pix" ? (
                <div>
                  <h3 className="text-3xl font-bold mb-4">PIX sem limites</h3>
                  <p className="text-lg text-white/60 mb-8">
                    Receba pagamentos instantaneamente via PIX. Seu dinheiro disponível em 
                    segundos, 24 horas por dia, 7 dias por semana. Sem taxas para receber 
                    ou enviar.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>Chave PIX personalizada</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>QR Code para recebimentos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>Notificações em tempo real</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>Histórico completo de transações</span>
                    </li>
                  </ul>
                  <Link href="/register" className="inline-block mt-8">
                    <Button className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6">
                      Começar com PIX
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <h3 className="text-3xl font-bold mb-4">Cripto simplificado</h3>
                  <p className="text-lg text-white/60 mb-8">
                    Converta BRL para USDT com as melhores taxas do mercado. Saque para 
                    sua carteira pessoal ou mantenha seu saldo seguro conosco.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                      <span>Conversão instantânea BRL → USDT</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                      <span>Redes Solana e TRC20 (Tron)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                      <span>Whitelist para saques automáticos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                      <span>Taxas até 75% menores que bancos</span>
                    </li>
                  </ul>
                  <Link href="/register" className="inline-block mt-8">
                    <Button className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-6">
                      Começar com Crypto
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Vida, conheça poupança
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Faça seu dinheiro render com até 4% ao ano de rendimento, pago diariamente. 
                Sem taxas escondidas, sem pegadinhas.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Rendimento diário</p>
                    <p className="text-sm text-white/50">Veja seu saldo crescer todo dia</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium">Resgate a qualquer momento</p>
                    <p className="text-sm text-white/50">Sem carência ou penalidades</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium">Cofrinhos personalizados</p>
                    <p className="text-sm text-white/50">Organize seus objetivos</p>
                  </div>
                </div>
              </div>
              <Link href="/register">
                <Button className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-6 text-black font-semibold">
                  Explorar Poupança
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-[3rem] blur-3xl" />
                <div className="relative bg-gradient-to-b from-[#1a1025] to-[#0d0515] rounded-3xl p-1 border border-white/10">
                  <div className="w-[280px] rounded-[1.4rem] bg-[#0a0118] overflow-hidden">
                    <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                      <p className="text-sm text-white/50">Poupança</p>
                      <p className="text-3xl font-bold mt-1">R$ 12.450,00</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-green-400">+ R$ 1,37</span>
                        <span className="text-xs text-white/40">hoje</span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50">Taxa anual</span>
                        <span className="font-medium text-green-400">4.00% a.a.</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50">Rendimento mensal</span>
                        <span className="font-medium">R$ 41,50</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/50">Último rendimento</span>
                        <span className="font-medium text-green-400">+ R$ 1,37</span>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
                        </div>
                        <p className="text-xs text-white/40 mt-2">Meta: R$ 15.000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="seguranca" className="relative py-24 bg-gradient-to-b from-white/[0.02] to-transparent border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Seu dinheiro, protegido
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Com OtsemPay Secure, você entra em uma nova era de segurança — onde nossas 
              defesas proativas protegem cada conta, 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="group p-8 rounded-3xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 hover:border-violet-500/40 transition">
              <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <ShieldCheck className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verificação KYC</h3>
              <p className="text-white/60">
                Verificação de identidade com IA avançada. Protegemos você e a comunidade 
                contra fraudes.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 hover:border-green-500/40 transition">
              <div className="h-14 w-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Lock className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Criptografia E2E</h3>
              <p className="text-white/60">
                Todas as suas transações e dados são protegidos com criptografia de 
                ponta a ponta.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20 hover:border-yellow-500/40 transition">
              <div className="h-14 w-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Shield className="h-7 w-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Monitoramento 24/7</h3>
              <p className="text-white/60">
                Nossa equipe de segurança monitora transações suspeitas em tempo real, 
                dia e noite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="precos" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Taxas transparentes
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Sem taxas escondidas. Você sabe exatamente quanto vai pagar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-6">
                Grátis
              </div>
              <h3 className="text-2xl font-bold mb-2">Conta OtsemPay</h3>
              <p className="text-white/50 mb-6">Tudo que você precisa para começar</p>
              <div className="text-4xl font-bold mb-6">
                R$ 0<span className="text-lg font-normal text-white/50">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span>PIX ilimitado sem taxas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span>Conversão BRL ↔ USDT</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span>Carteira crypto multi-rede</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                  <span>Suporte por chat</span>
                </li>
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full rounded-full bg-white text-[#0a0118] hover:bg-white/90">
                  Criar conta grátis
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-b from-violet-500/20 to-purple-500/10 border border-violet-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-sm font-medium">
                  Mais popular
                </span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-sm font-medium text-violet-400 mb-6">
                Pro
              </div>
              <h3 className="text-2xl font-bold mb-2">OtsemPay Pro</h3>
              <p className="text-white/50 mb-6">Para quem opera com volume</p>
              <div className="text-4xl font-bold mb-6">
                A partir de 3%<span className="text-lg font-normal text-white/50"> spread</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                  <span>Tudo do plano grátis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                  <span>Spreads reduzidos por volume</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                  <span>Saques automáticos (whitelist)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 shrink-0" />
                  <span>Mesa OTC dedicada</span>
                </li>
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600/30 via-purple-600/30 to-fuchsia-600/30 p-12 sm:p-20 border border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(192,132,252,0.3),transparent_50%)]" />

            <div className="relative text-center">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Junte-se aos milhares usando OtsemPay
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                Crie sua conta em segundos e comece a transacionar. Sem burocracia, 
                sem taxas escondidas.
              </p>
              <Link href="/register">
                <Button className="h-14 rounded-full bg-white px-8 text-base font-semibold text-[#0a0118] hover:bg-white/90 shadow-xl">
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 bg-[#0a0118]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="text-xl font-bold">OtsemPay</span>
              </div>
              <p className="text-sm text-white/50 max-w-sm">
                A forma mais inteligente de mover dinheiro entre moedas. 
                Transparência, segurança e agilidade em cada transação.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Todos os sistemas operacionais
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Produto
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#recursos" className="text-sm text-white/60 hover:text-white transition">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#seguranca" className="text-sm text-white/60 hover:text-white transition">
                    Segurança
                  </Link>
                </li>
                <li>
                  <Link href="#precos" className="text-sm text-white/60 hover:text-white transition">
                    Preços
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Empresa
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-white/60 hover:text-white transition">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-white/60 hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-white/60 hover:text-white transition">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacidade" className="text-sm text-white/60 hover:text-white transition">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-white/60 hover:text-white transition">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-white/60 hover:text-white transition">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2025 OtsemPay. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-white/40 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="text-white/40 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link href="#" className="text-white/40 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "green" | "violet" | "yellow" | "blue";
}) {
  const colorClasses = {
    green: "bg-green-500/20 text-green-400",
    violet: "bg-violet-500/20 text-violet-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-white/60">{description}</p>
      </div>
    </div>
  );
}
