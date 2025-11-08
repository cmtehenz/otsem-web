// src/components/auth/RoleGuard.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SpinnerCustom } from "@/components/ui/spinner"; // use o seu SpinnerCustom

type Props = { roles: string[]; children: React.ReactNode; redirectTo?: string };

export function RoleGuard({ roles, children, redirectTo = "/customer/dashboard" }: Props) {
    const { isLoading, user } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        const ok = !!user.role && roles.includes(String(user.role).toUpperCase());
        if (!ok) router.replace(redirectTo);
    }, [isLoading, user, roles, router, redirectTo]);

    if (isLoading || !user) {
        return (
            <div className="min-h-dvh grid place-items-center">
                <SpinnerCustom />
            </div>
        );
    }

    return <>{children}</>;
}
