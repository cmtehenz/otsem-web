"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import {
    LogOut,
    LayoutDashboard,
    Wallet,
    KeyRound,
    Send,
    CreditCard,
    Settings,
    ArrowLeftCircle,
    ShieldCheck,
    ShieldAlert,
    ShieldQuestion,
    LifeBuoy,
    MessageCirclePlus,
} from "lucide-react";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { HeaderUserChip } from "@/components/auth/HeaderUserChip";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* -------------------------------------------------------- */
/* 🔗 Menu agrupado */
/* -------------------------------------------------------- */
const menuGroups = [
    {
        title: "Conta",
        items: [
            { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
            { label: "Carteiras", href: "/customer/wallets", icon: Wallet },
            { label: "Pix", href: "/customer/pix", icon: KeyRound },

            // 🧾 Aqui entra o novo item:
            { label: "Verificar Identidade", href: "/customer/kyc", icon: ShieldCheck },
        ],
    },
    {
        title: "Pagamentos",
        items: [
            { label: "Payouts", href: "/customer/payouts", icon: Send },
            { label: "Cartões", href: "/customer/cards", icon: CreditCard },
        ],
    },
    {
        title: "Outros",
        items: [
            { label: "Configurações", href: "/customer/settings", icon: Settings },
        ],
    },
    {
        title: "Ajuda e Suporte",
        items: [
            { label: "Central de Ajuda", href: "/customer/support", icon: LifeBuoy },
        ],
    },
];


/* -------------------------------------------------------- */
/* 🧭 Helpers */
/* -------------------------------------------------------- */
function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

/* -------------------------------------------------------- */
/* 🧩 Sidebar */
/* -------------------------------------------------------- */
function CustomerSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar
            variant="floating"
            className="border-r border-border/40 bg-background/60 backdrop-blur-sm"
        >
            {/* Header */}
            <SidebarHeader className="px-4 py-3 border-b border-border/30">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-indigo-600 dark:text-indigo-400"
                >
                    Otsem Bank 💸
                </Link>
            </SidebarHeader>

            {/* Conteúdo */}
            <SidebarContent>
                <SidebarGroup className="p-2">
                    <SidebarMenu className="gap-1.5">
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link
                                    href="/customer/dashboard"
                                    className="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    <ArrowLeftCircle className="h-4 w-4" />
                                    Voltar ao Painel
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <Separator className="my-2" />
                    </SidebarMenu>
                </SidebarGroup>

                {menuGroups.map((group) => (
                    <SidebarGroup key={group.title} className="px-2">
                        <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {group.title}
                        </p>
                        <SidebarMenu className="gap-1.5">
                            {group.items.map((it) => {
                                const Icon = it.icon;
                                const active = isActive(pathname, it.href);
                                return (
                                    <SidebarMenuItem key={it.href}>
                                        <SidebarMenuButton asChild isActive={active}>
                                            <Link
                                                href={it.href}
                                                className="flex items-center gap-2 text-sm transition-colors"
                                            >
                                                <Icon className="h-4 w-4 opacity-80" />
                                                {it.label}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}

                {/* 💬 Botão de ticket fixo */}
                <div className="p-3 mt-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        asChild
                    >
                        <Link href="/customer/support/ticket">
                            <MessageCirclePlus className="h-4 w-4 mr-1" />
                            Abrir Ticket
                        </Link>
                    </Button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

/* -------------------------------------------------------- */
/* 🧭 Breadcrumb */
/* -------------------------------------------------------- */
function AutoBreadcrumb() {
    const segments = useSelectedLayoutSegments();
    const parts = ["customer", ...segments];
    const titleCase = (s: string) =>
        s.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

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

/* -------------------------------------------------------- */
/* 🛡️ Badge KYC */
/* -------------------------------------------------------- */
function KycBadge({
    status,
}: {
    status: "approved" | "in_review" | "not_requested" | "rejected";
}) {
    const style =
        status === "approved"
            ? "bg-green-100 text-green-700"
            : status === "in_review"
                ? "bg-blue-100 text-blue-700"
                : status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600";

    const Icon =
        status === "approved"
            ? ShieldCheck
            : status === "in_review"
                ? ShieldQuestion
                : ShieldAlert;

    const label =
        status === "approved"
            ? "Verificado"
            : status === "in_review"
                ? "Em Análise"
                : status === "rejected"
                    ? "Rejeitado"
                    : "Pendente";

    return (
        <div
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </div>
    );
}

/* -------------------------------------------------------- */
/* 🚪 Logout */
/* -------------------------------------------------------- */
function HeaderLogout() {
    const { logout } = useAuth();
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    );
}

/* -------------------------------------------------------- */
/* 🧱 Layout Principal */
/* -------------------------------------------------------- */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuth();
    const [kycStatus, setKycStatus] = React.useState<
        "approved" | "in_review" | "not_requested" | "rejected"
    >("not_requested");

    // Busca o status KYC real do customer logado
    React.useEffect(() => {
        async function loadKyc() {
            try {
                if (!user?.id || !token) return;
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/customers/${user.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) throw new Error("Erro ao buscar status KYC");
                const data = await res.json();
                if (data.accountStatus) setKycStatus(data.accountStatus);
            } catch (err) {
                console.warn("Falha ao carregar status KYC:", err);
            }
        }
        loadKyc();
    }, [user, token]);

    return (
        <AuthProvider>
            <Protected>
                <RoleGuard roles={["CUSTOMER"]} redirectTo="/admin/dashboard">
                    <SidebarProvider style={{ "--sidebar-width": "17rem" } as React.CSSProperties}>
                        <CustomerSidebar />
                        <SidebarInset>
                            {/* Header */}
                            <header className="flex h-16 shrink-0 items-center gap-3 px-4 bg-background/80 backdrop-blur-md border-b border-border/40">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <AutoBreadcrumb />

                                <div className="ml-auto flex items-center gap-3">
                                    <KycBadge status={kycStatus} />
                                    <HeaderUserChip />
                                    <Separator orientation="vertical" className="h-6" />
                                    <HeaderLogout />
                                </div>
                            </header>

                            {/* Conteúdo principal */}
                            <main className="flex flex-1 flex-col gap-6 p-6 bg-muted/10 rounded-tl-2xl">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                </RoleGuard>
            </Protected>
        </AuthProvider>
    );
}
