"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie, Shield, Settings, Info, Clock, Mail } from "lucide-react";

export default function CookiesPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a0118] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#6F00FF]/20 via-[#6F00FF]/10 to-transparent blur-3xl" />
      </div>

      <header className="border-b border-white/5 bg-[#0a0118]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="OtsemPay" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-amber-400">Otsem</span>
              <span className="text-[#6F00FF]">Pay</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#6F00FF]/50/30 bg-[#6F00FF]/50/10 px-4 py-2">
            <Cookie className="h-5 w-5 text-[#6F00FF]" />
            <span className="text-sm font-medium text-[#6F00FF]/20">Política de Cookies</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Política de Cookies
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          <Section
            icon={<Info />}
            title="1. O que são Cookies?"
            content={`Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, tablet ou celular) quando você visita nosso site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.

Os cookies permitem que nosso site reconheça seu dispositivo e lembre-se de suas preferências, melhorando sua experiência de navegação.`}
          />

          <Section
            icon={<Settings />}
            title="2. Como Utilizamos os Cookies"
            content={`A OtsemPay utiliza cookies para diversos fins:`}
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Cookies Essenciais:</strong> Necessários para o funcionamento básico do site, como autenticação e segurança. Sem eles, o site não funcionaria corretamente.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Cookies de Desempenho:</strong> Coletam informações sobre como você usa nosso site, como quais páginas você visita com mais frequência. Esses dados nos ajudam a melhorar o funcionamento do site.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Cookies de Funcionalidade:</strong> Permitem que o site lembre suas escolhas (como seu nome de usuário ou idioma) e forneça recursos personalizados.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Cookies de Análise:</strong> Utilizamos serviços de análise como Google Analytics para entender como os visitantes interagem com nosso site e melhorar continuamente nossa plataforma.</span>
              </li>
            </ul>
          </Section>

          <Section
            icon={<Cookie />}
            title="3. Tipos de Cookies que Utilizamos"
            content=""
          >
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cookie</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Finalidade</th>
                    <th className="px-4 py-3 font-semibold">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="text-white/70">
                    <td className="px-4 py-3 font-mono text-xs">session_id</td>
                    <td className="px-4 py-3">Essencial</td>
                    <td className="px-4 py-3">Mantém sua sessão ativa</td>
                    <td className="px-4 py-3">Sessão</td>
                  </tr>
                  <tr className="text-white/70">
                    <td className="px-4 py-3 font-mono text-xs">auth_token</td>
                    <td className="px-4 py-3">Essencial</td>
                    <td className="px-4 py-3">Autenticação do usuário</td>
                    <td className="px-4 py-3">7 dias</td>
                  </tr>
                  <tr className="text-white/70">
                    <td className="px-4 py-3 font-mono text-xs">preferences</td>
                    <td className="px-4 py-3">Funcionalidade</td>
                    <td className="px-4 py-3">Suas preferências de exibição</td>
                    <td className="px-4 py-3">1 ano</td>
                  </tr>
                  <tr className="text-white/70">
                    <td className="px-4 py-3 font-mono text-xs">_ga</td>
                    <td className="px-4 py-3">Análise</td>
                    <td className="px-4 py-3">Google Analytics</td>
                    <td className="px-4 py-3">2 anos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            icon={<Shield />}
            title="4. Gerenciamento de Cookies"
            content={`Você pode controlar e/ou excluir cookies como desejar. A maioria dos navegadores permite que você:

• Veja quais cookies estão armazenados e os exclua individualmente
• Bloqueie cookies de terceiros
• Bloqueie cookies de sites específicos
• Bloqueie todos os cookies
• Exclua todos os cookies quando você fechar o navegador

Se você optar por desativar os cookies, algumas funcionalidades do nosso site podem não funcionar corretamente. Recursos como login, preferências salvas e algumas transações podem ser afetados.`}
          >
            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-200">
                <strong>Importante:</strong> A desativação de cookies essenciais pode impedir o funcionamento adequado do site, incluindo o acesso à sua conta e a realização de transações.
              </p>
            </div>
          </Section>

          <Section
            icon={<Clock />}
            title="5. Cookies de Terceiros"
            content={`Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Não temos controle sobre esses cookies. Os principais terceiros incluem:`}
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Google Analytics:</strong> Para análise de tráfego e comportamento do usuário.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Vercel Analytics:</strong> Para monitoramento de performance e métricas do site.</span>
              </li>
            </ul>
          </Section>

          <Section
            icon={<Info />}
            title="6. Alterações nesta Política"
            content={`Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou por outras razões operacionais, legais ou regulatórias. Recomendamos que você revise esta página regularmente para se manter informado sobre nosso uso de cookies.

A data da última atualização será sempre indicada no topo desta página.`}
          />

          <Section
            icon={<Mail />}
            title="7. Contato"
            content={`Se você tiver dúvidas sobre nossa Política de Cookies ou sobre como utilizamos seus dados, entre em contato conosco:`}
          >
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/70">
                <strong className="text-white">OtsemPay</strong><br />
                E-mail: privacidade@otsembank.com.br<br />
                Endereço: São Paulo, SP - Brasil
              </p>
            </div>
          </Section>
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/">
            <Button className="h-12 rounded-full bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] px-8 font-semibold">
              Voltar para o início
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/5 bg-[#0a0118]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-white/40">
            © {new Date().getFullYear()} OtsemPay. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Section({ 
  icon, 
  title, 
  content, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F00FF]/50/20 text-[#6F00FF]">
          {icon}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {content && (
        <p className="whitespace-pre-line text-white/70 leading-relaxed">
          {content}
        </p>
      )}
      {children}
    </div>
  );
}
