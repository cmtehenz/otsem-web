// src/lib/token.ts
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export type Tokens = { accessToken: string; refreshToken?: string | null };

function hasWindow(): boolean {
    return typeof window !== "undefined";
}

export const tokenStore = {
    getAccess(): string | null {
        if (!hasWindow()) {
            return null;
        }
        return localStorage.getItem(ACCESS_KEY);
    },

    getRefresh(): string | null {
        if (!hasWindow()) {
            return null;
        }
        return localStorage.getItem(REFRESH_KEY);
    },

    set(tokens: Tokens): void {
        if (!hasWindow()) {
            return;
        }

        if (tokens.accessToken) {
            localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        }

        if (typeof tokens.refreshToken !== "undefined") {
            if (tokens.refreshToken) {
                localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
            } else {
                localStorage.removeItem(REFRESH_KEY);
            }
        }
    },

    clear(): void {
        if (!hasWindow()) {
            return;
        }
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};
