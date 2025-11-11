# 🏦 OTSEM Bank API - Especificação para Frontend

**Versão:** 1.0  
**Última atualização:** 11 de novembro de 2025  
**Base URL (Dev):** `http://localhost:3333`  
**Base URL (Prod):** `https://api.otsembank.com`

---

## 📋 Índice

- [Autenticação](#autenticação)
- [Users](#users)
- [Customers](#customers)
- [Saldo e Extrato](#saldo-e-extrato)
- [Pix](#pix)
- [Admin](#admin)
- [Erros Comuns](#erros-comuns)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🔐 Autenticação

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@exemplo.com",
  "password": "Senha@123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joao@exemplo.com",
    "role": "CUSTOMER"
  }
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### Registrar Usuário

```http
POST /auth/register
Content-Type: application/json

{
  "email": "novo@exemplo.com",
  "password": "Senha@123"
}
```

**Response 201:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "email": "novo@exemplo.com",
    "role": "CUSTOMER"
  }
}
```

---

### Esqueci a Senha

```http
POST /auth/forgot
Content-Type: application/json

{
  "email": "joao@exemplo.com"
}
```

**Response 200:**
```json
{
  "message": "Recovery email sent"
}
```

---

### Redefinir Senha

```http
POST /auth/reset
Content-Type: application/json

{
  "token": "abc123def456",
  "newPassword": "NovaSenha@123"
}
```

**Response 200:**
```json
{
  "message": "Password reset successfully"
}
```

---

### Obter Usuário Logado

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao@exemplo.com",
  "role": "CUSTOMER",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

---

## 👤 Customers

### Obter Customer do Usuário Logado

```http
GET /customers/me
Authorization: Bearer <access_token>
```

**Response 200 (aprovado):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "PF",
  "name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@exemplo.com",
  "phone": "11999999999",
  "accountStatus": "approved",
  "externalClientId": "BRX_CLI_abc123xyz",
  "externalAccredId": "BRX_ACC_def456",
  "createdAt": "2025-11-05T14:30:00Z",
  "updatedAt": "2025-11-10T09:15:00Z"
}
```

**Response 404 (não cadastrado):**
```json
{
  "statusCode": 404,
  "message": "Customer not found"
}
```

---

### Criar Customer PF (Self-Service)

**⚠️ Importante:** Usuário já deve estar autenticado (ter feito login/register)

```http
POST /customers/pf/self
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "identifier": "CLT001",
  "productId": 1,
  "person": {
    "name": "João Silva",
    "socialName": "João",
    "cpf": "12345678901",
    "birthday": "1990-05-15",
    "phone": "11999999999",
    "email": "joao@exemplo.com",
    "genderId": 1,
    "address": {
      "zipCode": "01001000",
      "street": "Praça da Sé",
      "number": "100",
      "complement": "Apto 5",
      "neighborhood": "Sé",
      "cityIbgeCode": 3550308
    }
  },
  "pixLimits": {
    "singleTransfer": 5000,
    "daytime": 10000,
    "nighttime": 1000,
    "monthly": 50000,
    "serviceId": 1
  }
}
```

**Response 201:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "PF",
  "name": "João Silva",
  "cpf": "12345678901",
  "accountStatus": "requested",
  "createdAt": "2025-11-11T16:45:00Z"
}
```

**Response 400 (já existe):**
```json
{
  "statusCode": 400,
  "message": "Customer already exists for this user"
}
```

---

### Submeter KYC (Documentos)

```http
POST /customers/submit-kyc
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "customerId": "880e8400-e29b-41d4-a716-446655440000",
  "documents": {
    "cpf": "url_do_documento_cpf.jpg",
    "selfie": "url_da_selfie.jpg",
    "proofOfAddress": "url_comprovante_endereco.pdf"
  }
}
```

**Response 200:**
```json
{
  "message": "KYC submitted successfully",
  "accountStatus": "in_review"
}
```

---

### Buscar Customer por ID

```http
GET /customers/:id
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "type": "PF",
  "name": "João Silva",
  "cpf": "12345678901",
  "accountStatus": "approved"
}
```

**Response 403 (não é dono e não é admin):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

### Listar Customers (Admin ou auto-scope)

```http
GET /customers?page=1&limit=50&accountStatus=approved
Authorization: Bearer <access_token>
```

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 50, max: 100)
- `accountStatus` (enum: `not_requested`, `requested`, `in_review`, `approved`, `rejected`)
- `search` (string, busca por nome/cpf/email)

**Response 200 (Customer vê apenas o próprio):**
```json
{
  "customers": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "cpf": "123.456.789-01",
      "accountStatus": "approved"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Response 200 (Admin vê todos):**
```json
{
  "customers": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "accountStatus": "approved"
    },
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "name": "Maria Santos",
      "accountStatus": "in_review"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 50
}
```

---

### Atualizar Customer

```http
PATCH /customers/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "phone": "11988888888",
  "email": "novoemail@exemplo.com"
}
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "phone": "11988888888",
  "email": "novoemail@exemplo.com"
}
```

---

## 💰 Saldo e Extrato

### Consultar Saldo

```http
GET /customers/:customerId/balance
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "accountHolderId": "BRX_CLI_abc123xyz",
  "availableBalance": 1500.50,
  "blockedBalance": 200.00,
  "totalBalance": 1700.50,
  "currency": "BRL",
  "updatedAt": "2025-11-11T17:30:00Z"
}
```

**Response 400 (customer não credenciado):**
```json
{
  "statusCode": 400,
  "message": "Customer not accredited"
}
```

---

### Consultar Extrato

```http
GET /customers/:customerId/statement?page=1&limit=20&startDate=2025-11-01&endDate=2025-11-11
Authorization: Bearer <access_token>
```

**Query Params:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `startDate` (YYYY-MM-DD, opcional)
- `endDate` (YYYY-MM-DD, opcional)

**Response 200:**
```json
{
  "statements": [
    {
      "transactionId": "tx_abc123",
      "type": "PIX_IN",
      "amount": 150.00,
      "description": "Recebimento Pix de Maria Santos",
      "senderName": "Maria Santos",
      "senderCpf": "98765432100",
      "createdAt": "2025-11-11T15:30:00Z",
      "status": "COMPLETED"
    },
    {
      "transactionId": "tx_def456",
      "type": "PIX_OUT",
      "amount": -50.00,
      "description": "Pagamento loja XYZ",
      "recipientName": "Loja XYZ LTDA",
      "recipientCnpj": "12345678000190",
      "createdAt": "2025-11-11T10:15:00Z",
      "status": "COMPLETED"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

## 💸 Pix

### Listar Chaves Pix

```http
GET /pix/keys/account-holders/:accountHolderId
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "keys": [
    {
      "id": "key_abc123",
      "keyType": "CPF",
      "keyValue": "123.456.789-01",
      "status": "ACTIVE",
      "createdAt": "2025-11-05T10:00:00Z"
    },
    {
      "id": "key_def456",
      "keyType": "EMAIL",
      "keyValue": "joao@exemplo.com",
      "status": "ACTIVE",
      "createdAt": "2025-11-06T14:30:00Z"
    }
  ]
}
```

---

### Criar Chave Pix

```http
POST /pix/keys/account-holders/:accountHolderId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "keyType": "EMAIL",
  "keyValue": "joao@exemplo.com"
}
```

**keyType aceitos:**
- `CPF` - CPF (11 dígitos)
- `CNPJ` - CNPJ (14 dígitos)
- `EMAIL` - E-mail válido
- `PHONE` - Telefone (+5511999999999)
- `EVP` - Chave aleatória (gerada automaticamente)

**Response 201:**
```json
{
  "id": "key_xyz789",
  "keyType": "EMAIL",
  "keyValue": "joao@exemplo.com",
  "status": "PENDING",
  "createdAt": "2025-11-11T18:00:00Z"
}
```

---

### Deletar Chave Pix

```http
DELETE /pix/keys/account-holders/:accountHolderId/key/:pixKey
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "message": "Pix key deleted successfully"
}
```

---

### Precheck Chave Pix (antes de enviar)

```http
GET /pix/transactions/account-holders/:accountHolderId/precheck?keyType=CPF&keyValue=98765432100
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "valid": true,
  "recipientName": "Maria Santos",
  "recipientCpf": "987.654.321-00",
  "recipientBank": "Banco BRX",
  "recipientAccountType": "CONTA_CORRENTE"
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Pix key not found"
}
```

---

### Enviar Pix

```http
POST /pix/transactions/account-holders/:accountHolderId/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 100.50,
  "description": "Pagamento de teste",
  "recipientKeyType": "CPF",
  "recipientKeyValue": "98765432100"
}
```

**Response 201:**
```json
{
  "transactionId": "tx_pix_abc123",
  "amount": 100.50,
  "status": "PROCESSING",
  "endToEndId": "E12345678202511111800abc123def456",
  "createdAt": "2025-11-11T18:00:00Z"
}
```

**Response 400 (saldo insuficiente):**
```json
{
  "statusCode": 400,
  "message": "Insufficient balance"
}
```

---

### Gerar QR Code Pix Estático

```http
POST /pix/transactions/qr/static
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "accountHolderId": "BRX_CLI_abc123xyz",
  "amount": 50.00,
  "description": "Cobrança #123"
}
```

**Response 201:**
```json
{
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "expiresAt": "2025-11-12T18:00:00Z"
}
```

---

### Listar Transações Pix

```http
GET /pix/transactions/account-holders/:accountHolderId?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "transactions": [
    {
      "transactionId": "tx_pix_abc123",
      "type": "PIX_OUT",
      "amount": 100.50,
      "status": "COMPLETED",
      "endToEndId": "E12345678202511111800abc123def456",
      "createdAt": "2025-11-11T18:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

## 👨‍💼 Admin (apenas ADMIN role)

### Estatísticas de Customers

```http
GET /customers/stats
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "total": 150,
  "approved": 120,
  "in_review": 20,
  "rejected": 10,
  "requested": 0
}
```

---

### Buscar Customer por CPF/CNPJ

```http
GET /customers/by-tax/:tax
Authorization: Bearer <access_token>
```

**Exemplo:**
```http
GET /customers/by-tax/12345678901
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "type": "PF",
  "name": "João Silva",
  "cpf": "12345678901",
  "accountStatus": "approved"
}
```

---

### Criar Customer PF (Admin)

```http
POST /customers/pf
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "identifier": "CLT002",
  "productId": 1,
  "person": {
    "name": "Maria Santos",
    "cpf": "98765432100",
    "birthday": "1985-08-20",
    "phone": "11988888888",
    "email": "maria@exemplo.com",
    "address": {
      "zipCode": "01310000",
      "street": "Avenida Paulista",
      "number": "1578",
      "neighborhood": "Bela Vista",
      "cityIbgeCode": 3550308
    }
  }
}
```

---

### Aprovar Customer

```http
PATCH /customers/:id/approve
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "accountStatus": "approved",
  "updatedAt": "2025-11-11T19:00:00Z"
}
```

---

### Rejeitar Customer

```http
PATCH /customers/:id/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Documento ilegível"
}
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "accountStatus": "rejected",
  "rejectionReason": "Documento ilegível",
  "updatedAt": "2025-11-11T19:05:00Z"
}
```

---

### Colocar em Revisão

```http
PATCH /customers/:id/review
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "accountStatus": "in_review",
  "updatedAt": "2025-11-11T19:10:00Z"
}
```

---

### Deletar Customer

```http
DELETE /customers/:id
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "message": "Customer deleted successfully"
}
```

---

### Dashboard - Resumo Geral

```http
GET /admin/dashboard/summary
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "totalCustomers": 150,
  "totalUsers": 160,
  "totalTransactions": 1250,
  "totalVolume": 125000.50,
  "averageTicket": 100.00,
  "customersThisMonth": 15,
  "transactionsToday": 45
}
```

---

### Dashboard - Últimos Usuários

```http
GET /admin/dashboard/latest-users?limit=10
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "joao@exemplo.com",
      "role": "CUSTOMER",
      "createdAt": "2025-11-11T10:00:00Z"
    }
  ]
}
```

---

### Dashboard - Últimas Transações

```http
GET /admin/dashboard/latest-transactions?limit=10
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "transactions": [
    {
      "transactionId": "tx_abc123",
      "customerName": "João Silva",
      "type": "PIX_OUT",
      "amount": 100.50,
      "status": "COMPLETED",
      "createdAt": "2025-11-11T18:00:00Z"
    }
  ]
}
```

---

## ⚠️ Erros Comuns

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```
**Causa:** Dados inválidos no body

---

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa:** Token inválido, expirado ou ausente

---

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**Causa:** 
- Tentou acessar recurso de outro usuário (sem ser admin)
- Role insuficiente (precisa de ADMIN)

---

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Customer not found"
}
```
**Causa:** ID inválido ou recurso não existe

---

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Customer already exists for this user"
}
```
**Causa:** Tentou criar recurso duplicado

---

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
**Causa:** Erro no servidor ou na integração com BRX

---

## 📦 Exemplos de Uso (React/Next.js)

### Hook de Autenticação

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch('http://localhost:3333/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('access_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return { token, user, loading, login, logout };
}
```

---

### Hook de Customer

```typescript
// hooks/useCustomer.ts
import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  accountStatus: 'not_requested' | 'requested' | 'in_review' | 'approved' | 'rejected';
  externalClientId?: string;
}

export function useCustomer(token: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchCustomer();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch('http://localhost:3333/customers/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
        setError(null);
      } else if (res.status === 404) {
        setCustomer(null);
        setError('Customer not found');
      } else {
        setError('Failed to fetch customer');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { customer, loading, error, refetch: fetchCustomer };
}
```

---

### Hook de Saldo

```typescript
// hooks/useBalance.ts
import { useState, useEffect } from 'react';

interface Balance {
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  currency: string;
}

export function useBalance(customerId: string | undefined, token: string | null) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId && token) {
      fetchBalance();
    }
  }, [customerId, token]);

  const fetchBalance = async () => {
    if (!customerId || !token) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3333/customers/${customerId}/balance`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return { balance, loading, refetch: fetchBalance };
}
```

---

### Componente de Login

```tsx
// components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      
      <button type="submit">Entrar</button>
    </form>
  );
}
```

---

### Componente de Dashboard

```tsx
// components/Dashboard.tsx
import { useAuth } from '@/hooks/useAuth';
import { useCustomer } from '@/hooks/useCustomer';
import { useBalance } from '@/hooks/useBalance';

export function Dashboard() {
  const { user, token } = useAuth();
  const { customer, loading: loadingCustomer } = useCustomer(token);
  const { balance, loading: loadingBalance } = useBalance(customer?.id, token);

  if (loadingCustomer) {
    return <div>Carregando...</div>;
  }

  if (!customer) {
    return <div>Você ainda não possui cadastro. <a href="/onboarding">Criar conta</a></div>;
  }

  if (customer.accountStatus !== 'approved') {
    return <div>Sua conta está em análise. Status: {customer.accountStatus}</div>;
  }

  return (
    <div>
      <h1>Olá, {customer.name}!</h1>
      
      <div className="balance-card">
        <h2>Saldo Disponível</h2>
        {loadingBalance ? (
          <p>Carregando...</p>
        ) : (
          <p className="balance">
            R$ {balance?.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>
      
      <div className="actions">
        <button>Enviar Pix</button>
        <button>Receber Pix</button>
        <button>Ver Extrato</button>
      </div>
    </div>
  );
}
```

---

## 🔄 Fluxo Completo do Usuário

### 1. Novo Usuário

```
1. POST /auth/register → { email, password }
2. GET /customers/me → 404 (não existe)
3. POST /customers/pf/self → cria customer (status: requested)
4. POST /customers/submit-kyc → submete documentos (status: in_review)
5. Aguardar aprovação admin
6. GET /customers/me → accountStatus: approved
7. Agora pode acessar saldo, enviar Pix, etc
```

### 2. Usuário Existente

```
1. POST /auth/login → { access_token, user }
2. GET /customers/me → { customer data }
3. GET /customers/:id/balance → { balance }
4. GET /customers/:id/statement → { transactions }
```

### 3. Enviar Pix

```
1. GET /pix/transactions/.../precheck?keyValue=... → valida destinatário
2. POST /pix/transactions/.../send → envia Pix
3. Aguardar webhook BRX (atualização automática)
4. GET /customers/:id/balance → saldo atualizado
```

---

## 🌐 Variáveis de Ambiente (Frontend)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME=OTSEM Bank
```

```typescript
// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
```

---

## 📊 Status de Customer (accountStatus)

| Status | Descrição | Ações Permitidas |
|--------|-----------|------------------|
| `not_requested` | Usuário sem customer | Criar customer |
| `requested` | Customer criado, aguardando documentos | Submeter KYC |
| `in_review` | Documentos enviados, em análise | Aguardar aprovação |
| `approved` | Aprovado e credenciado na BRX | Todas as operações |
| `rejected` | Rejeitado pelo admin | Corrigir e resubmeter |

---

## 🔑 Tipos de Chave Pix

| keyType | Formato | Exemplo |
|---------|---------|---------|
| `CPF` | 11 dígitos | `12345678901` |
| `CNPJ` | 14 dígitos | `12345678000190` |
| `EMAIL` | E-mail válido | `joao@exemplo.com` |
| `PHONE` | +55 + DDD + número | `+5511999999999` |
| `EVP` | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |

---

## 🎯 Roles e Permissões

### CUSTOMER
- ✅ Ver próprios dados (customers/me)
- ✅ Atualizar próprios dados
- ✅ Ver próprio saldo/extrato
- ✅ Enviar/receber Pix
- ✅ Gerenciar próprias chaves Pix
- ❌ Ver dados de outros customers
- ❌ Aprovar/rejeitar KYC
- ❌ Acessar /admin/*

### ADMIN
- ✅ Tudo que CUSTOMER pode
- ✅ Listar todos os customers
- ✅ Ver dados de qualquer customer
- ✅ Criar customers para outros usuários
- ✅ Aprovar/rejeitar/revisar KYC
- ✅ Deletar customers
- ✅ Acessar dashboard admin
- ✅ Ver estatísticas

---

**Documentação gerada automaticamente pela API OTSEM Bank**  
**Suporte:** suporte@otsembank.com  
**Repositório:** https://github.com/otsembank/otsem-api
