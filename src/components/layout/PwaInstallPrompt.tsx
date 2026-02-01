"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, Plus } from "lucide-react";

const STORAGE_KEY = "pwa-install-dismissed";

function isIosSafari(): boolean {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    // Exclude Chrome, Firefox, Edge, etc. on iOS — they can't add to home screen
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    return isIos && isSafari;
}

function isStandalone(): boolean {
    if (typeof window === "undefined") return false;
    // iOS standalone check
    if ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone) return true;
    // Standard display-mode check
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    return false;
}

export function PwaInstallPrompt() {
    const [visible, setVisible] = React.useState(false);
    const [dontRemind, setDontRemind] = React.useState(false);

    React.useEffect(() => {
        // Only show on iOS Safari, not already in standalone, and not previously dismissed
        if (!isIosSafari()) return;
        if (isStandalone()) return;
        if (localStorage.getItem(STORAGE_KEY) === "true") return;

        const timer = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(timer);
    }, []);

    function dismiss() {
        setVisible(false);
        if (dontRemind) {
            localStorage.setItem(STORAGE_KEY, "true");
        }
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed left-4 right-4 z-[55]"
                    style={{ bottom: "calc(6.5rem + env(safe-area-inset-bottom, 0px))" }}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <div className="relative overflow-hidden rounded-[22px] border border-white/60 dark:border-white/[0.08] shadow-2xl">
                        {/* Glass background */}
                        <div
                            className="absolute inset-0 bg-white/90 dark:bg-[#1a1025]/95"
                            style={{
                                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                                backdropFilter: "blur(40px) saturate(180%)",
                            }}
                        />

                        <div className="relative p-5">
                            {/* Close button */}
                            <button
                                onClick={dismiss}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/5 dark:bg-white/10 active:scale-90 transition-transform"
                            >
                                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                            </button>

                            {/* Icon */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6F00FF] to-[#8B2FFF] shadow-lg shadow-[#6F00FF]/25">
                                    <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-foreground leading-tight">
                                        Instale o Otsem Pay
                                    </h3>
                                    <p className="text-[12px] text-muted-foreground">
                                        Experiência muito melhor como app
                                    </p>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="space-y-2.5 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007AFF]/10 dark:bg-[#007AFF]/20 shrink-0">
                                        <Share className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                                    </div>
                                    <p className="text-[13px] text-foreground">
                                        Toque no botão{" "}
                                        <span className="font-semibold">Compartilhar</span>
                                        {" "}na barra do Safari
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007AFF]/10 dark:bg-[#007AFF]/20 shrink-0">
                                        <Plus className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                                    </div>
                                    <p className="text-[13px] text-foreground">
                                        Selecione{" "}
                                        <span className="font-semibold">&ldquo;Adicionar à Tela de Início&rdquo;</span>
                                    </p>
                                </div>
                            </div>

                            {/* Don't remind toggle */}
                            <button
                                onClick={() => setDontRemind(!dontRemind)}
                                className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
                            >
                                <div
                                    className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-colors ${
                                        dontRemind
                                            ? "bg-[#6F00FF] border-[#6F00FF]"
                                            : "border-border dark:border-white/20"
                                    }`}
                                >
                                    {dontRemind && (
                                        <motion.svg
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M2.5 6L5 8.5L9.5 3.5"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </motion.svg>
                                    )}
                                </div>
                                <span className="text-[13px] text-muted-foreground">
                                    Não mostrar novamente
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
