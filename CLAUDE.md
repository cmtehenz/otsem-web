# CLAUDE.md

Project context and conventions for AI coding assistants.

## Project Overview

OtsemPay is a digital banking PWA built with Next.js 15 (App Router), React 19, Tailwind CSS 4, and Framer Motion. The customer-facing UI is a mobile-first Progressive Web App optimized for iOS Safari standalone mode with a **Hyper-Premium "Liquid Glass"** design language.

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

### Design Language — Liquid Glass

The UI follows an Apple-inspired "Liquid Glass" aesthetic with layered glassmorphism, spring physics, and edge-to-edge gradients.

#### Background

The app uses a fixed 120dvh vivid purple-to-black gradient (`fintech-bg-layer`) that extends behind the iOS status bar and home indicator for true edge-to-edge fullscreen. The gradient is defined in `globals.css` with 11 stops from `#7B22FF` to `#000000`.

- `html` background: `#000000` (fallback, matches gradient bottom)
- `body` background: `transparent` (lets gradient show through)
- The gradient layer is placed **outside** the flex layout wrapper in `customer/layout.tsx`

#### Glassmorphism Tiers

| Tier | Blur | Saturate | Usage |
|------|------|----------|-------|
| Standard | `blur(20px)` | `180%` | `.ios-glass`, cards |
| Rich | `blur(40px)` | `200%` | `.rich-glass`, `.liquid-glass` |
| Ultra | `blur(64px)` | `200%` | `.liquid-glass-dock`, premium card |

#### Color System

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

#### Typography

- Font stack: SF Pro Display / SF Pro Text via `-apple-system, BlinkMacSystemFont`
- Text rendering: `-webkit-font-smoothing: antialiased`, `font-feature-settings: "kern" 1, "liga" 1, "calt" 1`
- **All customer-facing text is white** — no grey (`#94A3B8`) or low-opacity (`white/40`, `white/35`) text on the purple gradient background
- Inactive navigation labels: `text-white/70` (not dimmer)

#### Animation System

All touch interactions use Framer Motion spring physics:

| Context | Config |
|---------|--------|
| Touch feedback | `whileTap={{ scale: 0.97 }}`, spring `stiffness: 500, damping: 25` |
| Page transitions | spring `stiffness: 380, damping: 30, mass: 0.8` |
| Scroll-hide nav | spring `stiffness: 400, damping: 35, mass: 0.8` |
| Apple easing (CSS) | `cubic-bezier(0.32, 0.72, 0, 1)` |

CSS animations in `globals.css`:
- `shimmer` — sweeping light reflection (`animate-ios-shimmer` class with `::before` pseudo-element)
- `liquid-shimmer` / `liquid-breathe` — dock ambient effects
- `fade-in`, `ios-bounce`, `ios-pulse`, `float`, `ios-scale-in`, `ios-slide-up`, `ios-blur-in`, `subtle-float`, `gradient-shift`

### Safari `env()` Bug

Safari ignores `env(safe-area-inset-*)` in React inline `style` props. Always use CSS classes from `globals.css`:

- `.pwa-header-premium` — Header safe area: `calc(env(safe-area-inset-top) + 2rem)` top, `1.5rem` bottom
- `.pwa-dock-safe-bottom` — Content padding above floating dock: `calc(1.5rem + env(safe-area-inset-bottom))`
- `.pwa-sheet-safe-bottom` — Bottom sheet padding
- `.pwa-install-prompt-bottom` — PWA install prompt positioning

### Modals = BottomSheet (not Dialog)

All customer-facing modals use `BottomSheet` (`src/components/ui/bottom-sheet.tsx`), not `Dialog`. This component:

- Uses `visualViewport` API to resize when iOS keyboard opens
- Has spring animation (stiffness: 420, damping: 36)
- Supports drag-to-dismiss
- Auto-scrolls focused inputs into view
- Uses `max-h-[92dvh]` (not `vh`) for keyboard awareness
- Shadow: `0 -20px 40px -10px rgba(0,0,0,0.5)`

### Page Transitions

Customer layout (`src/app/customer/layout.tsx`) uses Framer Motion spring transitions:

```
initial: { opacity: 0, y: 6, scale: 0.97 }
animate: { opacity: 1, y: 0, scale: 1 }
exit:    { opacity: 0, scale: 0.97 }
spring:  { stiffness: 380, damping: 30, mass: 0.8 }
```

The `AnimatePresence` is wrapped in a stable `flex-1` div to prevent bottom nav snapping during page transitions.

### Bottom Nav — Floating Liquid Glass Dock

`BottomNav` (`src/components/layout/BottomNav.tsx`) is a floating pill-shaped dock:

- 72px height, `rounded-full`, 92% viewport width, max 400px
- Positioned `fixed bottom-8` centered with `left-1/2 -translate-x-1/2`
- Uses `.liquid-glass-dock` CSS class: `blur(64px) saturate(200%)`, gradient border via `mask-composite` pseudo-element
- Animated glow orb (`layoutId="active-pill"`) slides behind active tab
- Scroll-aware auto-hide with spring-animated translateY
- Center FAB opens `ActionSheet` for quick actions (deposit, withdraw, etc.)

### Header

`MobileHeader` (`src/components/layout/MobileHeader.tsx`):

- Uses `.pwa-header-premium` for safe area padding
- 48px logo (`object-contain`, no frame/border-radius)
- Greeting: `text-[17px] font-semibold text-white`
- Name: `text-[22px] font-bold text-white tracking-tight`
- Bell/User icons: `text-white/90`, `w-10 h-10` circular buttons with `whileTap={{ scale: 0.97 }}`

### Theme

Default theme is `light` (set in `ThemeProvider` in `src/app/layout.tsx`). The PWA theme color is `#6F00FF`.

## Key Files

| File | Purpose |
|------|---------|
| `src/app/customer/layout.tsx` | Customer layout with header, transitions, bottom nav, edge-to-edge bg |
| `src/components/layout/MobileHeader.tsx` | Premium header with safe area, greeting, icons |
| `src/components/layout/BottomNav.tsx` | Floating liquid glass dock with glow orb |
| `src/components/layout/ActionSheet.tsx` | Quick actions (deposit, withdraw, convert, etc.) |
| `src/components/ui/bottom-sheet.tsx` | Base bottom sheet with keyboard handling |
| `src/components/modals/deposit-modal.tsx` | PIX deposit flow |
| `src/components/modals/withdraw-modal.tsx` | PIX withdrawal flow |
| `src/components/modals/convert-modal.tsx` | BRL to USDT conversion |
| `src/components/modals/sell-usdt-modal.tsx` | USDT to BRL sale |
| `src/components/modals/send-usdt-modal.tsx` | USDT external transfer |
| `src/components/modals/kyc-upgrade-modal.tsx` | KYC document upload |
| `src/components/layout/PwaInstallPrompt.tsx` | iOS "Add to Home Screen" prompt |
| `src/app/globals.css` | CSS variables, safe area classes, liquid glass styles, keyframes |
| `public/manifest.json` | PWA manifest |
| `src/stores/ui-modals.ts` | Zustand store for modal open/close state |

## PWA Configuration

- `public/manifest.json` — name, icons, display: standalone, theme_color
- `public/apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png`, `icon-1024.png`
- `src/app/layout.tsx` — meta tags: `apple-mobile-web-app-capable`, viewport-fit cover, `statusBarStyle: "black-translucent"`
- Splash screen: inline `#splash-screen` div with matching purple gradient, dismissed by `SplashDismiss` component on hydration
- `src/components/CookieConsent.tsx` — hidden in PWA standalone mode
- `src/components/layout/PwaInstallPrompt.tsx` — iOS Safari detection, localStorage persistence

## Linting

ESLint runs as part of `next build` via `lint-staged`. Key rules:
- `@typescript-eslint/no-explicit-any` — use `unknown` instead of `any`
- `react/no-unescaped-entities` — use `&ldquo;` / `&rdquo;` for quotes in JSX
- Unused variables must be prefixed with `_`
