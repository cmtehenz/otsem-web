"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    BadgeCheck,
    ArrowUpDown,
    Wallet,
    Settings,
    Building2,
} from "lucide-react";

const actions = [
    {
        label: "Usuários",
        href: "/admin/users",
        icon: Users,
        color: "border-blue-500/20 hover:bg-blue-500/5 hover:border-blue-500/40",
    },
    {
        label: "Verificação KYC",
        href: "/admin/kyc",
        icon: BadgeCheck,
        color: "border-green-500/20 hover:bg-green-500/5 hover:border-green-500/40",
    },
    {
        label: "Transações",
        href: "/admin/recebidos",
        icon: ArrowUpDown,
        color: "border-[#6F00FF]/20 hover:bg-[#6F00FF]/5 hover:border-[#6F00FF]/40",
    },
    {
        label: "Carteiras USDT",
        href: "/admin/wallets",
        icon: Wallet,
        color: "border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/40",
    },
    {
        label: "Config. Banco",
        href: "/admin/settings/bank",
        icon: Building2,
        color: "border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40",
    },
    {
        label: "Configurações",
        href: "/admin/settings/bank",
        icon: Settings,
        color: "border-slate-500/20 hover:bg-slate-500/5 hover:border-slate-500/40",
    },
];

export default function QuickActions() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            className={`h-auto flex-col gap-1.5 sm:gap-2 py-3 sm:py-4 transition-all ${action.color}`}
                            asChild
                        >
                            <Link href={action.href}>
                                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{action.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
