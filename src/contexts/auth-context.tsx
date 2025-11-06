"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { http } from "@/lib/http";
import { tokenStore } from "@/lib/token";
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
    login: (accessToken: string, role?: UserRole) => Promise<void>;
    logout: () => void;
    refreshMe: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// limpa cookie de access token ao sair
function clearCookieAccessToken() {
    try {
        document.cookie = "access_token=; Path=/; Max-Age=0; SameSite=Lax";
    } catch {
        /* ignore */
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [state, setState] = React.useState<AuthState>({
        status: "idle",
        user: null,
        token: null,
    });

    const fetchMe = React.useCallback(async (token: string): Promise<Me> => {
        return http.get<Me>("/auth/me", {
            anonymous: true,
            headers: { Authorization: `Bearer ${token}` },
        });
    }, []);

    // ⚙️ Bootstrap: valida token e obtém o usuário, mas NÃO redireciona
    const bootstrap = React.useCallback(async () => {
        const token = tokenStore.getAccess();
        if (!token) {
            setState({ status: "unauthenticated", user: null, token: null });
            return;
        }

        setState({ status: "loading", user: null, token });

        try {
            const me = await fetchMe(token);
            setState({ status: "authenticated", user: me, token });
        } catch {
            tokenStore.clear();
            clearCookieAccessToken();
            setState({ status: "unauthenticated", user: null, token: null });
        }
    }, [fetchMe]);

    React.useEffect(() => {
        void bootstrap();
    }, [bootstrap]);

    // 🚀 Login: aqui sim redireciona conforme o tipo de usuário
    async function login(accessToken: string, role?: UserRole) {
        tokenStore.set({ accessToken, refreshToken: null });
        setState({ status: "loading", user: null, token: accessToken });

        try {
            const me = await fetchMe(accessToken);
            setState({ status: "authenticated", user: me, token: accessToken });

            const finalRole = role ?? me.role;
            if (finalRole === "ADMIN") router.push("/admin/dashboard");
            else router.push("/customer/dashboard");
        } catch {
            tokenStore.clear();
            clearCookieAccessToken();
            setState({ status: "unauthenticated", user: null, token: null });
            toast.error("Sessão inválida.");
        }
    }

    function logout() {
        tokenStore.clear();
        clearCookieAccessToken();
        setState({ status: "unauthenticated", user: null, token: null });
        router.push("/login");
    }

    async function refreshMe() {
        const token = tokenStore.getAccess();
        if (!token) {
            setState({ status: "unauthenticated", user: null, token: null });
            return;
        }

        setState({ status: "loading", user: null, token });
        try {
            const me = await fetchMe(token);
            setState({ status: "authenticated", user: me, token });
        } catch {
            tokenStore.clear();
            clearCookieAccessToken();
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
