## Project Summary
OTSEM Bank is a modern fintech platform offering banking services, KYC verification, PIX payments, and cryptocurrency management (Solana and Tron).

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS 4
- **State Management**: Jotai, Zustand
- **Animations**: Framer Motion
- **API Communication**: Axios (custom `httpClient`)
- **Crypto**: @solana/web3.js, TronWeb
- **Form Handling**: React Hook Form, Zod
- **UI Components**: Radix UI

## Architecture
- **App Router**: Organized into `(public)`, `admin`, and `customer` routes.
- **Authentication**: JWT-based, managed via `AuthContext` using a custom backend API.
- **API Integration**: Centralized in `src/lib/http.ts` pointing to `https://api.otsembank.com`.
- **Styling**: Tailwind CSS with a focus on custom sections in `src/components/sections`.

## User Preferences
- No comments unless requested.

## Project Guidelines
- Follow existing patterns for API integration using `httpClient`.
- Use functional components with TypeScript.
- Maintain consistent styling using Tailwind CSS.

## Common Patterns
- Centralized API calls in `src/lib/api`.
- Context-based auth state management.
- Section-based landing page architecture.
