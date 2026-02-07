"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
    Home,
    Wallet,
    Plus,
    ArrowLeftRight,
    User,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ActionSheet } from "./ActionSheet";

const iosSpring = {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
    mass: 1,
};

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

    // Scroll-aware auto-hide (rAF-throttled)
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollThreshold = 8;
    const ticking = useRef(false);

    const handleScroll = useCallback(() => {
        if (ticking.current) return;
        ticking.current = true;
        requestAnimationFrame(() => {
            const scrollEl = document.querySelector("[data-scroll-container]") as HTMLElement | null;
            if (scrollEl) {
                const currentY = scrollEl.scrollTop;
                const delta = currentY - lastScrollY.current;

                if (delta > scrollThreshold && currentY > 60) {
                    setVisible(false);
                } else if (delta < -scrollThreshold) {
                    setVisible(true);
                }

                lastScrollY.current = currentY;
            }
            ticking.current = false;
        });
    }, []);

    useEffect(() => {
        const scrollEl = document.querySelector("[data-scroll-container]") as HTMLElement | null;
        if (!scrollEl) return;

        scrollEl.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Always show when action sheet is open
    useEffect(() => {
        if (actionSheetOpen) setVisible(true);
    }, [actionSheetOpen]);

    // Spring-animated translateY
    const yTarget = useMotionValue(visible ? 0 : 1);
    const ySmooth = useSpring(yTarget, { stiffness: 400, damping: 35, mass: 0.8 });
    const y = useTransform(ySmooth, [0, 1], [0, 140]);

    useEffect(() => {
        yTarget.set(visible ? 0 : 1);
    }, [visible, yTarget]);

    return (
        <>
            <ActionSheet
                open={actionSheetOpen}
                onClose={() => setActionSheetOpen(false)}
            />

            {/* Floating Liquid Glass dock */}
            <motion.nav
                className="bottom-nav-container pointer-events-none"
                style={{ y }}
            >
                <div className="metaball-glass-dock pointer-events-auto">
                    {/* Tab icons layer */}
                    <div className="relative z-10 flex items-center justify-around h-[68px] px-3">
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
                                            className="flex items-center justify-center w-12 h-12 rounded-full"
                                            style={{
                                                background:
                                                    "linear-gradient(145deg, #9B4DFF 0%, #6F00FF 50%, #5800CC 100%)",
                                                boxShadow: "0 4px 20px rgba(111, 0, 255, 0.45)",
                                            }}
                                            whileTap={{ scale: 0.88 }}
                                            transition={iosSpring}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={actionSheetOpen ? "close" : "open"}
                                                    initial={{ rotate: actionSheetOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                    exit={{ rotate: actionSheetOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                                                    transition={iosSpring}
                                                >
                                                    <Plus
                                                        className={`w-5.5 h-5.5 text-white ${actionSheetOpen ? "rotate-45" : ""}`}
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
                                    className="relative flex flex-col items-center justify-center flex-1 py-1 outline-none"
                                >
                                    {/* Active glow indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active-glow"
                                            className="absolute -top-0.5 w-8 h-0.5 rounded-full"
                                            style={{
                                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <motion.div
                                        className="relative flex flex-col items-center gap-1 z-10"
                                        whileTap={{ scale: 0.82 }}
                                        transition={iosSpring}
                                    >
                                        <Icon
                                            className={`w-[22px] h-[22px] transition-all duration-300 ${
                                                isActive ? "text-white" : "text-white/70"
                                            }`}
                                            strokeWidth={isActive ? 2.2 : 1.6}
                                        />
                                        <span
                                            className={`text-[10px] leading-tight tracking-tight transition-all duration-300 ${
                                                isActive ? "font-semibold text-white" : "font-medium text-white/70"
                                            }`}
                                        >
                                            {tab.label}
                                        </span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>
        </>
    );
}
