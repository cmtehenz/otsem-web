 
import axios, {
    AxiosHeaders,
    type AxiosInstance,
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

/** Runtime-safe tokens */
export type AuthTokens = {
    accessToken: string;
    refreshToken?: string;
};

/** Resposta de erro padrão da sua API */
export type ApiErrorPayload = {
    message?: string;
    code?: string | number;
    [k: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isAuthTokens(value: unknown): value is AuthTokens {
    return (
        isRecord(value) &&
        typeof value.accessToken === "string" &&
        (value.refreshToken === undefined || typeof value.refreshToken === "string")
    );
}

function safeParseJSON<T>(raw: string | null): T | null {
    if (!raw) {return null;}
    try {
        const parsed: unknown = JSON.parse(raw);
        return parsed as T;
    } catch {
        return null;
    }
}

function getTokens(): AuthTokens | null {
    try {
        if (typeof window === "undefined") {return null;}
        const tokens = safeParseJSON<AuthTokens>(localStorage.getItem("auth_tokens"));
        return isAuthTokens(tokens) ? tokens : null;
    } catch {
        return null;
    }
}

/** Base URL com fallback seguro */
const BASE_URL: string =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : "/api";


/** Instância tipada do Axios */
export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    // timeout opcional:
    // timeout: 15000,
});

/** Request: injeta Authorization se existir token */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tokens = getTokens();
    if (tokens?.accessToken) {
        // garante que headers existe e é AxiosHeaders
        if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
            config.headers = new AxiosHeaders(config.headers);
        }
        (config.headers as AxiosHeaders).set(
            "Authorization",
            `Bearer ${tokens.accessToken}`
        );
    }
    return config;
});


/** Utilitário para extrair mensagem de erro de forma segura */
export function extractApiError(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const axErr = err as AxiosError<ApiErrorPayload>;
        const payload = axErr.response?.data;
        if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
            return payload.message;
        }
        // Mensagem do Axios
        if (typeof axErr.message === "string" && axErr.message) {
            return axErr.message;
        }
        return "Request failed";
    }
    if (err instanceof Error) {return err.message;}
    return "Unexpected error";
}

/** (Opcional) Interceptor de resposta apenas para normalizar erros */
api.interceptors.response.use(
    (res) => res,
    (err: unknown) => {
        // Não acessar .response/.config sem type guard
        if (axios.isAxiosError(err)) {
            // Aqui você poderia lidar com 401/refresh token, se quiser
            // const status = err.response?.status;
            // if (status === 401) { ... }
        }
        // Rejeita preservando tipo unknown para camadas acima decidirem
        return Promise.reject(err);
    }
);

export default api;
