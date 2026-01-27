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
    FileText,
    Building2,
    Shield
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
        href: "/admin/transactions",
        icon: ArrowUpDown,
        color: "border-[#6F00FF]/50/20 hover:bg-[#6F00FF]/50/5 hover:border-[#6F00FF]/50/40",
    },
    {
        label: "Carteiras USDT",
        href: "/admin/wallets",
        icon: Wallet,
        color: "border-amber-500/20 hover:bg-amber-500/5 hover:border-amber-500/40",
    },
    {
        label: "Extrato Banco",
        href: "/admin/bank",
        icon: Building2,
        color: "border-emerald-500/20 hover:bg-emerald-500/5 hover:border-emerald-500/40",
    },
    {
        label: "Relatórios",
        href: "/admin/reports",
        icon: FileText,
        color: "border-cyan-500/20 hover:bg-cyan-500/5 hover:border-cyan-500/40",
    },
    {
        label: "Segurança",
        href: "/admin/security",
        icon: Shield,
        color: "border-red-500/20 hover:bg-red-500/5 hover:border-red-500/40",
    },
    {
        label: "Configurações",
        href: "/admin/settings",
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8">
                    {actions.map((action) => (
                        <Button
                            key={action.href}
                            variant="outline"
                            className={`h-auto flex-col gap-2 py-4 transition-all ${action.color}`}
                            asChild
                        >
                            <Link href={action.href}>
                                <action.icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{action.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
