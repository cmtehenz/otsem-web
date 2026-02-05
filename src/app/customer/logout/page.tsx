// app/logout/page.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function LogoutPage() {
    const { logout } = useAuth();

    React.useEffect(() => {
        toast.success("Você saiu da sua conta.");
        logout();
    }, [logout]);

    return (
        <div className="min-h-dvh grid place-items-center px-4">
            <div className="flex items-center gap-3 text-sm text-white">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Saindo…
            </div>
        </div>
    );
}
