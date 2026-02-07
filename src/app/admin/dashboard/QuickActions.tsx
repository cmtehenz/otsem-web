"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    BadgeCheck,
    ArrowUpDown,
    Wallet,
    Settings,
    Building2,
    Zap,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

const actions = [
    {
        label: "Usuarios",
        href: "/admin/users",
        icon: Users,
        color: "blue",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        borderColor: "border-blue-100",
        hoverBorder: "group-hover:border-blue-300",
        hoverShadow: "group-hover:shadow-blue-100/60",
    },
    {
        label: "Verificacao KYC",
        href: "/admin/kyc",
        icon: BadgeCheck,
        color: "green",
        iconBg: "bg-green-50",
        iconColor: "text-green-500",
        borderColor: "border-green-100",
        hoverBorder: "group-hover:border-green-300",
        hoverShadow: "group-hover:shadow-green-100/60",
    },
    {
        label: "Transacoes",
        href: "/admin/recebidos",
        icon: ArrowUpDown,
        color: "purple",
        iconBg: "bg-[#6F00FF]/[0.06]",
        iconColor: "text-[#6F00FF]",
        borderColor: "border-[#6F00FF]/10",
        hoverBorder: "group-hover:border-[#6F00FF]/30",
        hoverShadow: "group-hover:shadow-[#6F00FF]/10",
    },
    {
        label: "Carteiras USDT",
        href: "/admin/wallets",
        icon: Wallet,
        color: "amber",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        borderColor: "border-amber-100",
        hoverBorder: "group-hover:border-amber-300",
        hoverShadow: "group-hover:shadow-amber-100/60",
    },
    {
        label: "Config. Banco",
        href: "/admin/settings/bank",
        icon: Building2,
        color: "emerald",
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-100",
        hoverBorder: "group-hover:border-emerald-300",
        hoverShadow: "group-hover:shadow-emerald-100/60",
    },
    {
        label: "Configuracoes",
        href: "/admin/settings/bank",
        icon: Settings,
        color: "slate",
        iconBg: "bg-slate-50",
        iconColor: "text-slate-500",
        borderColor: "border-slate-100",
        hoverBorder: "group-hover:border-slate-300",
        hoverShadow: "group-hover:shadow-slate-100/60",
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 420,
            damping: 26,
            mass: 0.8,
        },
    },
};

export default function QuickActions() {
    return (
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-black/[0.04]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100">
                        <Zap className="h-4 w-4 text-gray-500" />
                    </div>
                    Acoes Rapidas
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-5">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-3 gap-2.5 md:grid-cols-6"
                >
                    {actions.map((action) => (
                        <motion.div
                            key={action.label}
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.04,
                                y: -2,
                                transition: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 25,
                                },
                            }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <Link
                                href={action.href}
                                className={`group flex flex-col items-center gap-2.5 rounded-2xl border bg-white p-3.5 sm:p-4 transition-all duration-200 ${action.borderColor} ${action.hoverBorder} ${action.hoverShadow} hover:shadow-lg`}
                            >
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
                                >
                                    <action.icon
                                        className={`h-5 w-5 ${action.iconColor}`}
                                    />
                                </div>
                                <span className="text-center text-[11px] font-medium leading-tight text-gray-600 transition-colors group-hover:text-gray-900 sm:text-xs">
                                    {action.label}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </CardContent>
        </Card>
    );
}
