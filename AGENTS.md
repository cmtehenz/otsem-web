## Project Summary

OtsemPay is a digital banking PWA offering banking services, KYC verification, PIX payments, and cryptocurrency management (Solana and Tron). The customer-facing UI is a mobile-first Progressive Web App optimized for iOS Safari standalone mode.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS 4
- **State Management**: Jotai, Zustand (`src/stores/ui-modals.ts`)
- **Animations**: Framer Motion (spring physics)
- **API Communication**: Axios (`src/lib/http.ts`)
- **Crypto**: @solana/web3.js, TronWeb
- **Form Handling**: React Hook Form, Zod
- **UI Components**: Radix UI, custom BottomSheet
- **i18n**: next-intl (en, pt-BR, es, ru)

## Architecture

- **App Router**: Organized into `(public)`, `admin`, and `customer` routes.
- **Authentication**: JWT-based, managed via `AuthContext` (`src/contexts/auth-context.tsx`).
- **API Integration**: Centralized in `src/lib/http.ts` pointing to `https://api.otsembank.com`.
- **Styling**: Tailwind CSS 4 with CSS variables in `src/app/globals.css`. Brand color: `#6F00FF`.
- **Customer UI**: Mobile-first PWA with fixed glass header, floating liquid glass bottom nav, and bottom sheet modals.

## Customer Layout Architecture

The customer layout (`src/app/customer/layout.tsx`) uses:

1. **MobileHeader** — Fixed glass header with safe area padding via CSS classes
2. **AnimatePresence** — Spring page transitions inside a stable `flex-1` wrapper
3. **BottomNav** — Floating liquid glass nav with center FAB for ActionSheet
4. **Modals** — All rendered at layout level via Zustand store (deposit, withdraw, convert, sell-usdt, send-usdt)

## Key Patterns

### Modals use BottomSheet, not Dialog

All customer modals use `src/components/ui/bottom-sheet.tsx` which handles:
- iOS keyboard resize via `visualViewport` API
- `max-h-[92dvh]` for keyboard awareness
- Auto-scroll focused inputs into view
- Drag-to-dismiss with spring animation
- Safe area bottom padding via `.pwa-sheet-safe-bottom` CSS class

### Safari env() workaround

Safari ignores `env(safe-area-inset-*)` in React inline `style` props. All safe area values are applied via CSS classes defined in `globals.css`.

### Color conventions

- Primary buttons: `from-[#6F00FF] to-[#6F00FF]` hover `hover:from-[#5800CC] hover:to-[#6F00FF]`
- Text gradients: `from-[#6F00FF] to-[#8B2FFF]`
- Never use double-opacity like `bg-[#6F00FF]/50/10` (broken in Tailwind)

## User Preferences

- No comments unless requested.
- Default theme: light.
- Language: Portuguese (Brazil) for UI copy.

## Project Guidelines

- Follow existing patterns for API integration using `http` from `src/lib/http.ts`.
- Use functional components with TypeScript.
- Maintain consistent styling using Tailwind CSS.
- Use BottomSheet (not Dialog) for customer-facing modals.
- Use CSS classes (not inline styles) for `env()` safe area values.

## Common Patterns

- Centralized API calls via Axios instance with JWT interceptors.
- Context-based auth state management.
- Zustand store for modal open/close state (`src/stores/ui-modals.ts`).
- Section-based landing page architecture in `src/components/sections/`.
