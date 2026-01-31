<div align="center">

# 🏦 OtsemPay

### Complete Digital Banking Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/gustavo/otsem-web)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [API](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Internationalization](#-internationalization)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Support](#-support)

---

## 🎯 About

**OtsemPay** is a comprehensive digital banking platform that provides a complete suite of financial services including PIX transfers, cryptocurrency payouts, card payments, and KYC (Know Your Customer) verification workflows.

Built with modern web technologies, OtsemPay delivers a seamless banking experience with:

- 🌍 **Multi-language Support** - Available in 4 languages (English, Portuguese, Spanish, Russian)
- 🔐 **Enterprise Security** - Two-factor authentication, JWT tokens, and role-based access control
- 💱 **Cryptocurrency Integration** - Support for USDT, BTC, ETH payouts with real-time conversion
- 🚀 **Real-time Operations** - Instant PIX transfers and live transaction monitoring
- 📊 **Advanced Analytics** - Comprehensive admin dashboard with KPIs and metrics
- 🎨 **Modern UI/UX** - Built with Tailwind CSS and shadcn/ui components

### Key Highlights

- ✅ Full KYC verification workflow for individuals and companies
- ✅ PIX payment system with QR code generation
- ✅ Multi-currency wallet (BRL, USDT)
- ✅ Admin panel with real-time analytics
- ✅ Responsive design for mobile and desktop
- ✅ Dark/Light theme support
- ✅ Professional-grade code architecture

---

## ✨ Features

### 🔐 Authentication & Security

- **Multi-factor Authentication** - TOTP-based 2FA with backup codes
- **Secure Sessions** - JWT-based authentication with automatic token refresh
- **Password Recovery** - Complete forgot/reset password flow
- **Role-Based Access** - Separate admin and customer interfaces
- **Session Management** - Automatic logout on token expiration

### 👤 KYC (Know Your Customer)

#### For Customers
- Self-service KYC submission
- Document upload and verification
- Real-time status tracking
- KYC tier upgrades

#### For Admins
- Complete KYC management dashboard
- Approve/reject workflows
- Manual KYC creation for PF (individuals) and PJ (companies)
- CEP-based address auto-fill (Brazilian postal code)
- Document review and validation
- Status filtering and search

### 💳 PIX Operations

- **PIX Key Management** - Create, view, and delete PIX keys (CPF, Email, Phone, Random)
- **PIX Transfers** - Instant transfers with recipient validation
- **QR Code Generation** - Dynamic PIX charge QR codes
- **Transaction History** - Complete PIX transaction tracking
- **Pre-validation** - Check recipient details before transfer

### 💰 Cryptocurrency

- **Multi-Currency Support** - USDT, BTC, ETH
- **Real-time Conversion** - BRL to crypto conversion with live rates
- **Wallet Management** - USDT wallet integration
- **Binance Integration** - Live price feeds from Binance API
- **CoinGecko Integration** - USDT/BRL exchange rates
- **Blockchain Support** - Solana and TRON network integration

### 📊 Admin Dashboard

- **Real-time Metrics** - Live KPIs for users, transactions, volume
- **Transaction Analytics** - 7-day and 30-day trend charts
- **User Management** - Complete user administration
- **Client Overview** - Recent users and transactions
- **Quick Actions** - Fast access to common tasks
- **Balance Monitoring** - Track platform BRL and USDT balances
- **Alert System** - Real-time notifications for important events

### 👥 Customer Features

- **Personal Dashboard** - Balance overview and account summary
- **Transaction History** - Complete statement with filters
- **Wallet Management** - View and manage BRL/USDT balances
- **Card Management** - Virtual and physical card administration
- **Account Settings** - Profile and preference management
- **Support Center** - Help and customer support
- **Affiliate Program** - Earn rewards through referrals

### 🌐 Additional Features

- **Internationalization** - Full i18n support with 4 languages
- **Theme Support** - Dark and light mode
- **Responsive Design** - Mobile-first approach
- **File Uploads** - Secure document upload via Uppy + AWS S3
- **Error Tracking** - Comprehensive error reporting
- **Cookie Consent** - GDPR-compliant cookie management
- **SEO Optimized** - Meta tags and OpenGraph support

---

## 🛠 Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.5.11 | React framework with App Router |
| [React](https://react.dev/) | 19.0.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.13 | Utility-first CSS framework |

### UI Components & Styling

- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### State Management & Data Fetching

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Jotai](https://jotai.org/)** - Primitive atomic state
- **[SWR](https://swr.vercel.app/)** - Data fetching and caching
- **[Axios](https://axios-http.com/)** - HTTP client with interceptors

### Forms & Validation

- **[React Hook Form](https://react-hook-form.com/)** - Performant form library
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolver

### Authentication & Security

- **[otplib](https://github.com/yeojz/otplib)** - TOTP/HOTP authentication (v13)
- **[qrcode.react](https://github.com/zpao/qrcode.react)** - QR code generation
- **JWT** - JSON Web Tokens for session management

### Internationalization

- **[next-intl](https://next-intl-docs.vercel.app/)** - i18n for Next.js
- **4 Languages** - English, Portuguese (BR), Spanish, Russian
- **244 Translation Keys** - Complete UI translation

### Blockchain Integration

- **[@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)** - Solana blockchain
- **[TronWeb](https://tronweb.network/)** - TRON blockchain
- **[bs58](https://github.com/cryptocoinjs/bs58)** - Base58 encoding

### File Management

- **[@uppy/core](https://uppy.io/)** - File upload widget
- **[@uppy/aws-s3](https://uppy.io/docs/aws-s3/)** - AWS S3 uploader
- **[@google-cloud/storage](https://cloud.google.com/storage)** - Google Cloud Storage

### Utilities

- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[dayjs](https://day.js.org/)** - Lightweight date library
- **[numeral](http://numeraljs.com/)** - Number formatting
- **[use-debounce](https://github.com/xnimorz/use-debounce)** - Input debouncing
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classNames

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting
- **[@typescript-eslint](https://typescript-eslint.io/)** - TypeScript ESLint
- **[Turbopack](https://turbo.build/pack)** - Fast bundler (Next.js 15)
- **[@vercel/analytics](https://vercel.com/analytics)** - Performance analytics

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** - v9.0.0 or higher (comes with Node.js)
  - Or **yarn** v1.22.0+ / **pnpm** v8.0.0+
- **Git** - Latest version ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/seu-usuario/otsem-web.git
cd otsem-web
```

2. **Install dependencies**

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see [Environment Variables](#environment-variables) below).

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.otsembank.com
NEXT_PUBLIC_GATEWAY_URL=https://apisbank.brxbank.com.br

# Application
NEXT_PUBLIC_APP_NAME=OtsemPay

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://api.otsembank.com` |
| `NEXT_PUBLIC_GATEWAY_URL` | Payment gateway endpoint | `https://apisbank.brxbank.com.br` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `OtsemPay` |

### Running the Application

**Development Mode** (with Turbopack)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production Build**

```bash
# Build the application
npm run build

# Start production server
npm run start
```

**Linting**

```bash
npm run lint
```

---

## 📂 Project Structure

```
otsem-web/
├── public/                          # Static assets
│   ├── fonts/                       # Custom fonts
│   └── images/                      # Images, logos
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (public)/               # Public routes (no auth)
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Registration page
│   │   │   ├── forgot/             # Password recovery
│   │   │   ├── reset/              # Password reset
│   │   │   ├── admin-login/        # Admin login
│   │   │   ├── cookies/            # Cookie policy
│   │   │   └── privacidade/        # Privacy policy
│   │   │
│   │   ├── admin/                  # Admin panel (protected)
│   │   │   ├── dashboard/          # Admin dashboard & analytics
│   │   │   ├── kyc/                # KYC management
│   │   │   │   ├── [id]/          # KYC details/approval
│   │   │   │   └── new/           # Manual KYC creation
│   │   │   │       ├── pf/        # Individual KYC
│   │   │   │       └── pj/        # Company KYC
│   │   │   ├── users/             # User management
│   │   │   ├── clientes/          # Client list & details
│   │   │   ├── pix/               # PIX operations
│   │   │   │   ├── keys/         # PIX key management
│   │   │   │   └── transactions/ # PIX transactions
│   │   │   ├── affiliates/        # Affiliate program management
│   │   │   ├── kyc-upgrades/      # KYC tier upgrades
│   │   │   ├── wallets/           # USDT wallet management
│   │   │   ├── conversions/       # BRL↔USDT conversions
│   │   │   ├── sell-deposits/     # Deposit sales
│   │   │   └── recebidos/         # Received payments
│   │   │
│   │   ├── customer/               # Customer dashboard (protected)
│   │   │   ├── dashboard/         # Customer home
│   │   │   ├── wallet/            # Wallet management
│   │   │   ├── transactions/      # Transaction history
│   │   │   ├── pix/               # PIX operations
│   │   │   ├── kyc/               # KYC submission
│   │   │   ├── card/              # Card management
│   │   │   ├── settings/          # Account settings
│   │   │   ├── support/           # Support center
│   │   │   ├── affiliates/        # Affiliate dashboard
│   │   │   └── logout/            # Logout handler
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── global-error.tsx       # Global error boundary
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (40+)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   └── ... (and more)
│   │   │
│   │   ├── sections/              # Landing page sections
│   │   │   ├── header.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── features-grid.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── comparison.tsx
│   │   │   ├── stats-grid.tsx
│   │   │   ├── trusted-by.tsx
│   │   │   ├── cta-banner.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── AuthenticatedAppShell.tsx
│   │   │   ├── ClientAuthGate.tsx
│   │   │   ├── TopActionsMenu.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   │
│   │   ├── auth/                  # Authentication components
│   │   │   ├── Protected.tsx      # Route protection HOC
│   │   │   ├── RoleGuard.tsx      # Role-based access control
│   │   │   ├── HeaderUserChip.tsx
│   │   │   └── HeaderLogout.tsx
│   │   │
│   │   ├── kyc/                   # KYC components
│   │   │   └── limits-card.tsx
│   │   │
│   │   ├── modals/                # Modal dialogs
│   │   │   ├── ReceiveUsdtModal.tsx
│   │   │   └── send-email-modal.tsx
│   │   │
│   │   ├── brand/                 # Branding
│   │   │   └── Logo.tsx
│   │   │
│   │   ├── CookieConsent.tsx     # GDPR cookie consent
│   │   ├── ErrorReporter.tsx      # Error reporting
│   │   ├── theme-provider.tsx     # Theme context
│   │   └── theme-toggle.tsx       # Dark/Light toggle
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── http.ts               # Axios instance + interceptors
│   │   ├── token.ts              # JWT token management
│   │   ├── env.ts                # Environment variable validation
│   │   ├── utils.ts              # Helper functions (cn, etc.)
│   │   ├── 2fa.ts                # Two-factor auth utilities
│   │   ├── error-utils.ts        # Error handling
│   │   ├── cep.ts                # Brazilian postal code lookup
│   │   ├── haptics.ts            # Mobile haptic feedback
│   │   ├── useUsdtRate.ts        # USDT/BRL rate hook
│   │   └── kyc/                  # KYC utilities
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.ts         # Mobile detection
│   │   └── use-health-check.ts   # API health check
│   │
│   ├── contexts/                  # React contexts
│   │   ├── auth-context.tsx      # Authentication state
│   │   └── actions-menu.tsx      # Actions menu state
│   │
│   ├── stores/                    # Zustand stores
│   │   └── ui-modals.ts          # Modal state management
│   │
│   ├── types/                     # TypeScript type definitions
│   │   └── wallet.ts             # Wallet types
│   │
│   ├── i18n/                      # Internationalization
│   │   └── request.ts            # i18n configuration
│   │
│   └── pages/                     # API routes (legacy)
│       └── api/
│           └── usdt-rate.ts      # USDT rate endpoint
│
├── messages/                      # i18n translation files
│   ├── en.json                    # English
│   ├── pt-BR.json                 # Portuguese (Brazil)
│   ├── es.json                    # Spanish
│   └── ru.json                    # Russian
│
├── .env.example                   # Environment variables template
├── next.config.ts                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

---

## 🔌 API Reference

### Base URLs

- **Main API**: `NEXT_PUBLIC_API_URL`
- **Gateway**: `NEXT_PUBLIC_GATEWAY_URL`

### Authentication Endpoints

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "cpf": "12345678900"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer {access_token}
```

### Customer Endpoints

#### Get Balance

```http
GET /customers/{customerId}/balance
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "brl": 1000.50,
  "usdt": 200.00
}
```

#### Get Statement

```http
GET /customers/{customerId}/statement?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {access_token}
```

### PIX Endpoints

#### List PIX Keys

```http
GET /pix/keys
Authorization: Bearer {access_token}
```

#### Create PIX Key

```http
POST /pix/keys
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "EMAIL",
  "value": "user@example.com"
}
```

#### PIX Transfer

```http
POST /pix/transfer
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "pixKey": "user@example.com",
  "amount": 100.00,
  "description": "Payment"
}
```

### Admin Endpoints

#### Dashboard Summary

```http
GET /admin/dashboard/summary
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "totalUsers": 1500,
  "totalTransactions": 5000,
  "totalVolume": 1000000.00,
  "totalPixTransactions": 3000,
  "totalCardTransactions": 2000
}
```

#### List Customers

```http
GET /customers?status=approved&page=1&limit=20
Authorization: Bearer {access_token}
```

#### Approve KYC

```http
PATCH /customers/{customerId}/approve-kyc
Authorization: Bearer {access_token}
```

#### Reject KYC

```http
PATCH /customers/{customerId}/reject-kyc
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Invalid document"
}
```

### Error Responses

All API errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

**Common HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

### Writing Tests

Example component test:

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/otsem-web)

### Docker

```bash
# Build the image
docker build -t otsem-web .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.otsembank.com otsem-web
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start the server
npm run start
```

### Environment-Specific Configuration

**Production:**
- Set `NODE_ENV=production`
- Configure production API URLs
- Enable analytics and error tracking
- Use CDN for static assets

**Staging:**
- Use staging API endpoints
- Enable debug mode
- Test new features before production

---

## 🌐 Internationalization

### Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Portuguese (Brazil) | `pt-BR` | ✅ Complete |
| Spanish | `es` | ✅ Complete |
| Russian | `ru` | ✅ Complete |

### Adding a New Language

1. **Create translation file**

```bash
cp messages/en.json messages/fr.json
```

2. **Translate all keys** in the new file

3. **Update Next.js config** in `next.config.ts`:

```typescript
i18n: {
  locales: ['en', 'pt-BR', 'es', 'ru', 'fr'],
  defaultLocale: 'pt-BR'
}
```

4. **Add language to switcher** in [LanguageSwitcher.tsx](src/components/layout/LanguageSwitcher.tsx)

### Translation Keys

All translation keys are organized by feature:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  },
  "dashboard": {
    "welcome": "Welcome"
  }
}
```

### Using Translations

```typescript
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')

  return <button>{t('save')}</button>
}
```

---

## 🔒 Security

### Authentication

- **JWT Tokens** - Secure token-based authentication
- **Token Refresh** - Automatic token renewal
- **HTTP-only Cookies** - Secure token storage (optional)
- **CSRF Protection** - Cross-site request forgery prevention

### Two-Factor Authentication

- **TOTP** - Time-based One-Time Password (RFC 6238)
- **Backup Codes** - 8-digit recovery codes
- **QR Code Setup** - Easy 2FA enrollment

### Data Protection

- **HTTPS Only** - All communication encrypted
- **Input Sanitization** - XSS prevention
- **SQL Injection Prevention** - Parameterized queries
- **Rate Limiting** - DDoS protection (planned)

### Best Practices

- Regular security audits
- Dependency updates
- Secure environment variables
- No sensitive data in logs
- GDPR compliance

### Reporting Security Issues

Please report security vulnerabilities to: **security@otsembank.com**

---

## 🗺 Roadmap

### ✅ Completed

- [x] Core authentication system
- [x] KYC workflow for PF and PJ
- [x] PIX integration
- [x] Admin dashboard
- [x] Multi-language support
- [x] Two-factor authentication
- [x] Cryptocurrency payouts
- [x] Dark/Light theme

### 🚧 In Progress

- [ ] Mobile app (React Native)
- [ ] Webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Automated document verification (OCR)

### 📅 Planned - Q1 2026

- [ ] Card issuance system
- [ ] Recurring payments
- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Direct debit integration

### 🔮 Future

- [ ] Open banking integration
- [ ] Investment platform
- [ ] Loan management system
- [ ] White-label solution
- [ ] Mobile SDKs

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**

```bash
git clone https://github.com/seu-usuario/otsem-web.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes** and commit

```bash
git commit -m 'Add: Amazing new feature'
```

4. **Push to your branch**

```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication
fix(pix): resolve transfer validation bug
docs(readme): update installation instructions
```

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Pull Request Guidelines

- ✅ Update documentation if needed
- ✅ Add tests for new features
- ✅ Ensure all tests pass
- ✅ Follow the code style guide
- ✅ Write clear PR descriptions

### Code of Conduct

Please be respectful and constructive. We're all here to build great software together.

---

## ❓ Troubleshooting

### Common Issues

#### Port 3000 is already in use

```bash
# Kill the process using port 3000
npx kill-port 3000

# Or run on a different port
PORT=3001 npm run dev
```

#### Module not found errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Environment variables not loading

- Ensure `.env.local` exists in the root directory
- Restart the development server after changing env vars
- Variables must start with `NEXT_PUBLIC_` to be available in the browser

#### Authentication issues

- Check that `NEXT_PUBLIC_API_URL` is correct
- Verify the backend API is running
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

### Getting Help

- 📖 Check the [documentation](#documentation)
- 🐛 [Open an issue](https://github.com/seu-usuario/otsem-web/issues)
- 💬 Join our community chat
- 📧 Email: support@otsembank.com

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 OTSEM Bank

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Support

### Contact

- **Email**: support@otsembank.com
- **Documentation**: [docs.otsembank.com](https://docs.otsembank.com)
- **GitHub Issues**: [Report a bug](https://github.com/seu-usuario/otsem-web/issues)

### Resources

- [Official Website](https://otsembank.com)
- [API Documentation](https://api.otsembank.com/docs)
- [Developer Portal](https://developers.otsembank.com)
- [Status Page](https://status.otsembank.com)

### Community

- [Discord Server](https://discord.gg/otsem)
- [Twitter](https://twitter.com/otsembank)
- [LinkedIn](https://linkedin.com/company/otsem)

---

## 👨‍💻 Authors

**Gustavo Altevir da Costa**
- GitHub: [@gustavo](https://github.com/gustavo)
- Email: gustavo@otsembank.com

### Contributors

Thank you to all our contributors! 🙏

<a href="https://github.com/seu-usuario/otsem-web/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=seu-usuario/otsem-web" />
</a>

---

## 🙏 Acknowledgments

Special thanks to:

- [shadcn](https://twitter.com/shadcn) for the amazing UI components
- [Vercel](https://vercel.com) for the incredible Next.js framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [ViaCEP](https://viacep.com.br/) for the Brazilian postal code API
- [Lucide](https://lucide.dev/) for the beautiful icon set
- All our open-source contributors

---

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/seu-usuario/otsem-web?style=social)
![GitHub forks](https://img.shields.io/github/forks/seu-usuario/otsem-web?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/seu-usuario/otsem-web?style=social)

![GitHub issues](https://img.shields.io/github/issues/seu-usuario/otsem-web)
![GitHub pull requests](https://img.shields.io/github/issues-pr/seu-usuario/otsem-web)
![GitHub last commit](https://img.shields.io/github/last-commit/seu-usuario/otsem-web)

---

<div align="center">

### Built with ❤️ by the OTSEM Bank team

**[Website](https://otsembank.com)** • **[Documentation](https://docs.otsembank.com)** • **[API](https://api.otsembank.com)**

</div>
