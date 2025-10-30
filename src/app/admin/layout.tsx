// src/app/(admin)/layout.tsx
"use client";

import * as React from "react";
import { useSelectedLayoutSegments } from "next/navigation";

import { AuthProvider } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";      // opcional: se já usa em áreas privadas
import { RoleGuard } from "@/components/auth/RoleGuard";      // restringe a ADMIN

import { AppSidebar } from "@/components/app-sidebar";
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
    const segments = useSelectedLayoutSegments(); // ex.: ["users", "123"]
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {/* Se você já garante login em outro lugar, pode remover o <Protected /> */}
            <Protected>
                {/* Permite somente ADMIN; altere redirectTo se preferir */}
                <RoleGuard roles={["ADMIN"]} redirectTo="/dashboard">
                    <SidebarProvider
                        style={
                            {
                                // mantém o mesmo width do seu exemplo
                                "--sidebar-width": "19rem",
                            } as React.CSSProperties
                        }
                    >
                        <AppSidebar />

                        <SidebarInset>
                            {/* Header */}
                            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1" />
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 data-[orientation=vertical]:h-4"
                                />
                                <AutoBreadcrumb />
                            </header>

                            {/* Conteúdo */}
                            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                                {children}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </RoleGuard>
            </Protected>
        </AuthProvider>
    );
}
