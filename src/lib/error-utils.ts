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