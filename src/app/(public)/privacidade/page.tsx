"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Database, Eye, Lock, Users, Globe2, Mail, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <Shield className="h-5 w-5 text-[#6F00FF]" />
            <span className="text-sm font-medium text-[#6F00FF]/20">Política de Privacidade</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-[#6F00FF]/50/20 bg-[#6F00FF]/50/10 p-6">
          <p className="text-white/80 leading-relaxed">
            A OtsemPay está comprometida com a proteção da sua privacidade e dos seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
        </div>

        <div className="space-y-12">
          <Section
            icon={<Database />}
            title="1. Dados que Coletamos"
            content="Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:"
          >
            <div className="mt-6 space-y-4">
              <DataCategory
                title="Dados de Identificação"
                items={[
                  "Nome completo",
                  "CPF ou CNPJ",
                  "Data de nascimento",
                  "Documento de identidade (RG)",
                  "Foto do documento e selfie (para verificação KYC)"
                ]}
              />
              <DataCategory
                title="Dados de Contato"
                items={[
                  "Endereço de e-mail",
                  "Número de telefone",
                  "Endereço residencial ou comercial"
                ]}
              />
              <DataCategory
                title="Dados Financeiros"
                items={[
                  "Informações de conta bancária",
                  "Histórico de transações",
                  "Chaves PIX",
                  "Carteiras de criptomoedas"
                ]}
              />
              <DataCategory
                title="Dados Técnicos"
                items={[
                  "Endereço IP",
                  "Tipo de navegador e dispositivo",
                  "Sistema operacional",
                  "Dados de cookies e logs de acesso"
                ]}
              />
            </div>
          </Section>

          <Section
            icon={<Eye />}
            title="2. Como Utilizamos seus Dados"
            content="Utilizamos suas informações pessoais para as seguintes finalidades:"
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Prestação de Serviços:</strong> Processar transações, conversões de moeda e operações OTC.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Verificação de Identidade (KYC):</strong> Cumprir obrigações legais de prevenção à lavagem de dinheiro e financiamento ao terrorismo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Comunicação:</strong> Enviar notificações sobre transações, atualizações de serviço e informações de segurança.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Segurança:</strong> Detectar e prevenir fraudes, atividades suspeitas e violações de segurança.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Melhoria de Serviços:</strong> Analisar padrões de uso para aprimorar nossa plataforma e experiência do usuário.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Cumprimento Legal:</strong> Atender obrigações legais, regulatórias e solicitações de autoridades competentes.</span>
              </li>
            </ul>
          </Section>

          <Section
            icon={<Lock />}
            title="3. Base Legal para Tratamento"
            content="O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-semibold text-[#6F00FF]">Execução de Contrato</h4>
                <p className="mt-2 text-sm text-white/60">Para prestação dos serviços contratados por você.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-semibold text-[#6F00FF]">Obrigação Legal</h4>
                <p className="mt-2 text-sm text-white/60">Para cumprir exigências regulatórias (KYC/AML).</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-semibold text-[#6F00FF]">Legítimo Interesse</h4>
                <p className="mt-2 text-sm text-white/60">Para segurança e prevenção a fraudes.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-semibold text-[#6F00FF]">Consentimento</h4>
                <p className="mt-2 text-sm text-white/60">Para comunicações de marketing (quando aplicável).</p>
              </div>
            </div>
          </Section>

          <Section
            icon={<Users />}
            title="4. Compartilhamento de Dados"
            content="Podemos compartilhar suas informações pessoais com:"
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Parceiros de Serviço:</strong> Empresas que nos auxiliam na prestação de serviços (processamento de pagamentos, verificação de identidade, hospedagem de dados).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Instituições Financeiras:</strong> Bancos e outras instituições para processamento de transações PIX e transferências.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Autoridades Governamentais:</strong> Quando exigido por lei, regulamentação ou ordem judicial.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Exchanges de Criptomoedas:</strong> Para processamento de operações com ativos digitais.</span>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-sm text-green-200">
                <strong>Importante:</strong> Nunca vendemos seus dados pessoais a terceiros para fins de marketing.
              </p>
            </div>
          </Section>

          <Section
            icon={<Shield />}
            title="5. Segurança dos Dados"
            content="Implementamos medidas técnicas e organizacionais rigorosas para proteger seus dados:"
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Criptografia de dados em trânsito (TLS/SSL) e em repouso (AES-256)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Autenticação de dois fatores (2FA) disponível para sua conta</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Monitoramento contínuo de segurança 24/7</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Controle de acesso rigoroso aos sistemas internos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Backups regulares e plano de recuperação de desastres</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                <span>Treinamento regular de funcionários em proteção de dados</span>
              </li>
            </ul>
          </Section>

          <Section
            icon={<FileText />}
            title="6. Seus Direitos (LGPD)"
            content="De acordo com a Lei Geral de Proteção de Dados, você tem os seguintes direitos:"
          >
            <div className="mt-4 grid gap-4">
              <RightItem title="Acesso" description="Solicitar informações sobre quais dados pessoais temos sobre você." />
              <RightItem title="Correção" description="Solicitar a correção de dados incompletos, inexatos ou desatualizados." />
              <RightItem title="Anonimização ou Eliminação" description="Solicitar a anonimização ou exclusão de dados desnecessários ou tratados em desconformidade." />
              <RightItem title="Portabilidade" description="Solicitar a portabilidade dos seus dados para outro fornecedor de serviço." />
              <RightItem title="Revogação de Consentimento" description="Revogar o consentimento dado anteriormente, quando aplicável." />
              <RightItem title="Informação" description="Ser informado sobre com quem seus dados são compartilhados." />
              <RightItem title="Oposição" description="Opor-se ao tratamento de dados quando realizado com base em legítimo interesse." />
            </div>
          </Section>

          <Section
            icon={<Globe2 />}
            title="7. Transferência Internacional"
            content={`Alguns de nossos parceiros e prestadores de serviços podem estar localizados fora do Brasil. Nesses casos, garantimos que a transferência internacional de dados seja realizada em conformidade com a LGPD, adotando medidas como:

• Cláusulas contratuais padrão aprovadas pela ANPD
• Verificação de que o país de destino possui legislação de proteção de dados adequada
• Obtenção de consentimento específico, quando necessário`}
          />

          <Section
            icon={<Database />}
            title="8. Retenção de Dados"
            content="Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, observando os seguintes critérios:"
          >
            <ul className="mt-4 space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Dados de Conta:</strong> Mantidos enquanto sua conta estiver ativa e por 5 anos após o encerramento.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Dados de Transações:</strong> Mantidos por 10 anos para cumprimento de obrigações fiscais e regulatórias.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Dados de KYC:</strong> Mantidos por 10 anos conforme regulamentações de prevenção à lavagem de dinheiro.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#6F00FF]/50" />
                <span><strong className="text-white">Logs de Acesso:</strong> Mantidos por 6 meses conforme Marco Civil da Internet.</span>
              </li>
            </ul>
          </Section>

          <Section
            icon={<FileText />}
            title="9. Alterações nesta Política"
            content={`Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas, serviços ou obrigações legais.

Sempre que houver alterações significativas, notificaremos você por e-mail ou através de um aviso em nossa plataforma. Recomendamos que você revise esta política regularmente.

A data da última atualização será sempre indicada no topo desta página.`}
          />

          <Section
            icon={<Mail />}
            title="10. Contato e Encarregado (DPO)"
            content="Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato:"
          >
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h4 className="font-semibold text-[#6F00FF]">Encarregado de Proteção de Dados (DPO)</h4>
                <p className="mt-2 text-white/70">
                  E-mail: dpo@otsembank.com.br<br />
                  Telefone: (11) 0000-0000
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h4 className="font-semibold text-[#6F00FF]">OtsemPay</h4>
                <p className="mt-2 text-white/70">
                  E-mail: privacidade@otsembank.com.br<br />
                  Endereço: São Paulo, SP - Brasil<br />
                    CNPJ: 12.474.440/0001-60
                  </p>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-16 flex justify-center gap-4">
          <Link href="/cookies">
            <Button variant="outline" className="h-12 rounded-full border-white/20 px-8 font-semibold text-white hover:bg-white/10">
              Política de Cookies
            </Button>
          </Link>
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

function DataCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h4 className="mb-3 font-semibold text-[#6F00FF]">{title}</h4>
      <ul className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6F00FF]/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RightItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6F00FF]/50/20 text-sm font-bold text-[#6F00FF]">
        {title.charAt(0)}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
    </div>
  );
}
