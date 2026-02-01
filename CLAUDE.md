# CLAUDE.md

Project context and conventions for AI coding assistants.

## Project Overview

OtsemPay is a digital banking PWA built with Next.js 15 (App Router), React 19, Tailwind CSS 4, and Framer Motion. The customer-facing UI is a mobile-first Progressive Web App optimized for iOS Safari standalone mode.

## Commands

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build (also runs ESLint via next lint)
npm run lint         # ESLint only
```

## Architecture

- **App Router**: Routes split into `(public)`, `admin`, and `customer` groups
- **Auth**: JWT-based via `AuthContext` (`src/contexts/auth-context.tsx`)
- **HTTP**: Centralized Axios instance with interceptors (`src/lib/http.ts`)
- **State**: Zustand for modal state (`src/stores/ui-modals.ts`), Jotai for atoms
- **i18n**: `next-intl` with translations in `messages/` (en, pt-BR, es, ru)

## Key Conventions

### Color System

Brand purple is `#6F00FF`. Supporting shades:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6F00FF` | Buttons, text, accents |
| Medium | `#8B2FFF` | Gradient endpoints, dark mode |
| Light | `#9B4DFF` | Lighter gradient endpoints |
| Dark | `#5800CC` | Hover states on buttons |

**Do NOT use double-opacity Tailwind classes** like `bg-[#6F00FF]/50/10` — they produce broken output. Use single opacity: `bg-[#6F00FF]/10`.

For button gradients: `from-[#6F00FF] to-[#6F00FF]` with hover `hover:from-[#5800CC] hover:to-[#6F00FF]`.

For text gradients: `from-[#6F00FF] to-[#8B2FFF]` (vibrant, not washed).

### Safari `env()` Bug

Safari ignores `env(safe-area-inset-*)` in React inline `style` props. Always use CSS classes from `globals.css`:

- `.pwa-header-content` / `.pwa-header-glass` / `.pwa-header-spacer` — Header safe areas
- `.pwa-nav-bottom` / `.pwa-nav-spacer` — Bottom nav positioning
- `.pwa-sheet-safe-bottom` — Bottom sheet padding
- `.pwa-install-prompt-bottom` — PWA install prompt positioning

### Modals = BottomSheet (not Dialog)

All customer-facing modals use `BottomSheet` (`src/components/ui/bottom-sheet.tsx`), not `Dialog`. This component:

- Uses `visualViewport` API to resize when iOS keyboard opens
- Has spring animation (stiffness: 420, damping: 36)
- Supports drag-to-dismiss
- Auto-scrolls focused inputs into view
- Uses `max-h-[92dvh]` (not `vh`) for keyboard awareness

### Page Transitions

Customer layout (`src/app/customer/layout.tsx`) uses Framer Motion spring transitions:

```
initial: { opacity: 0, y: 6, scale: 0.97 }
animate: { opacity: 1, y: 0, scale: 1 }
exit:    { opacity: 0, scale: 0.97 }
spring:  { stiffness: 380, damping: 30, mass: 0.8 }
```

The `AnimatePresence` is wrapped in a stable `flex-1` div to prevent bottom nav snapping during page transitions.

### Bottom Nav

`BottomNav` (`src/components/layout/BottomNav.tsx`) uses `.liquid-glass-nav` CSS class for glassmorphism. It's `position: fixed` with a spacer div in normal flow. The center FAB opens `ActionSheet` for quick actions.

### Theme

Default theme is `light` (set in `ThemeProvider` in `src/app/layout.tsx`). The PWA theme color is `#6F00FF`.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/customer/layout.tsx` | Customer layout with header, transitions, bottom nav |
| `src/components/layout/MobileHeader.tsx` | Fixed glass header with safe area |
| `src/components/layout/BottomNav.tsx` | Floating liquid glass navigation |
| `src/components/layout/ActionSheet.tsx` | Quick actions (deposit, withdraw, etc.) |
| `src/components/ui/bottom-sheet.tsx` | Base bottom sheet with keyboard handling |
| `src/components/modals/deposit-modal.tsx` | PIX deposit flow |
| `src/components/modals/withdraw-modal.tsx` | PIX withdrawal flow |
| `src/components/modals/convert-modal.tsx` | BRL to USDT conversion |
| `src/components/modals/sell-usdt-modal.tsx` | USDT to BRL sale |
| `src/components/modals/send-usdt-modal.tsx` | USDT external transfer |
| `src/components/modals/kyc-upgrade-modal.tsx` | KYC document upload |
| `src/components/layout/PwaInstallPrompt.tsx` | iOS "Add to Home Screen" prompt |
| `src/app/globals.css` | CSS variables, safe area classes, liquid glass styles |
| `public/manifest.json` | PWA manifest |
| `src/stores/ui-modals.ts` | Zustand store for modal open/close state |

## PWA Configuration

- `public/manifest.json` — name, icons, display: standalone, theme_color
- `public/apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png`, `icon-1024.png`
- `src/app/layout.tsx` — meta tags: `apple-mobile-web-app-capable`, viewport-fit cover
- `src/components/CookieConsent.tsx` — hidden in PWA standalone mode
- `src/components/layout/PwaInstallPrompt.tsx` — iOS Safari detection, localStorage persistence

## Linting

ESLint runs as part of `next build` via `lint-staged`. Key rules:
- `@typescript-eslint/no-explicit-any` — use `unknown` instead of `any`
- `react/no-unescaped-entities` — use `&ldquo;` / `&rdquo;` for quotes in JSX
- Unused variables must be prefixed with `_`
