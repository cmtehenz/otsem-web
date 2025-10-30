// app/logout/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutPage() {
    const router = useRouter();

    React.useEffect(() => {
        (async () => {
            toast.success("Você saiu da sua conta.");
            router.replace("/login");
        })();
    }, [router]);

    return (
        <div className="min-h-dvh grid place-items-center px-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saindo…
            </div>
        </div>
    );
}
