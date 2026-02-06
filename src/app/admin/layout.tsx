// src/app/(admin)/layout.tsx
"use client";

import * as React from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { useTranslations } from "next-intl";

import { useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import { RoleGuard } from "@/components/auth/RoleGuard";

import { AppSidebar } from "@/components/app-sidebar";
import { HeaderUserChip } from "@/components/auth/HeaderUserChip";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
    const segments = useSelectedLayoutSegments() ?? [];
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

function MobileBreadcrumb() {
    const segments = useSelectedLayoutSegments() ?? [];
    if (segments.length === 0) return null;

    const parts = ["admin", ...segments];
    const currentLabel = titleCase(segments[segments.length - 1]);
    const parentHref = segments.length > 1
        ? "/" + parts.slice(0, parts.length - 1).join("/")
        : "/admin/dashboard";

    return (
        <a
            href={parentHref}
            className="flex items-center gap-0.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-w-0"
        >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentLabel}</span>
        </a>
    );
}

function HeaderLogout() {
    const { logout } = useAuth();
    const t = useTranslations("auth");
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title={t("logoutAccount")}
            aria-label={t("logoutAccount")}
        >
            <LogOut className="h-5 w-5" />
        </Button>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Protected>
            <RoleGuard roles={["ADMIN"]} redirectTo="/customer/dashboard">
                <SidebarProvider
                        style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
                    >
                        <AppSidebar />

                        <SidebarInset>
                            <header className="flex h-14 shrink-0 items-center gap-1.5 px-3 sm:h-16 sm:gap-2 sm:px-4">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mr-2 hidden sm:block data-[orientation=vertical]:h-4" />
                                <div className="sm:hidden min-w-0">
                                    <MobileBreadcrumb />
                                </div>
                                <div className="hidden sm:block min-w-0 flex-1">
                                    <AutoBreadcrumb />
                                </div>

                                {/* Chip do usuário + Logout */}
                                <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                                    <div className="hidden md:block">
                                        <LanguageSwitcher />
                                    </div>
                                    <HeaderUserChip />
                                    <Separator orientation="vertical" className="h-6 hidden sm:block" />
                                    <HeaderLogout />
                                </div>
                            </header>

                            <main className="flex flex-1 flex-col gap-3 p-3 pt-0 sm:gap-4 sm:p-4 sm:pt-0">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
            </RoleGuard>
        </Protected>
    );
}
