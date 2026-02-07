"use client";

import { useAuth } from "@/contexts/auth-context";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useState } from "react";

export default function AdminSecurityPage() {
    const { user } = useAuth();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

    if (!user) return null;

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Segurança</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gerencie as configurações de segurança da sua conta
                </p>
            </div>

            <TwoFactorSetup
                user={{
                    id: user.id,
                    email: user.email,
                    twoFactorEnabled,
                }}
                onSuccess={() => setTwoFactorEnabled((v) => !v)}
            />
        </div>
    );
}
