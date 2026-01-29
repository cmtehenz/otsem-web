"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import httpClient from "@/lib/http";
import { setTokens, clearTokens, getAccessToken } from "@/lib/token";

interface User {
    id: string;
    customerId?: string;
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
    access_token: string;
    user: User;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Helper para decodificar JWT sem dependências externas
function decodeJwt(token: string): { sub: string; email: string; role: "ADMIN" | "CUSTOMER"; customerId?: string; exp: number } | null {
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

                // Tenta buscar o usuário atual via API conforme spec (/auth/me)
                try {
                    const authMeResponse = await httpClient.get("/auth/me");
                    const userData = authMeResponse.data;
                    
                    let customerId = userData.customerId;

                    // Se for CUSTOMER e não tiver customerId, tenta buscar na API de customers
                    if (userData.role === "CUSTOMER" && !customerId) {
                        try {
                            const customerResponse = await httpClient.get("/customers/me");
                            if (customerResponse.data && customerResponse.data.id) {
                                customerId = customerResponse.data.id;
                            }
                        } catch (error) {
                            console.warn("Não foi possível buscar dados do customer:", error);
                        }
                    }

                    setUser({
                        id: userData.id,
                        customerId: customerId,
                        email: userData.email,
                        role: userData.role,
                        name: userData.name,
                    });
                } catch (apiError) {
                    // Fallback para decode local se a API falhar
                    console.warn("API /auth/me falhou, usando decode local:", apiError);
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

                    let customerId = payload.customerId;

                    if (payload.role === "CUSTOMER" && !customerId) {
                        try {
                            const response = await httpClient.get("/customers/me");
                            if (response.data && response.data.id) {
                                customerId = response.data.id;
                            }
                        } catch (error) {
                            console.warn("Não foi possível buscar dados do customer no fallback:", error);
                        }
                    }

                    setUser({
                        id: payload.sub,
                        customerId: customerId,
                        email: payload.email,
                        role: payload.role,
                    });
                }
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

            const { access_token: accessToken, user: userData } = loginResponse.data;

            if (!accessToken) {
                throw new Error("Token de acesso não recebido da API");
            }

            const payload = decodeJwt(accessToken);
            if (!payload) {
                throw new Error("Token inválido");
            }

            const role = payload.role || userData?.role;
            if (!role) {
                throw new Error("Cargo do usuário não identificado");
            }

            setTokens(accessToken, "");

            let customerId = payload.customerId || userData?.customerId;

            // Se for CUSTOMER e não tiver customerId, busca na API
            if (role === "CUSTOMER" && !customerId) {
                try {
                    // Espera um pouco para garantir que o interceptor de token funcione ou passa o token manualmente
                    const response = await httpClient.get("/customers/me", {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    if (response.data && response.data.id) {
                        customerId = response.data.id;
                    }
                } catch (error) {
                    console.warn("Não foi possível buscar dados do customer no login:", error);
                }
            }

            const newUser = {
                id: payload.sub,
                customerId: customerId,
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
            
            // Se for erro de rede já tratado pelo interceptor, propaga a mensagem
            if (error && typeof error === "object" && "message" in (error as any)) {
                const msg = (error as any).message;
                if (typeof msg === "string" && msg.includes("conectar ao servidor")) {
                    throw new Error(msg);
                }
            }

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
