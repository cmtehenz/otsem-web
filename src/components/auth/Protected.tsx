// src/components/auth/Protected.tsx
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { FullscreenSpinner } from "@/components/ui/spinner";

export function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
    const { loading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        if (loading) return;
        if (!user) {
            const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
            router.replace(`/login${next}`);
            return;
        }
        if (roles && user.role && !roles.includes(user.role)) {
            router.replace("/"); // ou uma página 403
        }
    }, [loading, user, roles, pathname, router]);

    if (loading || !user) {
        return <FullscreenSpinner label="Verificando sessão…" />;
    }

    return <>{children}</>;
}
