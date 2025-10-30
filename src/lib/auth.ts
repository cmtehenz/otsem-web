// src/lib/auth.ts
import { http } from "@/lib/http";
import { tokenStore } from "@/lib/token";

export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    role?: string;
}

export async function authLogin(email: string, password: string): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>("/auth/login", { email, password }, { anonymous: true });
    tokenStore.set({ accessToken: res.access_token, refreshToken: res.refresh_token ?? null });
    return res;
}

// ------ erros http -> string amigável (sem any)
type HttpLikeError = {
    status?: number;
    message?: string | string[];
    error?: string;
    response?: { status?: number; data?: { message?: string | string[]; error?: string } };
};

export function toErrorMessage(e: unknown, fallback = "Ocorreu um erro"): string {
    if (e && typeof e === "object") {
        const err = e as HttpLikeError;
        const status = err.status ?? err.response?.status;

        const msg =
            (Array.isArray(err.message) ? err.message.join(", ") : err.message) ??
            (Array.isArray(err.response?.data?.message)
                ? err.response?.data?.message.join(", ")
                : err.response?.data?.message) ??
            err.error ??
            err.response?.data?.error;

        if (status === 401) return "Credenciais inválidas.";
        if (status === 429) return "Muitas tentativas. Tente novamente em instantes.";
        if (typeof msg === "string" && msg.trim()) return msg;
    }
    return fallback;
}
