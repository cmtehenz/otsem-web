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

    // Lock body scroll — customer layout owns the single scroll container.
    // Prevents double-scroll on iOS Safari and in-browser mode.
    // Uses inset: 0 on body to fill the FULL viewport including the
    // home indicator safe area (viewport-fit: cover), avoiding the dark
    // strip at the bottom that appears when using height: 100dvh.
    React.useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const orig = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            bodyPosition: body.style.position,
            bodyInset: body.style.inset,
        };
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.inset = '0';
        window.scrollTo(0, 0);

        // Prevent pinch-to-zoom in iOS PWA — gesturestart fires for
        // two-finger gestures before touchmove. Blocking it prevents
        // the page from zooming out and exposing the background.
        const preventZoom = (e: Event) => e.preventDefault();
        document.addEventListener('gesturestart', preventZoom, { passive: false } as EventListenerOptions);
        document.addEventListener('gesturechange', preventZoom, { passive: false } as EventListenerOptions);

        return () => {
            html.style.overflow = orig.htmlOverflow;
            body.style.overflow = orig.bodyOverflow;
            body.style.position = orig.bodyPosition;
            body.style.inset = orig.bodyInset;
            document.removeEventListener('gesturestart', preventZoom);
            document.removeEventListener('gesturechange', preventZoom);
        };
    }, []);

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

            {/* Overscroll protection — extends 120dvh behind rubber-band bounce */}
            <div className="fintech-bg-layer" aria-hidden="true" />

            {/* Main container — fintech-bg-container sets height: 100dvh (browser) or
                calc(100dvh + safe-area-inset-bottom) (standalone PWA) via CSS.
                Background image applied directly (immune to iOS z-index bugs). */}
            <div className="flex flex-col relative fintech-bg-container overflow-hidden">
                {/* Single scroll surface — header + content scroll together.
                    No fixed/sticky header = no permanent non-scrollable zone. */}
                <div ref={scrollRef} data-scroll-container className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
                    {/* min-h wrapper ensures content always overflows the scroll
                        container by at least 1px, so iOS rubber-band bounce
                        triggers on ALL pages (not just long ones). */}
                    <div className="min-h-[calc(100%+1px)]">
                        {/* Header scrolls with content — collapses naturally on scroll */}
                        <MobileHeader customerName={customerName} />

                        <AnimatePresence mode="wait">
                            <motion.main
                                key={pathname}
                                className="px-4 page-content"
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
                                    <div className="flex items-center justify-center h-[60dvh]">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    children
                                )}
                            </motion.main>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Fixed floating dock — sits above content */}
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
            <span className="text-sm text-white/60">Carregando...</span>
        </div>
    );
}
