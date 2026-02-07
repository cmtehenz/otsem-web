"use client";

import { useAuth } from "@/contexts/auth-context";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useState } from "react";
import { Shield, KeyRound, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSecurityPage() {
    const { user } = useAuth();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6F00FF]/10">
                    <Shield className="h-5 w-5 text-[#6F00FF]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Segurança</h1>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        Gerencie as configurações de segurança da sua conta
                    </p>
                </div>
            </div>

            <TwoFactorSetup
                user={{
                    id: user.id,
                    email: user.email,
                    twoFactorEnabled,
                }}
                onSuccess={() => setTwoFactorEnabled((v) => !v)}
            />

            <Card className="rounded-2xl border-border/60">
                <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Dicas de segurança</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                                <Smartphone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Use um app autenticador</p>
                                <p className="text-xs text-muted-foreground">
                                    Google Authenticator, Authy ou 1Password são recomendados
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                <KeyRound className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Guarde seus códigos de backup</p>
                                <p className="text-xs text-muted-foreground">
                                    Salve os códigos de backup em local seguro para não perder acesso
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
