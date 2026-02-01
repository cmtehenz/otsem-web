"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Wallet,
    Plus,
    ArrowLeftRight,
    User,
} from "lucide-react";
import { useState } from "react";
import { ActionSheet } from "./ActionSheet";

const tabs = [
    { id: "home", label: "Home", icon: Home, href: "/customer/dashboard" },
    { id: "wallet", label: "Carteira", icon: Wallet, href: "/customer/wallet" },
    { id: "action", label: "", icon: Plus, href: "#" },
    { id: "activity", label: "Atividade", icon: ArrowLeftRight, href: "/customer/transactions" },
    { id: "profile", label: "Perfil", icon: User, href: "/customer/settings" },
];

function getActiveTab(pathname: string): string {
    if (pathname.startsWith("/customer/dashboard")) return "home";
    if (pathname.startsWith("/customer/wallet")) return "wallet";
    if (pathname.startsWith("/customer/transactions")) return "activity";
    if (
        pathname.startsWith("/customer/settings") ||
        pathname.startsWith("/customer/kyc") ||
        pathname.startsWith("/customer/pix") ||
        pathname.startsWith("/customer/support") ||
        pathname.startsWith("/customer/affiliates")
    )
        return "profile";
    return "home";
}

export function BottomNav() {
    const pathname = usePathname() ?? "";
    const activeTab = getActiveTab(pathname);
    const [actionSheetOpen, setActionSheetOpen] = useState(false);

    return (
        <>
            <ActionSheet
                open={actionSheetOpen}
                onClose={() => setActionSheetOpen(false)}
            />

            {/* Floating bar wrapper — extends to screen edge, pill floats inside via padding */}
            <div className="fixed z-50 left-0 right-0 flex justify-center pointer-events-none pwa-nav-bottom">
                {/* Soft gradient veil — replaces the hard solid background strip */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />

                <nav className="pointer-events-auto relative mx-4 w-full max-w-[400px] rounded-[28px] overflow-hidden liquid-glass-nav">

                    {/* Specular highlight — top edge refraction line */}
                    <div className="absolute inset-x-4 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/15 to-transparent pointer-events-none z-10" />

                    {/* Bottom edge subtle light */}
                    <div className="absolute inset-x-6 bottom-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent pointer-events-none z-10" />

                    {/* Tab items */}
                    <div className="relative flex items-center justify-around px-1 py-2.5 z-10">
                        {tabs.map((tab) => {
                            const isActive = tab.id === activeTab;
                            const isAction = tab.id === "action";
                            const Icon = tab.icon;

                            /* ─── Center FAB ─── */
                            if (isAction) {
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActionSheetOpen(true)}
                                        className="relative flex items-center justify-center outline-none -my-1"
                                    >
                                        <motion.div
                                            className="relative flex items-center justify-center w-[52px] h-[52px] rounded-full"
                                            style={{
                                                background:
                                                    "linear-gradient(145deg, #9B4DFF 0%, #6F00FF 50%, #5800CC 100%)",
                                                boxShadow: [
                                                    "0 4px 24px rgba(111, 0, 255, 0.45)",
                                                    "0 1px 4px rgba(111, 0, 255, 0.3)",
                                                    "inset 0 1px 0 rgba(255,255,255,0.3)",
                                                    "inset 0 -1px 0 rgba(0,0,0,0.15)",
                                                ].join(", "),
                                            }}
                                            whileTap={{ scale: 0.88 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 25,
                                            }}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={actionSheetOpen ? "close" : "open"}
                                                    initial={{ rotate: actionSheetOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                    exit={{ rotate: actionSheetOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 25,
                                                    }}
                                                >
                                                    <Plus
                                                        className={`w-6 h-6 text-white ${actionSheetOpen ? "rotate-45" : ""}`}
                                                        strokeWidth={2.5}
                                                    />
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.div>
                                    </button>
                                );
                            }

                            /* ─── Regular tab ─── */
                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className="relative flex flex-col items-center justify-center px-3 py-1 outline-none"
                                >
                                    {/* Active pill — Liquid Glass highlight behind icon */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navActivePill"
                                            className="absolute inset-0 rounded-[18px]"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, rgba(111,0,255,0.14) 0%, rgba(139,47,255,0.08) 100%)",
                                                boxShadow:
                                                    "inset 0 0 0 0.5px rgba(111,0,255,0.18), 0 0 16px rgba(111,0,255,0.08)",
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 32,
                                                mass: 0.8,
                                            }}
                                        />
                                    )}

                                    <motion.div
                                        className="relative flex flex-col items-center gap-0.5 z-10"
                                        whileTap={{ scale: 0.82 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 25,
                                        }}
                                    >
                                        <Icon
                                            className={`w-[22px] h-[22px] transition-colors duration-300 ${
                                                isActive
                                                    ? "text-[#6F00FF] dark:text-[#A855F7]"
                                                    : "text-[#8e8a99] dark:text-[#6b6578]"
                                            }`}
                                            strokeWidth={isActive ? 2.4 : 1.7}
                                        />
                                        <span
                                            className={`text-[10px] leading-tight font-medium transition-colors duration-300 ${
                                                isActive
                                                    ? "text-[#6F00FF] dark:text-[#A855F7]"
                                                    : "text-[#8e8a99] dark:text-[#6b6578]"
                                            }`}
                                        >
                                            {tab.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </>
    );
}
