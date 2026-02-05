"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { User, Bell } from "lucide-react";

const PHOTO_KEY = "otsem_profile_photo";

function getStoredPhoto(): string | null {
    try {
        return localStorage.getItem(PHOTO_KEY);
    } catch {
        return null;
    }
}

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

function getInitials(name?: string | null): string {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MobileHeader({ customerName, profilePhotoUrl }: { customerName?: string; profilePhotoUrl?: string }) {
    const { user } = useAuth();
    const displayName = getFirstName(customerName) || getFirstName(user?.name);
    const initials = getInitials(customerName) || getInitials(user?.name);

    // Track profile photo: prefer prop, fallback to localStorage, listen for changes
    const [photoSrc, setPhotoSrc] = React.useState<string | null>(null);

    React.useEffect(() => {
        setPhotoSrc(profilePhotoUrl || getStoredPhoto());
    }, [profilePhotoUrl]);

    React.useEffect(() => {
        function handlePhotoChange() {
            setPhotoSrc(getStoredPhoto());
        }
        window.addEventListener("profile-photo-changed", handlePhotoChange);
        return () => window.removeEventListener("profile-photo-changed", handlePhotoChange);
    }, []);

    return (
        <motion.header
            className="relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Safe area container — gradient flows through, pt handles notch */}
            <div className="pwa-header-premium">
                <div className="flex items-center justify-between px-5">
                    {/* Left side: profile photo + greeting */}
                    <div className="flex items-center gap-3.5">
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <Link
                                href="/customer/settings"
                                className="flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.08] border border-white/[0.08] active:bg-white/15 transition-colors overflow-hidden"
                                style={{ transition: "background 0.25s cubic-bezier(0.32, 0.72, 0, 1)" }}
                            >
                                {photoSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photoSrc}
                                        alt="Perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : initials ? (
                                    <span className="text-[14px] font-semibold text-white/90">
                                        {initials}
                                    </span>
                                ) : (
                                    <User className="w-[22px] h-[22px] text-white/90" strokeWidth={1.8} />
                                )}
                            </Link>
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-[17px] font-semibold text-white leading-tight">
                                {getGreeting()}
                            </span>
                            <span className="text-[22px] font-bold text-white leading-tight tracking-tight">
                                {displayName}
                            </span>
                        </div>
                    </div>

                    {/* Right side: bell + logo */}
                    <div className="flex items-center gap-2.5">
                        <motion.button
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.08] active:bg-white/15 transition-colors relative"
                            style={{ transition: "background 0.25s cubic-bezier(0.32, 0.72, 0, 1)" }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            aria-label="Notificações"
                        >
                            <Bell className="w-[20px] h-[20px] text-white/90" strokeWidth={1.8} />
                        </motion.button>
                        <Link href="/customer/dashboard" className="flex items-center">
                            <Image
                                src="/images/logo.png"
                                alt="OtsemPay"
                                width={44}
                                height={44}
                                className="object-contain"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
