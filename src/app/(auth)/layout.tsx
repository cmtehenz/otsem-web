// src/app/(app)/layout.tsx  ← tudo dentro fica protegido
"use client";

import * as React from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Protected>
                {children}
            </Protected>
        </AuthProvider>
    );
}
