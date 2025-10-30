// src/app/(customer)/layout.tsx
"use client";

import * as React from "react";
import { useSelectedLayoutSegments } from "next/navigation";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { HeaderUserChip } from "@/components/auth/HeaderUserChip";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, KeyRound, Send, CreditCard, Settings } from "lucide-react";

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(href + "/");
}

function CustomerSidebar() {
    const pathname = usePathname();
    const items = [
        { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
        { label: "Carteiras", href: "/customer/wallets", icon: Wallet },
        { label: "Pix", href: "/customer/pix", icon: KeyRound },
        { label: "Payouts", href: "/customer/payouts", icon: Send },
        { label: "Cartões", href: "/customer/cards", icon: CreditCard },
        { label: "Configurações", href: "/customer/settings", icon: Settings },
    ] as const;

    return (
        <Sidebar variant="floating">
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="gap-1.5">
                        {items.map((it) => {
                            const Icon = it.icon;
                            const active = isActive(pathname, it.href);
                            return (
                                <SidebarMenuItem key={it.href}>
                                    <SidebarMenuButton asChild isActive={active}>
                                        <Link href={it.href}>
                                            <Icon className="size-4" />
                                            {it.label}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

function AutoBreadcrumb() {
    const segments = useSelectedLayoutSegments(); // ex.: ["dashboard"]
    const parts = ["customer", ...segments];

    if (parts.length <= 1) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Customer</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

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

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Protected>
                <RoleGuard roles={["CUSTOMER"]} redirectTo="/admin/dashboard">
                    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
                        <CustomerSidebar />
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
