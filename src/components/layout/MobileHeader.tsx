"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Search, Bell } from "lucide-react";

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

export function MobileHeader({ customerName, profilePhotoUrl, username }: { customerName?: string; profilePhotoUrl?: string; username?: string | null }) {
    const { user } = useAuth();
    const displayName = username ? `@${username}` : getFirstName(customerName) || getFirstName(user?.name);
    const initials = getInitials(customerName) || getInitials(user?.name);

    // Track profile photo: prefer prop, fallback to localStorage, listen for changes
    const [photoSrc, setPhotoSrc] = React.useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return getStoredPhoto();
    });

    React.useEffect(() => {
        if (profilePhotoUrl) {
            setPhotoSrc(profilePhotoUrl);
        } else {
            const stored = getStoredPhoto();
            if (stored) setPhotoSrc(stored);
        }
    }, [profilePhotoUrl]);

    React.useEffect(() => {
        function handlePhotoChange() {
            setPhotoSrc(getStoredPhoto());
        }
        // Listen for in-app photo changes
        window.addEventListener("profile-photo-changed", handlePhotoChange);
        // Re-check localStorage when app returns to foreground (iOS PWA resume)
        function handleVisibility() {
            if (document.visibilityState === "visible") {
                const stored = getStoredPhoto();
                if (stored) setPhotoSrc(stored);
            }
        }
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            window.removeEventListener("profile-photo-changed", handlePhotoChange);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
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
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <Link
                                href="/customer/settings"
                                className="flex items-center justify-center w-11 h-11 rounded-full overflow-hidden border border-white/[0.12]"
                                style={{
                                    background: "rgba(18, 20, 29, 0.45)",
                                    transition: "background 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
                                }}
                            >
                                {photoSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photoSrc}
                                        alt="Perfil"
                                        className="w-full h-full object-cover"
                                        onError={() => {
                                            const stored = getStoredPhoto();
                                            if (stored && stored !== photoSrc) {
                                                setPhotoSrc(stored);
                                            } else {
                                                setPhotoSrc(null);
                                            }
                                        }}
                                    />
                                ) : initials ? (
                                    <span className="text-[14px] font-semibold text-white">
                                        {initials}
                                    </span>
                                ) : (
                                    <User className="w-[22px] h-[22px] text-white/90" strokeWidth={1.8} />
                                )}
                            </Link>
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-white/70 leading-tight">
                                {getGreeting()}
                            </span>
                            <span className="text-[17px] font-semibold text-white leading-tight tracking-tight">
                                {displayName}
                            </span>
                        </div>
                    </div>

                    {/* Right side: search + notifications */}
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <Link
                                href="/customer/mercado"
                                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.12] active:bg-white/10 transition-colors"
                                style={{ background: "rgba(18, 20, 29, 0.45)" }}
                            >
                                <Search className="w-[18px] h-[18px] text-white/80" strokeWidth={1.8} />
                            </Link>
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                            <Link
                                href="/customer/support"
                                className="flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.12] active:bg-white/10 transition-colors"
                                style={{ background: "rgba(18, 20, 29, 0.45)" }}
                            >
                                <Bell className="w-[18px] h-[18px] text-white/80" strokeWidth={1.8} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
