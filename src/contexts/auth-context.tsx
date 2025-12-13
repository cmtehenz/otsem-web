"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import httpClient from "@/lib/http";
import { setTokens, clearTokens, getAccessToken } from "@/lib/token";

interface User {
    id: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    name?: string;
    spreadValue?: number;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Helper para decodificar JWT sem dependências externas
function decodeJwt(token: string): { sub: string; email: string; role: "ADMIN" | "CUSTOMER"; exp: number } | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Carrega o usuário ao montar o componente (apenas do JWT, sem chamar API)
    useEffect(() => {
        function loadUser() {
            try {
                const token = getAccessToken();

                if (!token) {
                    setLoading(false);
                    return;
                }

                const payload = decodeJwt(token);

                if (!payload) {
                    clearTokens();
                    setLoading(false);
                    return;
                }

                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    clearTokens();
                    setLoading(false);
                    return;
                }

                setUser({
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                });
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
                clearTokens();
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    async function login(email: string, password: string) {
        try {
            const loginResponse = await httpClient.post<LoginResponse>(
                "/auth/login",
                { email, password },
                { headers: { "X-Anonymous": "true" } }
            );

            const { accessToken, user: userData } = loginResponse.data.data;
            const role = userData.role;

            if (!accessToken) {
                throw new Error("Token de acesso não recebido da API");
            }

            const payload = decodeJwt(accessToken);
            if (!payload) {
                throw new Error("Token inválido");
            }

            setTokens(accessToken, "");

            const newUser = {
                id: payload.sub,
                email: payload.email || userData.email,
                role: role,
                name: userData.name || undefined,
            };

            setUser(newUser);

            const dashboardPath = role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";

            if (typeof window !== 'undefined') {
                window.location.href = dashboardPath;
            }
        } catch (error) {
            console.error("Erro no login:", error);
            clearTokens();

            if (error instanceof Error) {
                throw error;
            }

            throw new Error("Erro ao fazer login");
        }
    }

    function logout() {
        clearTokens();
        setUser(null);
        router.push("/login");
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
