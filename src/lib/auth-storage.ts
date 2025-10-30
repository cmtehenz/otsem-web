// src/lib/auth-storage.ts
export type AuthTokens = { accessToken: string; refreshToken?: string; role?: string };

const KEY = 'auth_tokens';

export function saveAuthTokens(tokens: AuthTokens) {
    localStorage.setItem(KEY, JSON.stringify(tokens));
}
export function getAuthTokens(): AuthTokens | null {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch { return null; }
}
export function clearAuthTokens() {
    localStorage.removeItem(KEY);
}

// compat (se algum lugar ainda usa)
export function getToken() { return getAuthTokens()?.accessToken || null; }
export function getRole() { return getAuthTokens()?.role || null; }
