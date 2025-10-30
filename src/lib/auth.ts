import { http } from "@/lib/http";

// Tipos esperados da sua API NestJS
export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    role?: string;
}

// Token store opcional — se não existir, usa localStorage
interface TokenStore {
    set(tokens: { accessToken: string; refreshToken?: string | null }): void;
}

const tokenStore: TokenStore =
    (globalThis as Record<string, unknown>).tokenStore as TokenStore ??
    {
        set({ accessToken, refreshToken }) {
            if (typeof window === "undefined") return;
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        },
    };

// ------------------------------------------------------------
// Login: faz POST /auth/login e salva tokens
// ------------------------------------------------------------
export async function authLogin(
    email: string,
    password: string
): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>(
        "/auth/login",
        { email, password },
        { anonymous: true }
    );

    // Persiste tokens localmente
    tokenStore.set({
        accessToken: res.access_token,
        refreshToken: res.refresh_token ?? null,
    });

    return res;
}

// ------------------------------------------------------------
// Extração de mensagens de erro — SEM any
// ------------------------------------------------------------

type HttpLikeError = {
    status?: number;
    message?: string | string[];
    error?: string;
    response?: {
        status?: number;
        data?: {
            message?: string | string[];
            error?: string;
        };
    };
};

/**
 * Converte um erro desconhecido (Axios/fetch/custom) em string amigável.
 */
export function toErrorMessage(
    e: unknown,
    fallback = "Ocorreu um erro"
): string {
    if (e && typeof e === "object") {
        const err = e as HttpLikeError;

        const status = err.status ?? err.response?.status;

        const message =
            (Array.isArray(err.message)
                ? err.message.join(", ")
                : err.message) ??
            (Array.isArray(err.response?.data?.message)
                ? err.response?.data?.message.join(", ")
                : err.response?.data?.message) ??
            err.error ??
            err.response?.data?.error;

        if (status === 401) return "Credenciais inválidas.";
        if (status === 429) return "Muitas tentativas. Tente novamente em instantes.";
        if (typeof message === "string" && message.trim()) return message;
    }

    return fallback;
}
