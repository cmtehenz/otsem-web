# 🏦 OTSEM Bank - Plataforma de Banking Digital

Sistema completo de banking digital com suporte a PIX, pagamentos com cartão, crypto payouts e gestão de KYC.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui
- **Validação:** Zod + React Hook Form
- **HTTP Client:** Axios
- **Notificações:** Sonner
- **Ícones:** Lucide React

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/otsem-web.git

# Entre na pasta
cd otsem-web

# Instale as dependências
npm install
# ou
yarn install
# ou
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=https://api.otsembank.com
NEXT_PUBLIC_GATEWAY_URL=https://apisbank.brxbank.com.br
```

---

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/                 # Rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── admin/                  # Painel administrativo
│   │   ├── dashboard/          # Dashboard com métricas
│   │   ├── kyc/                # Gestão de KYC
│   │   │   ├── [id]/           # Detalhes + aprovar/rejeitar
│   │   │   └── new/
│   │   │       ├── pf/         # Credenciamento PF
│   │   │       └── pj/         # Credenciamento PJ
│   │   ├── transactions/       # Histórico de transações
│   │   ├── pix/                # Gestão de chaves PIX
│   │   ├── cards/              # Pagamentos com cartão
│   │   └── crypto/             # Crypto payouts
│   ├── dashboard/              # Dashboard do usuário
│   └── layout.tsx
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   └── ...
├── lib/
│   ├── http.ts                 # Axios configurado
│   ├── cep.ts                  # Busca de CEP (ViaCEP)
│   └── utils.ts
└── styles/
    └── globals.css
```

---

## 🎯 Funcionalidades

### 👤 Autenticação

- [x] Login com email/senha
- [x] Registro de novos usuários
- [x] Recuperação de senha
- [x] Proteção de rotas (middleware)

### 🏠 Dashboard Admin

- [x] Métricas em tempo real (usuários, volume, PIX, cartão)
- [x] Gráficos de transações
- [x] Usuários recentes
- [x] Transações recentes
- [x] Ações rápidas

### 👥 Gestão de KYC

- [x] Listagem de clientes (PF/PJ)
- [x] Filtros por status (aprovado, em análise, rejeitado)
- [x] Detalhes completos do cliente
- [x] Aprovar/Rejeitar KYC
- [x] Solicitar revisão
- [x] Credenciamento manual PF
- [x] Credenciamento manual PJ
- [x] Auto-preenchimento de endereço via CEP

### 💳 Transações

- [x] Histórico completo
- [x] Filtros por tipo, status, período
- [x] Exportação para CSV/Excel
- [x] Detalhes da transação

### 🔑 Chaves PIX

- [x] Listagem de chaves
- [x] Criar nova chave (CPF, Email, Telefone, Aleatória)
- [x] Deletar chave
- [x] Filtros e busca

### 💰 Pagamentos com Cartão

- [x] Histórico de transações
- [x] Detalhes do pagamento
- [x] Gestão de chargebacks
- [x] Relatórios

### 🪙 Crypto Payouts

- [x] Solicitar saque em cripto
- [x] Conversão BRL → USDT/BTC/ETH
- [x] Histórico de saques
- [x] Status em tempo real

---

## 📋 TODO

### 🔴 Alta Prioridade

- [ ] Implementar 2FA (autenticação em dois fatores)
- [ ] Webhook para notificações em tempo real
- [ ] Upload de documentos (KYC)
- [ ] Validação de documentos com OCR
- [ ] Sistema de notificações push
- [ ] Auditoria completa (logs de ações admin)

### 🟡 Média Prioridade

- [ ] Dashboard do usuário (saldo, extrato, transferências)
- [ ] Transferências PIX
- [ ] Pagamento de boletos
- [ ] QR Code PIX dinâmico
- [ ] Cartões virtuais
- [ ] Limite de transações personalizável
- [ ] Exportação de relatórios avançados
- [ ] Gráficos interativos (Chart.js/Recharts)

### 🟢 Baixa Prioridade

- [ ] Tema dark/light mode
- [ ] Multi-idioma (i18n)
- [ ] PWA (Progressive Web App)
- [ ] Notificações por email customizáveis
- [ ] Chat de suporte integrado
- [ ] Sistema de cashback
- [ ] Programa de indicação (referral)

### 🛠️ Melhorias Técnicas

- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes E2E (Playwright/Cypress)
- [ ] CI/CD com GitHub Actions
- [ ] Docker + Docker Compose
- [ ] Monitoramento com Sentry
- [ ] Analytics com Google Analytics/Mixpanel
- [ ] SEO otimizado
- [ ] Performance optimization (bundle size)
- [ ] Acessibilidade (WCAG 2.1)

### 🔐 Segurança

- [ ] Rate limiting
- [ ] CAPTCHA em formulários críticos
- [ ] Criptografia de dados sensíveis
- [ ] Sanitização de inputs
- [ ] Política de senha forte
- [ ] Sessões expiráveis
- [ ] IP whitelisting (admin).

---

## 🌐 API Endpoints

### Autenticação

```
POST   /auth/login              # Login
POST   /auth/register           # Registro
POST   /auth/forgot-password    # Recuperar senha
POST   /auth/reset-password     # Resetar senha
```

### Admin - Dashboard

```
GET    /admin/dashboard/summary # Métricas gerais
```

### Admin - KYC

```
GET    /customers               # Listar clientes
GET    /customers/:id           # Detalhes do cliente
PATCH  /customers/:id/approve-kyc    # Aprovar KYC
PATCH  /customers/:id/reject-kyc     # Rejeitar KYC
PATCH  /customers/:id/request-review # Solicitar revisão
```

### Credenciamento (Gateway)

```
POST   /accreditation/accreditations/accreditate/person   # PF
POST   /accreditation/accreditations/accreditate/company  # PJ
```

### Transações

```
GET    /transactions            # Listar transações
GET    /transactions/:id        # Detalhes da transação
```

### PIX

```
GET    /pix/keys                # Listar chaves
POST   /pix/keys                # Criar chave
DELETE /pix/keys/:id            # Deletar chave
POST   /pix/transfer            # Transferência PIX
```

---

## 🧪 Como Testar

```bash
# Rodar testes unitários
npm run test

# Rodar testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes..

---

## 👨‍💻 Autores

- **Gustavo Altevir da Costa** - [GitHub](https://github.com/gustavo)

---

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [ViaCEP](https://viacep.com.br/) - API de CEP
- [Lucide Icons](https://lucide.dev/) - Ícones

---

## 📞 Suporte

Para suporte, envie um email para suporte@otsembank.com ou abra uma issue no GitHub..

---

<div align="center">
  <sub>Feito com ❤️ pela equipe OTSEM Bank</sub>
</div>
