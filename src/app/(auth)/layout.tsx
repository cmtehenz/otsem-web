// src/app/(auth)/layout.tsx
import type { Metadata } from "next";
import AuthenticatedAppShell from "@/components/layout/AuthenticatedAppShell";
import { ClientAuthGate } from "@/components/layout/ClientAuthGate";

export const metadata: Metadata = { title: "Otsem Bank" };

export default function Layout({ children }: { children: React.ReactNode }) {
    // ⚠️ No DEMO o "token" vai no localStorage (client).
    // Por isso o guard precisa ser client-side. Se no futuro
    // você usar cookies/sessão no servidor, pode mover o guard pra cá.

    return (
        <AuthenticatedAppShell>
            <ClientAuthGate>{children}</ClientAuthGate>
        </AuthenticatedAppShell>
    );
}
