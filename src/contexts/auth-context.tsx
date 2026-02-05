"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import httpClient from "@/lib/http";
import { setTokens, clearTokens, getAccessToken } from "@/lib/token";
import { toErrorMessage } from "@/lib/error-utils";

interface User {
    id: string;
    customerId?: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    name?: string;
    spreadValue?: number;
    twoFactorEnabled?: boolean;
    twoFactorMethod?: 'TOTP' | null;
}

interface TwoFactorRequired {
    requiresTwoFactor: true;
    tempToken: string;
    user: User;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User | TwoFactorRequired>;
    verifyTwoFactor: (code: string, tempToken: string, isBackupCode?: boolean) => Promise<User>;
    logout: () => void;
}

interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        user: User;
    };
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

    // Hydrate user on mount — uses JWT decode as fast path so the UI can
    // render immediately, then validates with the API in the background.
    useEffect(() => {
        const token = getAccessToken();

        if (!token) {
            setLoading(false);
            return;
        }

        // 1. Fast path: decode JWT locally for instant hydration
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

        // Set user immediately from JWT payload — unblocks rendering
        const jwtUser: User = {
            id: payload.sub,
            customerId: payload.customerId,
            email: payload.email,
            role: payload.role,
        };
        setUser(jwtUser);
        setLoading(false);

        // 2. Background validation: fetch fresh data from API without blocking UI
        (async () => {
            try {
                const authMeResponse = await httpClient.get("/auth/me");
                const userData = authMeResponse.data;

                let customerId = userData.customerId;

                if (userData.role === "CUSTOMER" && !customerId) {
                    try {
                        const customerResponse = await httpClient.get("/customers/me");
                        if (customerResponse.data?.id) {
                            customerId = customerResponse.data.id;
                        }
                    } catch {
                        // Not critical — keep JWT-derived customerId
                    }
                }

                setUser({
                    id: userData.id,
                    customerId: customerId || payload.customerId,
                    email: userData.email,
                    role: userData.role,
                    name: userData.name,
                });
            } catch {
                // API unreachable — JWT-decoded user is still valid
            }
        })();
    }, []);

    async function login(email: string, password: string): Promise<User | TwoFactorRequired> {
        try {
            const loginResponse = await httpClient.post<LoginResponse>(
                "/auth/login",
                { email, password },
                { headers: { "X-Anonymous": "true" } }
            );

            const { accessToken, user: userData } = loginResponse.data.data;

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

            // Check if 2FA is required
            if (userData.twoFactorEnabled) {
                const tempUser: User = {
                    id: payload.sub,
                    customerId: payload.customerId || userData?.customerId,
                    email: payload.email || userData.email,
                    role: role,
                    name: userData.name || undefined,
                    spreadValue: userData.spreadValue,
                    twoFactorEnabled: true,
                    twoFactorMethod: userData.twoFactorMethod || 'TOTP',
                };

                return {
                    requiresTwoFactor: true,
                    tempToken: accessToken,
                    user: tempUser,
                };
            }

            setTokens(accessToken, "");

            let customerId = payload.customerId || userData?.customerId;

            // Se for CUSTOMER e não tiver customerId, busca na API
            if (role === "CUSTOMER" && !customerId) {
                try {
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

            const newUser: User = {
                id: payload.sub,
                customerId: customerId,
                email: payload.email || userData.email,
                role: role,
                name: userData.name || undefined,
                spreadValue: userData.spreadValue,
                twoFactorEnabled: userData.twoFactorEnabled,
                twoFactorMethod: userData.twoFactorMethod,
            };

            setUser(newUser);
            return newUser;
        } catch (error) {
            console.error("Erro no login:", error);
            clearTokens();
            throw new Error(toErrorMessage(error, "Erro ao fazer login"));
        }
    }

    async function verifyTwoFactor(code: string, tempToken: string, isBackupCode: boolean = false): Promise<User> {
        try {
            const response = await httpClient.post<LoginResponse>(
                "/auth/2fa/verify-login",
                { code, isBackupCode },
                { headers: { Authorization: `Bearer ${tempToken}` } }
            );

            const { accessToken, user: userData } = response.data.data;

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

            if (role === "CUSTOMER" && !customerId) {
                try {
                    const customerResponse = await httpClient.get("/customers/me");
                    if (customerResponse.data && customerResponse.data.id) {
                        customerId = customerResponse.data.id;
                    }
                } catch (error) {
                    console.warn("Não foi possível buscar dados do customer:", error);
                }
            }

            const newUser: User = {
                id: payload.sub,
                customerId: customerId,
                email: payload.email || userData.email,
                role: role,
                name: userData.name || undefined,
                spreadValue: userData.spreadValue,
                twoFactorEnabled: userData.twoFactorEnabled,
                twoFactorMethod: userData.twoFactorMethod,
            };

            setUser(newUser);
            return newUser;
        } catch (error) {
            console.error("Erro na verificação 2FA:", error);
            throw error;
        }
    }

    function logout() {
        clearTokens();
        setUser(null);
        router.push("/login");
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, verifyTwoFactor, logout }}>
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
