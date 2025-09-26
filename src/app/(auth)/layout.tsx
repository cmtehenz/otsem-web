import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthenticatedAppShell from "@/components/layout/AuthenticatedAppShell";

export const metadata: Metadata = { title: "Otsem Bank" };

export default async function Layout({ children }: { children: React.ReactNode }) {
    // pega cookies (já é síncrono!)
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    // apos redirecionar
    // if (!token) redirect("/login");

    return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
