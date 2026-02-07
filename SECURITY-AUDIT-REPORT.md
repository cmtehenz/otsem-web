# OtsemPay Security Audit Report

**Date:** February 7, 2026
**Scope:** Full frontend codebase (`/home/user/otsem-web/src/`)
**Method:** Manual code review + dependency analysis
**Application:** OtsemPay Digital Banking PWA (Next.js 15 / React 19)

---

## Executive Summary

This audit identified **47 security findings** across 10 categories in the OtsemPay frontend codebase. The application handles sensitive financial operations (BRL/USDT conversions, PIX transactions, crypto wallets, KYC documents) and exhibits several critical vulnerabilities that require immediate remediation before production deployment.

**All route protection and authorization is client-side only** — there is no Next.js `middleware.ts`. The application's security relies entirely on the backend API for enforcement, making the frontend a thin trust boundary.

| Severity | Count | Key Areas |
|----------|-------|-----------|
| **CRITICAL** | 10 | JWT in localStorage, no CSRF, weak 2FA RNG, private key display, no server-side middleware, missing security headers |
| **HIGH** | 12 | No rate limiting, open redirect, IDOR risks, insecure cookie, missing file validation, no malware scanning |
| **MEDIUM** | 15 | JWT decoded without verification, console logging, incomplete auth flows, insufficient crypto address validation |
| **LOW** | 10 | Missing autocomplete attrs, error message disclosure, cookie attributes, CSP inline styles |

---

## Table of Contents

1. [Authentication & Session Management](#1-authentication--session-management)
2. [HTTP Client & API Security](#2-http-client--api-security)
3. [Input Validation & XSS Prevention](#3-input-validation--xss-prevention)
4. [Sensitive Data Exposure](#4-sensitive-data-exposure)
5. [Dependency Vulnerabilities](#5-dependency-vulnerabilities)
6. [Cryptocurrency & Blockchain Security](#6-cryptocurrency--blockchain-security)
7. [File Upload Security](#7-file-upload-security)
8. [Route Protection & Authorization](#8-route-protection--authorization)
9. [Remediation Roadmap](#9-remediation-roadmap)
10. [Positive Security Practices](#10-positive-security-practices)

---

## 1. Authentication & Session Management

### CRITICAL: JWT Tokens Stored in localStorage (XSS Risk)
- **File:** `src/lib/token.ts:15-18`
- **Issue:** Access and refresh tokens are stored in `localStorage`, which is fully accessible to any JavaScript running on the page. A single XSS vulnerability enables complete account takeover.
- **Recommendation:** Migrate to HttpOnly, Secure, SameSite cookies set by the backend.

### CRITICAL: No CSRF Protection
- **Files:** `src/lib/http.ts`, `src/components/auth/RegisterForm.tsx:334`
- **Issue:** No CSRF token mechanism exists for state-changing requests (POST/PUT/DELETE). All financial operations (transfers, conversions, withdrawals) are vulnerable.
- **Recommendation:** Implement double-submit cookie or synchronizer token pattern on all state-changing endpoints.

### CRITICAL: Weak Backup Code Generation (Math.random)
- **File:** `src/lib/2fa.ts:60-68`
- **Issue:** Backup codes use `Math.random()`, which is not cryptographically secure. Codes are predictable.
- **Recommendation:** Use `crypto.getRandomValues()` or generate backup codes server-side.

### CRITICAL: No Rate Limiting on Authentication Endpoints
- **Files:** `src/app/(public)/login/LoginPageClient.tsx`, `src/app/(public)/register/page.tsx`, `src/app/(public)/forgot/page.tsx`
- **Issue:** Login, registration, password reset, and 2FA verification have no rate limiting. The 30-second client-side cooldown on password reset is trivially bypassed.
- **Recommendation:** Implement server-side rate limiting with exponential backoff and account lockout.

### HIGH: JWT Decoded Without Signature Verification
- **File:** `src/contexts/auth-context.tsx:47-54`
- **Issue:** JWT is decoded with `atob(token.split('.')[1])` — no signature check. Forged tokens with arbitrary claims will be accepted by the client.
- **Recommendation:** Always verify JWT signatures server-side. Client-side decode is acceptable only for UI display, never for authorization decisions.

### HIGH: Insecure Cookie in RegisterForm
- **File:** `src/components/auth/RegisterForm.tsx:342-347`
- **Issue:** Access token set as a cookie without `HttpOnly` or `Secure` flags, and redundantly alongside localStorage storage.
- **Recommendation:** Remove client-side cookie setting. Have the backend set HttpOnly cookies.

### HIGH: Admin Login Missing 2FA
- **File:** `src/app/(public)/admin-login/page.tsx:37-57`
- **Issue:** Admin accounts do not require 2FA despite being high-privilege accounts.
- **Recommendation:** Enforce mandatory 2FA for all admin accounts.

### HIGH: No Server-Side Session Invalidation on Logout
- **File:** `src/contexts/auth-context.tsx:268-272`
- **Issue:** Logout clears localStorage only. The JWT remains valid on the backend until expiration.
- **Recommendation:** Call a backend `/auth/logout` endpoint to invalidate the token server-side. Implement token blocklist.

### MEDIUM: No Periodic Token Expiration Check
- **File:** `src/contexts/auth-context.tsx:63-126`
- **Issue:** Token expiration is checked only on app mount, not periodically. Expired tokens can be used until page refresh.
- **Recommendation:** Add periodic (e.g., every 60 seconds) expiration check.

### MEDIUM: Empty Refresh Token
- **File:** `src/contexts/auth-context.tsx:172, 234`
- **Issue:** Refresh token is set to empty string `""` — no token refresh mechanism is implemented.
- **Recommendation:** Implement proper refresh token rotation with automatic token renewal.

---

## 2. HTTP Client & API Security

### CRITICAL: Missing Security Headers
- **File:** `next.config.ts`
- **Issue:** No security headers are configured. Missing:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
- **Recommendation:** Add `headers()` configuration in `next.config.ts` with all security headers.

### HIGH: Overly Permissive API Rewrite Rules
- **File:** `next.config.ts:41-58`
- **Issue:** 13 rewrite rules proxy broad path patterns (`/auth/:path*`, `/pix/:path*`, etc.) to the backend. The catch-all `/api/:path*` makes the others redundant, increasing attack surface.
- **Recommendation:** Consolidate to minimal required rewrites. Validate API base URL against a domain whitelist.

### MEDIUM: Unvalidated External API Calls
- **Files:** `src/lib/viacep.ts:17,62`, `src/lib/cep.ts:13`, `src/lib/kyc/cep.ts:62`
- **Issue:** Requests to ViaCEP have no timeout, rate limiting, or response validation.
- **Recommendation:** Add `AbortController` timeouts and client-side rate limiting.

### MEDIUM: Error Logging Leaks Sensitive Data
- **File:** `src/lib/http.ts:62-66`
- **Issue:** Network errors log API URLs to console: `console.error('Erro de rede: Sem resposta do servidor', error.config?.url)`
- **Recommendation:** Remove URL logging in production. Log only error codes.

### MEDIUM: `withAnonymous` Function Doesn't Work
- **File:** `src/lib/http.ts:74-79`
- **Issue:** The `anonymous` config option is parsed but stripped without ever setting the `X-Anonymous` header. The exported helper functions (`get`, `post`, etc.) don't support anonymous requests.
- **Recommendation:** Either implement the flag properly or remove the dead code.

---

## 3. Input Validation & XSS Prevention

### MEDIUM: Open Redirect in Login
- **File:** `src/app/(public)/login/LoginPageClient.tsx:32-39`
- **Issue:** `safeNext()` checks `nextParam.startsWith('/')` but doesn't prevent protocol-relative URLs like `//attacker.com`.
- **Recommendation:** Validate against an allowlist of paths (e.g., must start with `/customer/` or `/admin/`).

### MEDIUM: URL Injection via Backend-Controlled Data
- **Files:** `src/components/modals/send-usdt-modal.tsx:109-112`, `src/app/customer/wallet/page.tsx` (getExplorerUrl)
- **Issue:** `window.open()` constructs URLs from API response data (`txId`, `externalAddress`) without validation. Malicious backend responses could inject unexpected URLs.
- **Recommendation:** Validate `txId` format with regex (e.g., `/^[a-zA-Z0-9]{40,70}$/`) and `encodeURIComponent()` values.

### MEDIUM: Minimal Boleto Barcode Validation
- **File:** `src/components/modals/boleto-payment-modal.tsx`
- **Issue:** No format validation against the standard Brazilian boleto barcode pattern (47 digits).
- **Recommendation:** Add regex validation for boleto format.

### LOW: Username Enumeration
- **Files:** `src/components/auth/RegisterForm.tsx:100`, `src/components/modals/username-transfer-modal.tsx:100`
- **Issue:** Username lookup endpoint reveals whether a username exists without rate limiting.
- **Recommendation:** Add server-side rate limiting on username lookup.

### LOW: Error Message Disclosure
- **Files:** Multiple modals (withdraw, send, convert)
- **Issue:** Raw API error messages (`err.response?.data?.message`) are displayed directly via toast.
- **Recommendation:** Map API errors to generic user-facing messages. Log detailed errors server-side.

---

## 4. Sensitive Data Exposure

### CRITICAL: Private Keys Displayed in Browser
- **File:** `src/app/customer/wallet/page.tsx:489-525`
- **Issue:** Crypto wallet private/secret keys are retrieved from the API, stored in React state, and displayed in plaintext `<Input>` fields with a copy button. Keys are accessible via React DevTools, clipboard, screenshots, and XSS.
- **Recommendation:** Never transmit private keys to the frontend. If key export is required, use encrypted PDF download or QR code with a one-time display.

### HIGH: TOTP Secrets Displayed in Plaintext
- **File:** `src/components/auth/TwoFactorSetup.tsx:187-196`
- **Issue:** TOTP secret key displayed as plaintext `<code>` element.
- **Recommendation:** Show QR code by default. Require explicit user action (click to reveal) for manual secret.

### HIGH: Backup Codes as Plaintext File Download
- **File:** `src/components/auth/BackupCodes.tsx:30-49`
- **Issue:** Recovery codes downloadable as unencrypted `.txt` file.
- **Recommendation:** Consider encrypted PDF or require user password to protect the download.

### HIGH: Temporary 2FA Token in React State
- **File:** `src/app/(public)/login/LoginPageClient.tsx:71,105,126`
- **Issue:** Temporary authentication token visible in React DevTools.
- **Recommendation:** Use a ref or in-memory variable instead of state.

### MEDIUM: Console Logging of Sensitive Errors
- **Files:** `src/contexts/auth-context.tsx:186,204,245,263`, 40+ other files
- **Issue:** Error objects logged to console may contain user IDs, emails, API endpoints, and stack traces.
- **Recommendation:** Remove console logging in production or guard with environment check.

### MEDIUM: Profile Photos as Base64 in localStorage
- **Files:** `src/app/customer/settings/page.tsx:77,85`, `src/app/customer/layout.tsx:113`
- **Issue:** Profile images stored as base64 data URLs in localStorage. Consumes limited storage quota and persists on device.
- **Recommendation:** Store only the photo URL/ID. Serve from authenticated endpoint.

### MEDIUM: Password Reset Token in URL Query String
- **File:** `src/app/(public)/reset/page.tsx:48-49`
- **Issue:** Reset token passed as `?token=...` query parameter, visible in browser history, server logs, and referrer headers.
- **Recommendation:** Use POST-based token submission. Implement short (5-15 min) token expiration.

### LOW: Cookie Missing Secure Flag
- **Files:** `src/components/LanguageSwitcher.tsx:27`, `src/app/customer/settings/page.tsx:254`
- **Issue:** `NEXT_LOCALE` cookie set without `Secure` flag.
- **Recommendation:** Always include `Secure` flag for HTTPS.

---

## 5. Dependency Vulnerabilities

### HIGH: `fast-xml-parser` DoS Vulnerability
- **Package:** `fast-xml-parser` v4.3.6–5.3.3 (transitive via `@google-cloud/storage`)
- **CVE:** GHSA-37qj-frw5-hhjh (CVSS 7.5)
- **Issue:** RangeError DoS via numeric entities. Remotely exploitable without authentication.
- **Fix:** Run `npm audit fix` to upgrade `@google-cloud/storage` to 7.19.0 and `fast-xml-parser` to 5.3.4.

### MEDIUM: Unused Blockchain Libraries (Supply Chain Risk)
- **Packages:** `@solana/web3.js`, `@solana/spl-token`, `tronweb`, `bs58`
- **Issue:** These packages are installed but never imported in the frontend. They increase bundle size and attack surface without providing functionality.
- **Recommendation:** Remove unused packages from `package.json`.

### LOW: `legacy-peer-deps=true` in `.npmrc`
- **Issue:** Suppresses peer dependency conflict warnings. Could mask important compatibility issues.
- **Status:** Acceptable for React 19 ecosystem but should be revisited periodically.

---

## 6. Cryptocurrency & Blockchain Security

### CRITICAL: Private Key Display (See Section 4)

### HIGH: No Address Format Validation for USDT Transfers
- **File:** `src/components/modals/send-usdt-modal.tsx:76-107`
- **Issue:** Destination address is only trimmed before submission. No validation of Solana (44 Base58 chars) or Tron (34 chars, starts with 'T') address format. Network mismatch is warned but not enforced.
- **Recommendation:** Implement address format validation and network matching before submission.

### MEDIUM-HIGH: No Transaction Confirmation Screen
- **File:** `src/components/modals/send-usdt-modal.tsx:94-107`
- **Issue:** USDT transfers submitted immediately without a review/confirm step. Other modals like `sell-usdt-modal.tsx` properly use a 3-step flow.
- **Recommendation:** Add a confirmation step showing amount, recipient address, network, and estimated fees.

### MEDIUM: `encryptedPrivateKey` in Client Type Definitions
- **File:** `src/components/modals/send-usdt-modal.tsx:27`
- **Issue:** The `WalletType` includes `encryptedPrivateKey` field. Even if encrypted, this should not be transmitted to the frontend.
- **Recommendation:** Remove from API response and client types.

### MEDIUM: Client-Only Balance Validation
- **File:** `src/components/modals/send-usdt-modal.tsx:88-90`
- **Issue:** Balance check happens only on the client. Backend must re-validate.
- **Recommendation:** Ensure backend enforces balance checks. Add velocity/rate limiting.

### MEDIUM: Watch-Only Wallet Import Without Ownership Proof
- **File:** `src/app/customer/wallet/page.tsx:113-130`
- **Issue:** Users can import any external address without proving ownership (e.g., signed message verification).
- **Recommendation:** Require address ownership proof via message signing.

---

## 7. File Upload Security

### CRITICAL: No Server-Side File Type Validation (KYC Documents)
- **File:** `src/components/modals/kyc-upgrade-modal.tsx:140-147`
- **Issue:** KYC documents validated only by HTML `accept=".pdf,.jpg,.jpeg,.png"` attribute. Backend endpoint does not validate MIME type, magic bytes, or file extension.
- **Recommendation:** Implement server-side MIME type validation with magic byte verification.

### HIGH: No File Size Enforcement
- **File:** `src/components/modals/kyc-upgrade-modal.tsx:212-214`
- **Issue:** UI states "Max 10MB per file" but no enforcement exists on client or server.
- **Recommendation:** Enforce file size limits on both client and server.

### HIGH: No Malware Scanning
- **Issue:** Neither KYC document nor profile photo uploads include antivirus/malware scanning.
- **Recommendation:** Integrate ClamAV or VirusTotal API before storing files.

### HIGH: Profile Photo Upload Missing Server Validation
- **File:** `src/app/customer/settings/page.tsx:207-229`
- **Issue:** `file.type.startsWith("image/")` is client-side only and easily spoofed. SVG files (valid images) can contain embedded JavaScript.
- **Recommendation:** Validate on server. Block SVG uploads. Strip EXIF metadata.

### MEDIUM: Missing Content-Disposition Headers on File Download
- **Issue:** Served files may render inline in the browser (HTML, SVG, JavaScript).
- **Recommendation:** Set `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff` on all file download responses.

---

## 8. Route Protection & Authorization

### CRITICAL: No Server-Side Middleware
- **Location:** Missing `src/middleware.ts`
- **Issue:** All route protection is client-side React components only. No server-side authentication or authorization at the route level.
- **Recommendation:** Implement Next.js middleware to verify JWT and enforce role-based access on the server before rendering.

### CRITICAL: IDOR Vulnerabilities in Admin Routes
- **Files:**
  - `src/app/admin/users/[id]/page.tsx:183`
  - `src/app/admin/kyc/[id]/page.tsx:120`
  - `src/app/admin/clientes/[id]/add-pix/page.tsx:48`
  - `src/app/admin/affiliates/[id]/page.tsx`
  - `src/app/admin/kyc-upgrades/[id]/page.tsx`
- **Issue:** Admin pages use URL `[id]` parameters directly in API calls without verifying the admin's authorization for that specific resource.
- **Recommendation:** Backend must enforce resource-level authorization. Frontend should validate ID format (UUID).

### HIGH: Customer Layout Missing RoleGuard
- **File:** `src/app/customer/layout.tsx:131-195`
- **Issue:** Customer layout wraps children in `<Protected>` but not `<RoleGuard allowedRoles={["CUSTOMER"]}>`. Admin users could access customer routes.
- **Recommendation:** Add `<RoleGuard>` to the customer layout.

### HIGH: Client-Side Auth Race Condition
- **File:** `src/contexts/auth-context.tsx:71-94`
- **Issue:** User state is set immediately from locally decoded JWT. Background API validation (`/auth/me`) runs asynchronously and failures are silently ignored.
- **Recommendation:** Block rendering until server-side validation completes, or use middleware.

### MEDIUM: No ID Format Validation on Dynamic Routes
- **Files:** All admin `[id]` routes
- **Issue:** `params.id` used as-is with type assertion (`as string`) — no UUID format validation.
- **Recommendation:** Validate ID format before making API calls.

---

## 9. Remediation Roadmap

### P0 — Immediate (Before Production)

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 1 | Implement `middleware.ts` for server-side auth | CRITICAL | Medium |
| 2 | Migrate tokens from localStorage to HttpOnly cookies | CRITICAL | High |
| 3 | Add security headers (CSP, HSTS, X-Frame-Options, etc.) | CRITICAL | Low |
| 4 | Remove private key display from wallet page | CRITICAL | Low |
| 5 | Implement CSRF token protection | CRITICAL | Medium |
| 6 | Replace `Math.random()` with `crypto.getRandomValues()` in 2FA | CRITICAL | Low |
| 7 | Add server-side rate limiting on auth endpoints | CRITICAL | Medium |
| 8 | Implement server-side file type/size validation | CRITICAL | Medium |

### P1 — High Priority (Next Sprint)

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 9 | Add crypto address format validation | HIGH | Low |
| 10 | Fix open redirect in login (block `//` prefix) | HIGH | Low |
| 11 | Enforce mandatory 2FA for admin accounts | HIGH | Medium |
| 12 | Add RoleGuard to customer layout | HIGH | Low |
| 13 | Implement server-side session invalidation on logout | HIGH | Medium |
| 14 | Add malware scanning for file uploads | HIGH | Medium |
| 15 | Run `npm audit fix` for `fast-xml-parser` vulnerability | HIGH | Low |
| 16 | Add transaction confirmation step for USDT transfers | HIGH | Low |

### P2 — Medium Priority (Quality Sprint)

| # | Finding | Severity | Effort |
|---|---------|----------|--------|
| 17 | Implement token refresh rotation | MEDIUM | Medium |
| 18 | Add periodic token expiration checks | MEDIUM | Low |
| 19 | Remove unused blockchain dependencies | MEDIUM | Low |
| 20 | Strip EXIF metadata from uploaded images | MEDIUM | Low |
| 21 | Sanitize error messages before displaying to users | MEDIUM | Low |
| 22 | Add address ownership proof for wallet imports | MEDIUM | Medium |
| 23 | Remove console logging in production | MEDIUM | Low |
| 24 | Validate dynamic route parameters (UUID format) | MEDIUM | Low |

---

## 10. Positive Security Practices

The codebase demonstrates several good security practices:

- React's default XSS escaping is properly leveraged (no dangerous patterns)
- Comprehensive Zod schema validation on forms (RegisterForm, login, etc.)
- CPF/CNPJ validation with proper checksum algorithms
- Proper HTTP interceptor for auth token injection and 401 handling
- 30-second request timeout prevents hanging connections
- Input sanitization for monetary values (`replace(/\D/g, "")`)
- Service worker explicitly excludes API paths from caching
- No inline `eval()`, `Function()`, or dynamic code execution
- Blockchain operations are server-side (no client-side transaction signing)
- Relative path redirects in HTTP client (safe from open redirect)
- `encodeURIComponent()` used on user-controlled URL segments

---

## Appendix: Files Requiring Changes

| File | Issues |
|------|--------|
| `next.config.ts` | Security headers, rewrite consolidation |
| `src/lib/token.ts` | Token storage mechanism |
| `src/lib/2fa.ts` | Backup code RNG |
| `src/lib/http.ts` | CSRF tokens, error logging, withAnonymous fix |
| `src/contexts/auth-context.tsx` | JWT validation, logout, refresh, periodic check |
| `src/components/auth/RegisterForm.tsx` | Cookie handling |
| `src/app/(public)/login/LoginPageClient.tsx` | Open redirect fix |
| `src/app/(public)/admin-login/page.tsx` | Enforce 2FA |
| `src/app/customer/layout.tsx` | Add RoleGuard |
| `src/app/customer/wallet/page.tsx` | Remove private key display |
| `src/components/modals/send-usdt-modal.tsx` | Address validation, confirmation step |
| `src/components/modals/kyc-upgrade-modal.tsx` | File size validation |
| `src/app/customer/settings/page.tsx` | Photo upload validation |
| `src/middleware.ts` (new) | Server-side route protection |

---

*This report covers the frontend codebase only. Backend API security (rate limiting enforcement, authorization checks, data validation, session management) must be audited separately.*
