# OtsemPay - Digital Banking Platform

## Overview

OtsemPay is a digital banking platform built with Next.js 14 that provides comprehensive financial services including PIX payments, BRL/USDT cryptocurrency conversion, card payments, and KYC management. The application serves two user roles: customers who access banking features and administrators who manage the platform.

## Recent Changes (Jan 2026)

- **KYC Upgrade Request System**: Complete workflow for customers to request KYC level upgrades:
  - Customer modal (`KycUpgradeModal`) with document upload using presigned URLs
  - Two-step upload flow: request presigned URL → upload directly to Object Storage
  - Admin listing page at `/admin/kyc-upgrades` with stats cards (pending, approved, rejected)
  - Admin detail page at `/admin/kyc-upgrades/[id]` with document viewing and approve/reject actions
  - Sidebar menu: "Upgrades KYC" under Usuários & Carteiras
  - API routes:
    - `POST /api/uploads/request-url` - Generate presigned upload URL
    - `POST /api/uploads/signed-url` - Generate signed viewing URL
    - `POST /api/kyc-upgrade-requests` - Create upgrade request
    - `GET /api/kyc-upgrade-requests?status=X` - List requests (admin)
    - `GET /api/kyc-upgrade-requests/:id` - Get request details
    - `POST /api/kyc-upgrade-requests/:id/approve` - Approve request
    - `POST /api/kyc-upgrade-requests/:id/reject` - Reject request

## Previous Changes (Dec 2025)

- **Landing Page Light Theme**: Complete conversion to light theme with:
  - Background changed from dark (#0a0118) to light (#faf9fe)
  - All text colors converted to slate palette (slate-900, slate-600, slate-500)
  - Section backgrounds use white and slate-50 for contrast
  - Header with white/transparent transition on scroll
  - Feature cards with light gradients (violet-50, green-50, amber-50)
  - Phone mockups kept in dark mode for visual contrast
  - Footer with slate-50 background
  - Brand colors maintained: amber-500 (Otsem), violet-600 (Pay)
  - Uses logo-light.png for light theme compatibility

- **Affiliate System Frontend**: Complete admin affiliate management:
  - Admin listing page at `/admin/affiliates` with stats cards (total, active, clients, commissions)
  - Create affiliate modal with code, name, email, spread rate
  - Detail page at `/admin/affiliates/[id]` with client list and commissions tabs
  - Activate/deactivate affiliates, pay commissions functionality
  - Registration form includes optional affiliate code field with real-time validation

- **USDT SELL Flow (Dec 27, 2025)**: Complete USDT → BRL conversion with client-side signing:
  - Customer modal (`SellUsdtModal`) with secure flow:
    1. Choose network (Solana/Tron) and select wallet from list
    2. Enter USDT amount
    3. Paste private key (never sent to server)
    4. Frontend builds, signs, and submits transaction directly to blockchain
    5. Submit txHash to backend for registration
  - Uses TronWeb for TRON, @solana/web3.js + @solana/spl-token for Solana
  - Private key stays in browser, only txHash is sent to backend
  - Admin page `/admin/sell-deposits` to manage pending sell deposits
  - Sidebar menu: "Compras USDT" and "Vendas USDT" under Operações
  - Backend endpoints:
    - `GET /wallet/usdt` - List customer USDT wallets
    - `GET /wallet/sell-tx-data?walletId=X&usdtAmount=Y&network=Z` - Transaction data
    - `POST /wallet/submit-signed-sell` - Submit txHash { walletId, usdtAmount, network, txHash }
    - `GET /wallet/pending-sell-deposits` - List pending (admin)

## User Preferences

Preferred communication style: Simple, everyday language.

## Theme System

The app uses **next-themes** for light/dark mode switching:
- **Default theme**: Dark mode
- **Toggle location**: Header (customer layout) - sun/moon icons
- **Storage**: localStorage with `theme` key
- **CSS variables**: Defined in `globals.css` with `:root` (light) and `.dark` (dark) selectors
- **Color scheme**: 
  - Light: `#f8f7fc` background, `#1a1025` text
  - Dark: `#0a0118` background, `#f8f7fc` text
- **Brand colors**: Violet/purple gradients maintained in both themes
- **Components**: ThemeProvider (`src/components/theme-provider.tsx`), ThemeToggle (`src/components/theme-toggle.tsx`)

## System Architecture

### Frontend Framework
- **Next.js 14 with App Router**: The application uses the modern App Router pattern with server and client components. Route groups organize pages by access level: `(public)` for authentication pages, `customer` for customer-facing features, and `admin` for administrative functions.

### Component Architecture
- **shadcn/ui + Radix UI**: The UI layer uses shadcn/ui components built on Radix UI primitives, configured in `components.json`. Components live in `src/components/ui/` and follow the "new-york" style variant.
- **Component Organization**: Custom components are organized by function - `auth/` for authentication, `layout/` for structural components, `modals/` for dialog components, and `brand/` for branding elements.

### State Management
- **Zustand**: Global UI state (modal visibility) is managed via Zustand stores in `src/stores/ui-modals.ts`.
- **React Context**: Authentication state uses React Context (`src/contexts/auth-context.tsx`) wrapping the entire application.
- **SWR pattern**: Some data fetching uses the SWR pattern for caching and revalidation.

### Authentication Flow
- **JWT-based authentication**: Tokens are stored in localStorage via `src/lib/token.ts`. The HTTP client (`src/lib/http.ts`) automatically attaches Bearer tokens to requests.
- **Role-based access control**: Two roles exist - ADMIN and CUSTOMER. Protected routes use `<Protected>` and `<RoleGuard>` components to enforce access.
- **Token refresh**: The auth context handles token validation and automatic logout on 401 responses.

### API Communication
- **Axios HTTP client**: Centralized in `src/lib/http.ts` with request/response interceptors for authentication and error handling.
- **API proxy rewrites**: Next.js rewrites in `next.config.ts` proxy `/auth/*` and `/pix/*` routes to the backend API.
- **Backend expects**: The API follows REST conventions with endpoints documented in `API_SPEC.md`.

### Form Handling
- **React Hook Form + Zod**: All forms use React Hook Form with Zod schema validation via `@hookform/resolvers`. The pattern casts resolvers to avoid TypeScript strictness issues.

### Styling
- **Tailwind CSS 4**: Uses the new CSS-based configuration with `@theme` directives in `globals.css`. CSS variables define the color system for light/dark mode support.
- **Class Variance Authority**: Button and badge variants use CVA for consistent styling patterns.

### Key Application Features
1. **Customer Dashboard**: Balance display, transaction history, PIX payments
2. **KYC Onboarding**: Multi-step form for PF (individual) and PJ (business) verification with CEP lookup integration
3. **Admin Dashboard**: KPIs, user management, transaction monitoring, banking integration
4. **Cryptocurrency**: USDT rate fetching, BRL/USDT conversion modals

## External Dependencies

### Backend API
- **REST API**: Backend runs at `NEXT_PUBLIC_API_URL` (default `http://localhost:3333`). Endpoints include `/auth/*`, `/customers/*`, `/pix/*`, and admin routes.
- **Banking Integration**: The admin dashboard consumes banking data including balance (saldo) and transaction history (extrato).

### Third-Party Services
- **Didit**: AI-powered identity verification service for KYC. Simplified flow - user clicks "Iniciar Verificação" and is redirected to Didit for document + selfie verification. Backend endpoints: `POST /customers/:id/kyc/request` creates session and returns verification URL. Webhooks handled by backend at `/didit/webhooks/verification`. The KYC page (`/customer/kyc`) shows current status and allows starting verification directly without pre-filling forms.
- **ViaCEP**: Brazilian postal code lookup API (`https://viacep.com.br/ws/`) for address autocomplete in KYC forms.
- **Yahoo Finance**: USDT/BRL rate fetching via `/api/usdt-rate` API route that proxies to Yahoo Finance.
- **Vercel Analytics**: Client-side analytics integration via `@vercel/analytics`.

### UI Libraries
- **Lucide React**: Icon library used throughout the application.
- **Sonner**: Toast notification system configured in the root layout.
- **Framer Motion**: Animation library available for transitions.
- **date-fns/dayjs**: Date formatting utilities.
- **qrcode**: QR code generation for PIX and crypto receive addresses.