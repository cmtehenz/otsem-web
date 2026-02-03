"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/auth-context";
import { Protected } from "@/components/auth/Protected";
import http from "@/lib/http";
import type { CustomerResponse } from "@/types/customer";

import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { DepositModal } from "@/components/modals/deposit-modal";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { SellUsdtModal } from "@/components/modals/sell-usdt-modal";
import SendUsdtModal from "@/components/modals/send-usdt-modal";
import { useUiModals } from "@/stores/ui-modals";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { open, closeModal, triggerRefresh } = useUiModals();
    const [onboardingCompleted, setOnboardingCompleted] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [customerName, setCustomerName] = React.useState<string | undefined>();
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Reset scroll position on page navigation
    React.useEffect(() => {
        scrollRef.current?.scrollTo(0, 0);
    }, [pathname]);

    React.useEffect(() => {
        async function loadData() {
            try {
                const [customerRes] = await Promise.all([
                    http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me"),
                ]);
                const customer = "data" in customerRes.data && customerRes.data.data ? customerRes.data.data : customerRes.data;
                const c = customer as CustomerResponse;
                setOnboardingCompleted(c.onboardingCompleted ?? true);
                setCustomerName(c.name);
            } catch (err) {
                console.error("Erro ao buscar dados do cliente:", err);
                setOnboardingCompleted(true);
            }
            setLoading(false);
        }

        if (user) {
            loadData();
        }
    }, [user]);

    // Redirect to onboarding if not completed
    React.useEffect(() => {
        if (loading || onboardingCompleted === null) return;
        if (
            onboardingCompleted === false &&
            !pathname?.startsWith("/customer/onboarding") &&
            pathname !== "/customer/logout"
        ) {
            router.replace("/customer/onboarding");
        }
    }, [loading, onboardingCompleted, pathname, router]);

    // Render clean layout (no nav) for onboarding page
    if (pathname?.startsWith("/customer/onboarding")) {
        return (
            <Protected>
                {loading ? (
                    <div className="flex min-h-dvh items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    children
                )}
            </Protected>
        );
    }

    return (
        <Protected>
            {/* Global modals */}
            <DepositModal />
            <WithdrawModal />
            <SendUsdtModal />
            <SellUsdtModal
                open={open.sellUsdt}
                onClose={() => closeModal("sellUsdt")}
                onSuccess={triggerRefresh}
            />

            <div className="flex flex-col min-h-dvh h-dvh fintech-bg">
                {/* Fixed 120dvh gradient — eliminates black gap on iOS bounce */}
                <div className="fintech-bg-layer" aria-hidden="true" />

                {/* Sticky minimal status bar */}
                <MobileHeader customerName={customerName} />

                {/* Single scroll surface — everything scrolls as one unit */}
                <div ref={scrollRef} data-scroll-container className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pwa-dock-safe-bottom">
                    <AnimatePresence mode="wait">
                        <motion.main
                            key={pathname}
                            className="px-4 pb-28"
                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 30,
                                mass: 0.8,
                            }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center h-[60vh]">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                children
                            )}
                        </motion.main>
                    </AnimatePresence>
                </div>

                {/* Fixed bottom nav — floats above content */}
                <BottomNav />
                <PwaInstallPrompt />
            </div>
        </Protected>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-[#6F00FF]/30 rounded-full blur-xl animate-pulse" />
                <motion.div
                    className="relative w-10 h-10 rounded-full border-2 border-[#6F00FF]/20 border-t-[#6F00FF]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
    );
}
