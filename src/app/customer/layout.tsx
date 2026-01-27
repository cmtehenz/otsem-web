"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import {
    LayoutDashboard,
    KeyRound,
    ShieldCheck,
    Send,
    Settings,
    LifeBuoy,
    LogOut,
    ShieldQuestion,
    ShieldAlert,
    Wallet,
    Users,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { DepositModal } from "@/components/modals/deposit-modal";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { SellUsdtModal } from "@/components/modals/sell-usdt-modal";
import { useUiModals } from "@/stores/ui-modals";

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
    accountStatus: string;
    name?: string;
    cpf?: string;
    birthday?: string;
    phone?: string;
    email: string;
    address?: CustomerAddress;
    createdAt: string;
};

const menuGroups = [
    {
        title: "Conta",
        items: [
            { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
            { label: "Carteiras", href: "/customer/wallet", icon: Wallet },
            { label: "Pix", href: "/customer/pix", icon: KeyRound },
            { label: "Verificar Identidade", href: "/customer/kyc", icon: ShieldCheck },
        ],
    },
    {
        title: "Pagamentos",
        items: [
            { label: "Transações", href: "/customer/transactions", icon: Send },
        ],
    },
    {
        title: "Afiliados",
        items: [
            { label: "Minhas Indicações", href: "/customer/affiliates", icon: Users },
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

function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

function KycBadge({ status }: { status: string }) {
    const config: Record<string, { style: string; icon: typeof ShieldCheck; label: string }> = {
        approved: {
            style: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
            icon: ShieldCheck,
            label: "Verificado",
        },
        completed: {
            style: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
            icon: ShieldCheck,
            label: "Verificado",
        },
        in_review: {
            style: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
            icon: ShieldQuestion,
            label: "Em Análise",
        },
        requested: {
            style: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
            icon: ShieldQuestion,
            label: "Em Análise",
        },
        pending: {
            style: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
            icon: ShieldQuestion,
            label: "Em Análise",
        },
        rejected: {
            style: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
            icon: ShieldAlert,
            label: "Rejeitado",
        },
        not_requested: {
            style: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
            icon: ShieldAlert,
            label: "Pendente",
        },
    };

    const defaultConfig = {
        style: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
        icon: ShieldAlert,
        label: "Pendente",
    };

    const { style, icon: Icon, label } = config[status] || defaultConfig;

    return (
        <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${style}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </div>
    );
}

function CustomerSidebar({ kycStatus }: { kycStatus: string }) {
    const pathname = usePathname() ?? "";

    return (
        <Sidebar
            variant="sidebar"
            className="border-none bg-sidebar [&>div]:border-none [&>div]:shadow-none"
        >
            <SidebarHeader className="px-4 py-4 border-b border-sidebar-border bg-sidebar">
                <Link
                    href="/customer/dashboard"
                    className="flex items-center gap-3"
                >
                    <Image
                        src="/images/logo.png"
                        alt="OtsemPay"
                        width={36}
                        height={36}
                        className="rounded-lg"
                    />
                    <span className="text-lg font-bold">
                        <span className="text-amber-500 dark:text-amber-400">Otsem</span>
                        <span className="text-[#6F00FF] dark:text-[#6F00FF]">Pay</span>
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar">
                <SidebarGroup className="p-3">
                    <div className="px-2 py-2">
                        <KycBadge status={kycStatus} />
                    </div>
                </SidebarGroup>

                {menuGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-xs px-4 text-muted-foreground uppercase tracking-wider font-medium">
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
                                                        ? "bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] text-white hover:from-[#6F00FF]/50 hover:to-[#6F00FF] rounded-xl mx-2"
                                                        : "text-foreground/70 hover:bg-accent hover:text-foreground rounded-xl mx-2"
                                                }
                                            >
                                                <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                                                    <Icon className={active ? "h-4 w-4 text-white" : "h-4 w-4 text-[#6F00FF] dark:text-[#6F00FF]"} />
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                <div className="mt-auto p-4 border-t border-sidebar-border">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2025 OtsemPay
                    </p>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

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
                                    <BreadcrumbPage className="font-medium text-foreground">
                                        {titleCase(seg)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href} className="text-muted-foreground hover:text-foreground">
                                        {titleCase(seg)}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="text-muted-foreground/50" />}
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
            className="text-muted-foreground hover:bg-red-500/20 hover:text-red-500"
        >
            <LogOut className="h-5 w-5" />
        </Button>
    );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { open, closeModal, triggerRefresh } = useUiModals();
    const [kycStatus, setKycStatus] = React.useState<string>("not_requested");
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadKyc() {
            try {
                const response = await http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me");
                const customer = "data" in response.data && response.data.data ? response.data.data : response.data;

                if ((customer as CustomerResponse)?.accountStatus) {
                    setKycStatus((customer as CustomerResponse).accountStatus);
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
            <DepositModal />
            <WithdrawModal />
            <SellUsdtModal 
                open={open.sellUsdt} 
                onClose={() => closeModal("sellUsdt")} 
                onSuccess={triggerRefresh}
            />
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-background">
                    <CustomerSidebar kycStatus={kycStatus} />

                    <div className="flex flex-1 flex-col">
                        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
                            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-accent" />
                            <Separator orientation="vertical" className="h-6 bg-border" />
                            <AutoBreadcrumb />
                            <div className="ml-auto flex items-center gap-2">
                                <ThemeToggle />
                                <HeaderLogout />
                            </div>
                        </header>

                        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
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
