import http from "./http";
import type { AxiosResponse } from "axios";

/**
 * Client-side cache for the active bank provider.
 * Fetched once from /api/bank-provider (the Next.js server-side cache that
 * the admin settings page keeps in sync).  Defaults to "inter".
 */
let _cachedBank: string | null = null;

async function resolveBank(): Promise<string> {
  if (_cachedBank) return _cachedBank;
  try {
    const res = await fetch("/api/bank-provider");
    if (res.ok) {
      const data = await res.json();
      _cachedBank = (data.provider || "inter").toLowerCase();
    }
  } catch {
    // fall through
  }
  return _cachedBank || "inter";
}

/** Call this when the admin changes the active bank (clears client cache). */
export function invalidateBankCache(): void {
  _cachedBank = null;
}

/**
 * Make a POST request to a bank-specific PIX endpoint.
 *
 * Resolves the active bank provider and calls /{bank}/pix/{path} using the
 * standard httpClient (which already attaches the JWT via its interceptor).
 *
 * Example: pixPost("cobrancas", data)  →  POST /inter/pix/cobrancas
 */
export async function pixPost<T = unknown>(
  path: string,
  data?: unknown,
): Promise<AxiosResponse<T>> {
  const bank = await resolveBank();
  return http.post<T>(`/${bank}/pix/${path}`, data);
}
