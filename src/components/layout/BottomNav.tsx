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

    // Scroll-aware auto-hide
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollThreshold = 8;

    const handleScroll = useCallback(() => {
        const scrollEl = document.querySelector("[data-scroll-container]") as HTMLElement | null;
        if (!scrollEl) return;

        const currentY = scrollEl.scrollTop;
        const delta = currentY - lastScrollY.current;

        if (delta > scrollThreshold && currentY > 60) {
            setVisible(false);
        } else if (delta < -scrollThreshold) {
            setVisible(true);
        }

        lastScrollY.current = currentY;
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

    // Get the index of the active tab for glow orb positioning
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);

    return (
        <>
            <ActionSheet
                open={actionSheetOpen}
                onClose={() => setActionSheetOpen(false)}
            />

            {/* Floating Liquid Glass dock — safe area aware */}
            <motion.nav
                className="bottom-nav-container pointer-events-none"
                style={{ y }}
            >
                <div className="liquid-glass-dock pointer-events-auto">
                    <div className="relative z-10 flex items-center justify-around h-[72px] px-4">
                        {/* Animated Glow Orb — slides behind active tab */}
                        {activeIndex >= 0 && activeIndex !== 2 && (
                            <motion.div
                                layoutId="active-pill"
                                transition={iosSpring}
                                className="absolute h-12 w-12 rounded-full z-0"
                                style={{
                                    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(139,47,255,0.08) 60%, transparent 100%)",
                                    filter: "blur(16px)",
                                    left: `calc(${(activeIndex / tabs.length) * 100}% + ${100 / tabs.length / 2}% - 24px)`,
                                }}
                            />
                        )}

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
                                                    "linear-gradient(145deg, #a78bfa 0%, #8B5CF6 50%, #7c3aed 100%)",
                                                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.45)",
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
                                    <motion.div
                                        className="relative flex flex-col items-center gap-1 z-10"
                                        whileTap={{ scale: 0.82 }}
                                        transition={iosSpring}
                                    >
                                        <Icon
                                            className={`w-[22px] h-[22px] transition-all duration-300 ${
                                                isActive
                                                    ? "text-white"
                                                    : "text-white/70"
                                            }`}
                                            strokeWidth={isActive ? 2.2 : 1.6}
                                        />
                                        <span
                                            className={`text-[11px] leading-tight tracking-tight transition-all duration-300 ${
                                                isActive
                                                    ? "text-white font-semibold"
                                                    : "text-white/70 font-medium"
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
