"use client";

import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "Boa noite";
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
}

function getFirstName(name?: string | null): string {
    if (!name) return "";
    return name.split(" ")[0];
}

export function MobileHeader({ customerName }: { customerName?: string }) {
    const { user } = useAuth();
    const displayName = getFirstName(customerName) || getFirstName(user?.name);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-40"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Liquid glass background — extends UP into status bar safe area */}
            <div className="absolute inset-0 pwa-header-glass liquid-glass-header" />

            {/* Content — padding-top accounts for safe area via CSS class */}
            <div className="relative flex items-center justify-between px-5 pwa-header-content">
                <div className="flex items-center gap-3">
                    <Link href="/customer/dashboard" className="flex items-center gap-2.5">
                        <Image
                            src="/images/logo.png"
                            alt="OtsemPay"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[11px] text-white/50 leading-tight">
                            {getGreeting()}
                        </span>
                        <span className="text-[15px] font-semibold text-white leading-tight">
                            {displayName}
                        </span>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
