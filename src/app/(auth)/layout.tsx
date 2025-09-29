import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthenticatedAppShell from "@/components/layout/AuthenticatedAppShell";

export const metadata: Metadata = { title: "Otsem Bank" };

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) redirect("/login?next=/dashboard"); // ou use pathname atual

    return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
