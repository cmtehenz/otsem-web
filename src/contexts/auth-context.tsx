// src/contexts/auth-context.tsx
"use client";

import * as React from "react";
import { http } from "@/lib/http";
import { readAccessToken, clearAccessToken } from "@/lib/auth-token";
import { toast } from "sonner";

export type UserRole = "ADMIN" | "CUSTOMER" | "STAFF" | string;

export interface Me {
    id: string;
    email: string;
    name?: string;
    role?: UserRole;
}

type AuthState =
    | { status: "idle"; user: null; token: null }
    | { status: "loading"; user: null; token: string | null }
    | { status: "authenticated"; user: Me; token: string }
    | { status: "unauthenticated"; user: null; token: null };

interface AuthContextValue {
    state: AuthState;
    isLoading: boolean;
    user: Me | null;
    token: string | null;
    login: (accessToken: string) => Promise<void>;
    logout: () => void;
    refreshMe: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = React.useState<AuthState>({ status: "idle", user: null, token: null });

    const fetchMe = React.useCallback(async (token: string): Promise<Me> => {
        // ❗️sem bearer; usa headers padrão
        return http.get<Me>("/auth/me", {
            anonymous: true,
            headers: { Authorization: `Bearer ${token}` },
        });
    }, []);

    const bootstrap = React.useCallback(async () => {
        const token = readAccessToken();
        if (!token) {
            setState({ status: "unauthenticated", user: null, token: null });
            return;
        }
        setState({ status: "loading", user: null, token });
        try {
            const me = await fetchMe(token);
            setState({ status: "authenticated", user: me, token });
        } catch {
            clearAccessToken();
            setState({ status: "unauthenticated", user: null, token: null });
        }
    }, [fetchMe]);

    React.useEffect(() => {
        void bootstrap();
    }, [bootstrap]);

    async function login(accessToken: string) {
        localStorage.setItem("accessToken", accessToken);
        setState({ status: "loading", user: null, token: accessToken });
        try {
            const me = await fetchMe(accessToken);
            setState({ status: "authenticated", user: me, token: accessToken });
        } catch {
            clearAccessToken();
            setState({ status: "unauthenticated", user: null, token: null });
            toast.error("Sessão inválida.");
        }
    }

    function logout() {
        clearAccessToken();
        setState({ status: "unauthenticated", user: null, token: null });
    }

    async function refreshMe() {
        const token = readAccessToken();
        if (!token) {
            setState({ status: "unauthenticated", user: null, token: null });
            return;
        }
        setState({ status: "loading", user: null, token });
        try {
            const me = await fetchMe(token);
            setState({ status: "authenticated", user: me, token });
        } catch {
            clearAccessToken();
            setState({ status: "unauthenticated", user: null, token: null });
        }
    }

    const value: AuthContextValue = {
        state,
        isLoading: state.status === "idle" || state.status === "loading",
        user: state.status === "authenticated" ? state.user : null,
        token: state.token ?? null,
        login,
        logout,
        refreshMe,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
