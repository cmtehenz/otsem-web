// src/components/app-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Settings,
  Webhook,
  Bug,
  Flag,
  GalleryVerticalEnd,
  Wallet,
  UserPlus,
  ArrowRightLeft,
  ArrowUpCircle,
  Building2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type Item = {
  title: string;
  url: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  items?: Item[];
};

function useNav(): Item[] {
  const t = useTranslations("sidebar");
  return [
    {
      title: t("overview"),
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("operations"),
      url: "/admin",
      items: [
        { title: t("transactions"), url: "/admin/recebidos", icon: Banknote },
        { title: t("buyUsdt"), url: "/admin/conversions", icon: ArrowRightLeft },
        { title: t("sellUsdt"), url: "/admin/sell-deposits", icon: ArrowRightLeft },
      ],
    },
    {
      title: t("usersAndWallets"),
      url: "/admin",
      items: [
        { title: t("users"), url: "/admin/users", icon: Users },
        { title: t("usdtWallets"), url: "/admin/wallets", icon: Wallet },
        { title: t("affiliates"), url: "/admin/affiliates", icon: UserPlus },
        { title: t("kycUpgrades"), url: "/admin/kyc-upgrades", icon: ArrowUpCircle },
      ],
    },
    {
      title: t("system"),
      url: "/admin",
      items: [
        { title: t("settings"), url: "/admin/settings", icon: Settings },
        { title: t("bankSettings"), url: "/admin/settings/bank", icon: Building2 },
        { title: t("webhooks"), url: "/admin/webhooks", icon: Webhook },
        { title: t("featureFlags"), url: "/admin/flags", icon: Flag },
        { title: t("logs"), url: "/admin/logs", icon: Bug },
      ],
    },
  ];
}

function isActive(pathname: string, href: string) {
  // ativo se for a rota exata ou um prefixo (ex.: /admin/users/123)
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname() ?? "";
  const nav = useNav();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/admin/dashboard"
                aria-label="Ir para dashboard do Admin"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Otsem Admin</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {nav.map((group) => {
              const asSingle = !group.items?.length;
              if (asSingle) {
                const active = isActive(pathname, group.url);
                const Icon = group.icon ?? LayoutDashboard;
                return (
                  <SidebarMenuItem key={group.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={group.url} className="font-medium">
                        <Icon className="size-4" />
                        {group.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <SidebarMenuItem key={group.title}>
                  <SidebarMenuButton asChild>
                    <span className="font-medium flex items-center gap-2 relative">
                      {group.title}
                    </span>
                  </SidebarMenuButton>
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {group.items!.map((item) => {
                      const active = isActive(pathname, item.url);
                      const Icon = item.icon ?? LayoutDashboard;
                      return (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={active}>
                            <Link
                              href={item.url}
                              className="flex items-center gap-2 relative"
                            >
                              <Icon className="size-4" />
                              <span className="flex-1">{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
