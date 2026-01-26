// src/app/(admin)/layout.tsx
"use client";

import * as React from "react";
import { useSelectedLayoutSegments } from "next/navigation";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import { RoleGuard } from "@/components/auth/RoleGuard";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderUserChip } from "@/components/auth/HeaderUserChip";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function titleCase(s: string) {
    return s.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function AutoBreadcrumb() {
    const segments = useSelectedLayoutSegments() ?? []; // ex.: ["users","123"]
    const parts = ["admin", ...segments];

    if (parts.length <= 1) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Admin</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {parts.map((seg, idx) => {
                    const href = "/" + parts.slice(0, idx + 1).join("/");
                    const label = titleCase(seg);
                    const isLast = idx === parts.length - 1;
                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem className={idx === 0 ? "hidden md:block" : undefined}>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

function HeaderLogout() {
    const { logout } = useAuth();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sair da conta"
            aria-label="Sair da conta"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Protected>
                <RoleGuard roles={["ADMIN"]} redirectTo="/customer/dashboard">
                    <SidebarProvider
                        style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
                    >
                        <AppSidebar />

                        <SidebarInset>
                            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                                <AutoBreadcrumb />

                                {/* Chip do usuário + Logout */}
                                <div className="ml-auto flex items-center gap-2">
                                    <HeaderUserChip />
                                    <Separator orientation="vertical" className="h-6" />
                                    <HeaderLogout />
                                </div>
                            </header>

                            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </RoleGuard>
            </Protected>
        </AuthProvider>
    );
}
