"use client";

import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

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
            className="sticky top-0 z-40 flex-shrink-0 pwa-status-bar-safe"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2.5">
                    <Link href="/customer/dashboard" className="flex items-center">
                        <Image
                            src="/images/logo.png"
                            alt="OtsemPay"
                            width={28}
                            height={28}
                            className="rounded-lg"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/50 leading-tight">
                            {getGreeting()}
                        </span>
                        <span className="text-[14px] font-semibold text-white leading-tight">
                            {displayName}
                        </span>
                    </div>
                </div>

                <Link
                    href="/customer/settings"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 active:bg-white/20 transition-colors"
                >
                    <User className="w-4 h-4 text-white/70" strokeWidth={2} />
                </Link>
            </div>
        </motion.header>
    );
}
