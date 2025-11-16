"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import {
    LayoutDashboard,
    KeyRound,
    ShieldCheck,
    Send,
    CreditCard,
    Settings,
    LifeBuoy,
    LogOut,
    ShieldQuestion,
    ShieldAlert,
} from "lucide-react";

// ✅ Use o contexto que você já tem
import { useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import http from "@/lib/http";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* -------------------------------------------------------- */
/* 📦 Types */
/* -------------------------------------------------------- */
type CustomerAddress = {
    zipCode: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    cityIbgeCode: string | number;
    city?: string;
    state?: string;
};

type CustomerResponse = {
    id: string;
    type: "PF" | "PJ";
    accountStatus: "not_requested" | "in_review" | "approved" | "rejected";
    name?: string;
    cpf?: string;
    birthday?: string;
    phone?: string;
    email: string;
    address?: CustomerAddress;
    createdAt: string;
};

/* -------------------------------------------------------- */
/* 🔗 Menu agrupado */
/* -------------------------------------------------------- */
const menuGroups = [
    {
        title: "Conta",
        items: [
            { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
            // { label: "Carteiras", href: "/customer/wallet/usdt/receive", icon: Wallet },
            { label: "Pix", href: "/customer/pix", icon: KeyRound },
            { label: "Verificar Identidade", href: "/customer/kyc", icon: ShieldCheck },
        ],
    },
    {
        title: "Pagamentos",
        items: [
            { label: "Payouts", href: "/customer/payouts", icon: Send },
            { label: "Cartões", href: "/customer/card", icon: CreditCard },
        ],
    },
    {
        title: "Outros",
        items: [{ label: "Configurações", href: "/customer/settings", icon: Settings }],
    },
    {
        title: "Ajuda e Suporte",
        items: [{ label: "Central de Ajuda", href: "/customer/support", icon: LifeBuoy }],
    },
];

/* -------------------------------------------------------- */
/* 🧭 Helpers */
/* -------------------------------------------------------- */
function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

/* -------------------------------------------------------- */
/* 🛡️ Badge KYC */
/* -------------------------------------------------------- */
function KycBadge({
    status,
}: {
    status: "approved" | "in_review" | "not_requested" | "rejected";
}) {
    const config = {
        approved: {
            style: "bg-green-100 text-green-700",
            icon: ShieldCheck,
            label: "Verificado",
        },
        in_review: {
            style: "bg-blue-100 text-blue-700",
            icon: ShieldQuestion,
            label: "Em Análise",
        },
        rejected: {
            style: "bg-red-100 text-red-700",
            icon: ShieldAlert,
            label: "Rejeitado",
        },
        not_requested: {
            style: "bg-[#f8bc07]/20 text-[#f8bc07]",
            icon: ShieldAlert,
            label: "Pendente",
        },
    };

    const { style, icon: Icon, label } = config[status];

    return (
        <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </div>
    );
}

/* -------------------------------------------------------- */
/* 🧩 Sidebar */
/* -------------------------------------------------------- */
function CustomerSidebar({ kycStatus }: { kycStatus: CustomerResponse["accountStatus"] }) {
    const pathname = usePathname() ?? "";

    return (
        <Sidebar
            variant="floating"
            className="border-r border-[#b852ff]/20 bg-[#faffff] backdrop-blur-sm"
        >
            {/* Header */}
            <SidebarHeader className="px-4 py-3 border-b border-[#b852ff]/10 bg-[#faffff]">
                <Link
                    href="/customer/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold text-[#b852ff]"
                >
                    💸 Otsem Bank
                </Link>
            </SidebarHeader>

            {/* Conteúdo */}
            <SidebarContent>
                {/* Badge KYC */}
                <SidebarGroup className="p-2">
                    <div className="px-3 py-2">
                        <KycBadge status={kycStatus} />
                    </div>
                </SidebarGroup>

                {/* Menu Groups */}
                {menuGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs px-3 text-[#b852ff]/70">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(pathname, item.href);

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={active}
                                                className={
                                                    active
                                                        ? "bg-[#b852ff] text-[#faffff] hover:bg-[#b852ff]/90"
                                                        : "text-[#000000] hover:bg-[#b852ff]/10"
                                                }
                                            >
                                                <Link href={item.href} className="flex items-center gap-3">
                                                    <Icon className={active ? "h-4 w-4 text-[#faffff]" : "h-4 w-4 text-[#b852ff]"} />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {/* Footer */}
                <div className="mt-auto p-4 border-t border-[#b852ff]/10">
                    <p className="text-xs text-[#b852ff]/70 text-center">
                        © 2025 Otsem Bank
                    </p>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

/* -------------------------------------------------------- */
/* 🧭 Breadcrumb */
/* -------------------------------------------------------- */
function AutoBreadcrumb() {
    const segments = useSelectedLayoutSegments() ?? [];
    const parts = ["customer", ...segments];

    const titleCase = (s: string) =>
        s.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {parts.map((seg, idx) => {
                    const isLast = idx === parts.length - 1;
                    const href = "/" + parts.slice(0, idx + 1).join("/");

                    return (
                        <React.Fragment key={seg}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="font-medium">
                                        {titleCase(seg)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>
                                        {titleCase(seg)}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
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
    const { user } = useAuth();
    const [kycStatus, setKycStatus] = React.useState<CustomerResponse["accountStatus"]>(
        "not_requested"
    );
    const [loading, setLoading] = React.useState(true);

    // Busca o status KYC real
    React.useEffect(() => {
        async function loadKyc() {
            try {
                const response = await http.get<{ data: CustomerResponse }>("/customers/me");
                const customer = response.data.data;

                if (customer?.accountStatus) {
                    setKycStatus(customer.accountStatus);
                }
            } catch (err) {
                console.error("Erro ao buscar KYC:", err);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadKyc();
        }
    }, [user]);

    return (
        <Protected>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <CustomerSidebar kycStatus={kycStatus} />

                    <div className="flex flex-1 flex-col">
                        {/* Header */}
                        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="h-6" />
                            <AutoBreadcrumb />
                            <div className="ml-auto flex items-center gap-2">
                                <HeaderLogout />
                            </div>
                        </header>

                        {/* Main Content */}
                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-muted-foreground">Carregando...</div>
                                </div>
                            ) : (
                                children
                            )}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </Protected>
    );
}
