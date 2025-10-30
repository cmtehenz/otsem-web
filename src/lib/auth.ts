// src/lib/auth.ts
import { http } from "@/lib/http";

// Se você já tem um tokenStore (src/lib/token.ts), use-o.
// Caso NÃO tenha, este fallback usa localStorage direto:
const tokenStore =
    (globalThis as any).tokenStore ||
    {
        set({ accessToken, refreshToken }: { accessToken: string; refreshToken?: string | null }) {
            if (typeof window === "undefined") return;
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        },
    };

// Tipos esperados da sua API Nest
export type LoginResponse = {
    access_token: string;
    refresh_token?: string;
    role?: string;
};

export async function authLogin(email: string, password: string): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>(
        "/auth/login",
        { email, password },
        { anonymous: true }
    );
    // persiste tokens para o client http usar depois
    tokenStore.set({ accessToken: res.access_token, refreshToken: res.refresh_token ?? null });
    return res;
}

export function toErrorMessage(e: unknown, fallback = "Ocorreu um erro"): string {
    if (e && typeof e === "object") {
        const anyE = e as any;
        const status = anyE.status ?? anyE.response?.status;
        const msg =
            Array.isArray(anyE?.message) ? anyE.message.join(", ") :
                anyE?.message ?? anyE?.response?.data?.message ?? anyE?.error;

        if (status === 401) return "Credenciais inválidas.";
        if (status === 429) return "Muitas tentativas. Tente novamente em instantes.";
        if (typeof msg === "string" && msg.trim()) return msg;
    }
    return fallback;
}
