// src/lib/auth-token.ts
export function readAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    // 1) localStorage (nosso fluxo atual)
    const ls = localStorage.getItem("accessToken");
    if (ls && ls.trim()) return ls;

    // 2) cookie "access_token" (opcional)
    const m = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);

    return null;
}

export function clearAccessToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    // apaga cookie também
    document.cookie = [
        "access_token=",
        "Path=/",
        "Max-Age=0",
        "SameSite=Lax",
    ].join("; ");
}
