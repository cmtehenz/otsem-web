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

            {/* Fixed compact bottom nav */}
            <nav className="fixed z-50 left-0 right-0 bottom-0 fintech-nav-glass pwa-nav-safe-bottom">
                <div className="flex items-center justify-around h-14 max-w-[480px] mx-auto px-2">
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
                                    className="relative flex items-center justify-center outline-none"
                                >
                                    <motion.div
                                        className="flex items-center justify-center w-11 h-11 rounded-full"
                                        style={{
                                            background:
                                                "linear-gradient(145deg, #9B4DFF 0%, #6F00FF 50%, #5800CC 100%)",
                                            boxShadow: "0 4px 20px rgba(111, 0, 255, 0.4)",
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
                                                    className={`w-5 h-5 text-white ${actionSheetOpen ? "rotate-45" : ""}`}
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
                                        className={`w-[20px] h-[20px] transition-colors duration-300 ${
                                            isActive
                                                ? "text-[#8B2FFF]"
                                                : "text-white/30"
                                        }`}
                                        strokeWidth={isActive ? 2.4 : 1.7}
                                    />
                                    <span
                                        className={`text-[10px] leading-tight font-medium transition-colors duration-300 ${
                                            isActive
                                                ? "text-[#8B2FFF]"
                                                : "text-white/30"
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
        </>
    );
}
