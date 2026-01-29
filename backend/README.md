# Otsem Bank Backend

## Descrição

Este é o backend do **Otsem Bank**, uma plataforma de negociação de ativos digitais utilizando **NestJS**. O sistema foi desenvolvido para fornecer autenticação segura, gerenciamento de usuários e integração com carteiras digitais e transações financeiras.

## Tecnologias Utilizadas

- **NestJS** (Framework Node.js)
- **Prisma ORM** (Gerenciamento de banco de dados PostgreSQL)
- **JWT (JSON Web Token)** (Autenticação segura)
- **Passport.js** (Gerenciamento de estratégias de autenticação)
- **Docker** (Containerização do banco de dados PostgreSQL)
- **bcrypt** (Hashing de senhas)
- **TypeScript** (Linguagem de programação)

## Estrutura do Projeto

```
/src
│── auth/               # Módulo de autenticação
│── users/              # Módulo de usuários
│── address/            # Módulo de endereços
│── wallet/             # Módulo de carteiras digitais
│── transaction/        # Módulo de transações financeiras
│── prisma/             # Configuração do banco de dados
│── main.ts             # Arquivo principal de inicialização do servidor
│── app.module.ts       # Módulo principal
│── .env                # Configurações de ambiente
```

## Rotas Implementadas

### **Autenticação** (`/auth`)

- **POST** `/auth/login` - Realiza login e retorna um token JWT, incluindo o endereço do usuário.
- **GET** `/auth/me` - Retorna os dados do usuário autenticado, incluindo o endereço.

### **Usuários** (`/users`)

- **POST** `/users` - Criação de um novo usuário.
- **GET** `/users` - Lista todos os usuários sem expor senhas, incluindo os endereços vinculados.

### **Endereços** (`/address`)

- **POST** `/address` - Salva ou atualiza o endereço do usuário autenticado.
- **GET** `/address` - Obtém o endereço do usuário autenticado.

### **Carteiras Digitais** (`/wallet`)

- **POST** `/wallet` - Cria uma carteira digital para um ativo específico do usuário autenticado.
  ```json
  {
    "asset": "BTC"
  }
  ```
- **GET** `/wallet` - Obtém todas as carteiras digitais do usuário autenticado.
- **PATCH** `/wallet/balance` - Atualiza o saldo de uma carteira específica do usuário autenticado.
  ```json
  {
    "asset": "USDT",
    "amount": 500.0
  }
  ```

### **Transações Financeiras** (`/transaction`)

- **POST** `/transaction/deposit` - Realiza um depósito em uma carteira BRL.

  ```json
  {
    "walletId": "id-da-carteira-BRL",
    "amount": 1000.0
  }
  ```

- **POST** `/transaction/exchange` - Converte saldo de uma carteira BRL para USD usando a taxa de câmbio atual.

  ```json
  {
    "fromWalletId": "id-da-carteira-BRL",
    "toWalletId": "id-da-carteira-USD",
    "amount": 500.0,
    "asset": "USD"
  }
  ```

- **GET** `/transaction` - Obtém todas as transações do usuário autenticado.

## O que já foi feito ✅

✔️ Configuração inicial do projeto com **NestJS**\
✔️ Configuração do **Prisma ORM** com **PostgreSQL**\
✔️ Implementação da **autenticação JWT**\
✔️ Criação do **módulo de usuários** sem expor senhas\
✔️ Atualização para **retornar os endereços dos usuários** em `/users` e `/auth/me`\
✔️ Implementação de **logs detalhados** para depuração\
✔️ Proteção de rotas com **JwtAuthGuard**\
✔️ Testes iniciais de **login e validação de token**\
✔️ Criação do **módulo de endereços** para salvar e recuperar endereços dos usuários\
✔️ Criação do **módulo de carteiras digitais** para múltiplos ativos (USD, BTC, BRL, etc.)\
✔️ Criação do **módulo de transações financeiras** para gerenciar trocas e movimentações entre carteiras

## O que falta fazer 🛠️

🔲 Implementar testes automatizados\
🔲 Criar um sistema de recuperação de senha\
🔲 Melhorar a estrutura de permissões (RBAC)\
🔲 Adicionar suporte a WebSockets para notificações\
🔲 Criar uma documentação completa com Swagger\
🔲 Implementar integração com APIs externas para pagamentos

## Histórico de Versões

### **Versão 1.3.0** (2025-03-06)

- Criado módulo de transações financeiras para gerenciar conversões de moeda e movimentações entre carteiras.
- Atualizadas rotas `/transaction` para permitir trocas entre BRL e USD.

### **Versão 1.2.0** (2025-03-05)

- Criado módulo de carteiras digitais para múltiplos ativos (USD, BTC, BRL, etc.).
- Atualizadas rotas `/wallet` para permitir a criação e gerenciamento de carteiras digitais.

### **Versão 1.1.0** (2025-03-04)

- Implementado módulo de endereços para salvar e recuperar endereços dos usuários.
- Atualizado `/auth/login` para retornar o endereço do usuário autenticado.

### **Versão 1.0.0** (2025-03-01)

- Configuração inicial do projeto com NestJS.
- Implementação da autenticação JWT.
- Criado módulo de usuários com proteção de senhas.

## Como rodar o projeto

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-repositorio/otsem-bank-backend.git
   cd otsem-bank-backend
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Configure o banco de dados PostgreSQL via **Docker**:
   ```sh
   docker-compose up -d
   ```
4. Execute as migrações Prisma:
   ```sh
   npx prisma migrate dev --name update_wallet_multiple_assets
   ```
5. Inicie o servidor:
   ```sh
   npm run start:dev
   ```
6. A API estará disponível em:
   ```sh
   http://localhost:3333
   ```

## Contato

Caso tenha dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

