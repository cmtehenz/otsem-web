"use client";

import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
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
            className="sticky top-0 z-40 w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            <div
                className="absolute inset-0 bg-background/80 dark:bg-background/70"
                style={{
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    backdropFilter: "blur(24px) saturate(180%)",
                }}
            />

            <div
                className="relative flex items-center justify-between px-5 h-14"
                style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                }}
            >
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
                        <span className="text-xs text-muted-foreground leading-tight">
                            {getGreeting()}
                        </span>
                        <span className="text-sm font-semibold text-foreground leading-tight">
                            {displayName}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-white/[0.06] border border-white/60 dark:border-white/[0.08] active:scale-95 transition-transform">
                        <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </motion.header>
    );
}
