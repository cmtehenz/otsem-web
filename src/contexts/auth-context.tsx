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
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface LoginResponse {
    access_token: string;
    role: "ADMIN" | "CUSTOMER";
}

interface CustomerMeResponse {
    id: string;
    email: string;
    name?: string;
    type?: string;
    accountStatus?: string;
}

interface AdminMeResponse {
    email: string;
    name?: string;
    role?: string;
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

    // Carrega o usuário ao montar o componente
    useEffect(() => {
        async function loadUser() {
            try {
                const token = getAccessToken();

                if (!token) {
                    setLoading(false);
                    return;
                }

                // Decodifica o token JWT para pegar o role e id
                const payload = decodeJwt(token);

                if (!payload) {
                    console.warn("Token inválido ou malformado");
                    clearTokens();
                    setLoading(false);
                    return;
                }

                // Verifica se o token expirou
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    console.warn("Token expirado");
                    clearTokens();
                    setLoading(false);
                    return;
                }

                const role = payload.role;
                const userId = payload.sub; // ID sempre vem do JWT

                // Endpoint varia conforme o role
                const endpoint = role === "ADMIN" ? "/auth/me" : "/customers/me";

                // Tenta buscar dados do usuário
                const response = await httpClient.get<CustomerMeResponse | AdminMeResponse>(endpoint);
                const userData = response.data;

                // Para CUSTOMER, precisa do id na resposta
                if (role === "CUSTOMER" && !("id" in userData)) {
                    console.error("❌ Customer sem campo id:", userData);
                    clearTokens();
                    setLoading(false);
                    return;
                }

                setUser({
                    id: role === "ADMIN" ? userId : (userData as CustomerMeResponse).id,
                    email: userData.email,
                    role: role,
                    name: userData.name || undefined,
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
            // 1. Faz login e recebe o token
            const loginResponse = await httpClient.post<LoginResponse>(
                "/auth/login",
                { email, password },
                { headers: { "X-Anonymous": "true" } }
            );

            const { access_token, role } = loginResponse.data;

            console.warn("🔐 Role recebido do backend:", role);

            // Valida se recebeu o token
            if (!access_token) {
                throw new Error("Token de acesso não recebido da API");
            }

            // Decodifica o token para pegar o id do usuário (sub)
            const payload = decodeJwt(access_token);
            if (!payload) {
                throw new Error("Token inválido");
            }

            const userId = payload.sub;

            // Salva os tokens
            setTokens(access_token, "");

            // 2. Endpoint varia conforme o role
            const endpoint = role === "ADMIN" ? "/auth/me" : "/customers/me";

            // Busca os dados do usuário usando o token
            const userResponse = await httpClient.get<CustomerMeResponse | AdminMeResponse>(endpoint);
            const userData = userResponse.data;

            // Valida se recebeu os dados do usuário
            if (!userData) {
                throw new Error("Dados do usuário não recebidos da API");
            }

            // Para CUSTOMER, valida se tem id
            if (role === "CUSTOMER" && !("id" in userData)) {
                throw new Error("Dados do usuário não recebidos da API (campo id ausente)");
            }

            // Define o usuário (importante fazer isso ANTES do redirect)
            const newUser = {
                id: role === "ADMIN" ? userId : (userData as CustomerMeResponse).id,
                email: userData.email,
                role: role,
                name: userData.name || undefined,
            };

            console.warn("👤 Usuário definido:", newUser);

            setUser(newUser);

            // Redireciona baseado no role
            const dashboardPath = role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";

            console.warn("🚀 Redirecionando para:", dashboardPath, "baseado no role:", role);

            // NÃO use router.push aqui - deixe o page.tsx fazer o redirect
            // O problema pode estar em múltiplos redirects acontecendo

            // Em vez disso, vamos usar window.location para forçar navegação
            if (typeof window !== 'undefined') {
                window.location.href = dashboardPath;
            }
        } catch (error) {
            console.error("Erro no login:", error);

            // Limpa tokens em caso de erro
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
