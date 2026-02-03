"use client";

import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { User, Bell } from "lucide-react";

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
            className="sticky top-0 z-40 flex-shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Premium safe area container — gradient flows through, pt handles notch + 2rem */}
            <div className="pwa-header-premium">
                <div className="flex items-center justify-between px-5">
                    <div className="flex items-center gap-3.5">
                        <Link href="/customer/dashboard" className="flex items-center">
                            <Image
                                src="/images/logo.png"
                                alt="OtsemPay"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-[17px] font-semibold text-white/60 leading-tight">
                                {getGreeting()}
                            </span>
                            <span className="text-[22px] font-bold text-white leading-tight tracking-tight">
                                {displayName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <motion.button
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.08] active:bg-white/15 transition-colors relative"
                            style={{ transition: "background 0.25s cubic-bezier(0.32, 0.72, 0, 1)" }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            aria-label="Notificações"
                        >
                            <Bell className="w-[20px] h-[20px] text-white/50" strokeWidth={1.8} />
                        </motion.button>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <Link
                                href="/customer/settings"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.08] active:bg-white/15 transition-colors"
                                style={{ transition: "background 0.25s cubic-bezier(0.32, 0.72, 0, 1)" }}
                            >
                                <User className="w-[20px] h-[20px] text-white/50" strokeWidth={1.8} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
