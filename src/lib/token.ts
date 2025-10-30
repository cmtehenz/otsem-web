// Armazena tokens no browser (sem cookies), como você já usa.
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export type Tokens = { accessToken: string; refreshToken?: string | null };

export const tokenStore = {
    getAccess(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_KEY);
    },
    getRefresh(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_KEY);
    },
    set(tokens: Tokens) {
        if (typeof window === "undefined") return;
        if (tokens.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        if (typeof tokens.refreshToken !== "undefined") {
            if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
            else localStorage.removeItem(REFRESH_KEY);
        }
    },
    clear() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};
