"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

export function ClientAuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        if (!token) {
            const next = encodeURIComponent(pathname || "/dashboard");
            router.replace(`/login?next=${next}`);
        }
    }, [router, pathname]);

    // Poderia exibir um skeleton breve aqui:
    return <>{children}</>;
}
