// Client HTTP baseado em fetch, com:
// - Base URL de env
// - Bearer automático
// - Auto-refresh 401 (fila única) e retry 1x
import { tokenStore } from "./token";

const BASE_URL =
    (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) || "";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOpts = {
    headers?: Record<string, string>;
    // body pode ser objeto (serializa como JSON) ou FormData/Blob/etc
    body?: unknown;
    // se true, não manda Authorization
    anonymous?: boolean;
    // se true, NÃO tenta refresh em 401 (para /auth/refresh, p.ex.)
    noRefresh?: boolean;
    // usa URL absoluta (ignora BASE_URL)
    absolute?: boolean;
    // credenciais (se sua API Nest usar cookies — aqui você disse que não)
    credentials?: RequestCredentials;
    signal?: AbortSignal;
};

type ErrorPayload = { message?: string | string[]; error?: string; statusCode?: number };

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return null;

    refreshInFlight = (async () => {
        try {
            const res = await fetch(joinUrl("/auth/refresh"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) throw new Error(`refresh failed: ${res.status}`);

            const data = (await res.json()) as { accessToken: string; refreshToken?: string };
            tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken });
            return data.accessToken;
        } catch {
            tokenStore.clear();
            return null;
        } finally {
            refreshInFlight = null;
        }
    })();

    return refreshInFlight;
}

function joinUrl(path: string, absolute?: boolean) {
    if (absolute || /^https?:\/\//i.test(path)) {
        return path;
    }
    return `${BASE_URL}${path}`;
}

async function request<T>(
    method: HttpMethod,
    path: string,
    opts: RequestOpts = {},
    _retry = false,
): Promise<T> {
    const headers: Record<string, string> = { ...(opts.headers || {}) };
    const hasBody = opts.body !== undefined && opts.body !== null;

    // content-type automático para objetos (não para FormData/Blob)
    const isJsonBody = hasBody && typeof opts.body === "object" && !(opts.body instanceof FormData);
    if (isJsonBody && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

    // Authorization
    if (!opts.anonymous) {
        const token = tokenStore.getAccess();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(joinUrl(path, opts.absolute), {
        method,
        headers,
        body: isJsonBody ? JSON.stringify(opts.body) : (opts.body as BodyInit | undefined),
        credentials: opts.credentials,
        signal: opts.signal,
    });

    if (res.status === 204) return undefined as unknown as T;

    if (res.ok) {
        // tenta ler JSON, se não for JSON retorna texto
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) return (await res.json()) as T;
        const text = await res.text();
        return text as unknown as T;
    }

    // 401 -> tenta refresh (exceto em endpoints sem refresh)
    if (res.status === 401 && !opts.noRefresh && !opts.anonymous && !_retry) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            // retry 1x com novo token
            return request<T>(method, path, opts, true);
        }
    }

    // Tenta extrair mensagem de erro da API Nest
    let message = `HTTP ${res.status}`;
    try {
        const payload = (await res.json()) as ErrorPayload;
        const msg = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || payload.error;
        if (msg) message = msg;
    } catch {
        /* ignore body parse */
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
}

export const http = {
    get: <T>(path: string, opts?: RequestOpts) => request<T>("GET", path, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOpts) =>
        request<T>("POST", path, { ...(opts || {}), body }),
    put: <T>(path: string, body?: unknown, opts?: RequestOpts) =>
        request<T>("PUT", path, { ...(opts || {}), body }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOpts) =>
        request<T>("PATCH", path, { ...(opts || {}), body }),
    delete: <T>(path: string, opts?: RequestOpts) => request<T>("DELETE", path, opts),
};
