"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, Plus, Download } from "lucide-react";

const STORAGE_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

type PromptPlatform = "ios" | "android" | null;

export function PwaInstallPrompt() {
    const [visible, setVisible] = React.useState(false);
    const [dontRemind, setDontRemind] = React.useState(false);
    const [platform, setPlatform] = React.useState<PromptPlatform>(null);
    const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);

    React.useEffect(() => {
        if (isStandalone()) return;
        if (localStorage.getItem(STORAGE_KEY) === "true") return;

        // ── Android / Chrome: capture beforeinstallprompt ────────────────
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            deferredPromptRef.current = e as BeforeInstallPromptEvent;
            setPlatform("android");
            setVisible(true);
        };
        window.addEventListener("beforeinstallprompt", handleBeforeInstall);

        // ── iOS Safari: show manual instructions after delay ─────────────
        if (isIosSafari()) {
            const timer = setTimeout(() => {
                // Only show iOS prompt if Android prompt hasn't fired
                if (!deferredPromptRef.current) {
                    setPlatform("ios");
                    setVisible(true);
                }
            }, 2500);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            };
        }

        // ── Dismiss if user installs via browser UI ─────────────────────
        const handleInstalled = () => {
            setVisible(false);
            deferredPromptRef.current = null;
        };
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    function dismiss() {
        setVisible(false);
        if (dontRemind) {
            localStorage.setItem(STORAGE_KEY, "true");
        }
    }

    async function handleAndroidInstall() {
        const prompt = deferredPromptRef.current;
        if (!prompt) return;

        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
            setVisible(false);
        }
        deferredPromptRef.current = null;
    }

    return (
        <AnimatePresence>
            {visible && platform && (
                <motion.div
                    className="fixed left-4 right-4 z-[55] pwa-install-prompt-bottom"
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                    <div className="relative overflow-hidden rounded-[22px] border border-white/10 shadow-2xl">
                        {/* Glass background */}
                        <div
                            className="absolute inset-0 bg-[#0d0518]/95"
                            style={{
                                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                                backdropFilter: "blur(40px) saturate(180%)",
                            }}
                        />

                        <div className="relative p-5">
                            {/* Close button */}
                            <button
                                onClick={dismiss}
                                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 active:scale-90 transition-transform"
                            >
                                <X className="w-4 h-4 text-white/60" strokeWidth={2} />
                            </button>

                            {/* Icon + title */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFD54F] to-[#FFB300] shadow-lg shadow-[#FFB300]/25">
                                    {platform === "ios" ? (
                                        <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                                    ) : (
                                        <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-white leading-tight">
                                        Instale o Otsem Pay
                                    </h3>
                                    <p className="text-[12px] text-white/60">
                                        Experiência muito melhor como app
                                    </p>
                                </div>
                            </div>

                            {/* Platform-specific content */}
                            {platform === "ios" ? (
                                /* iOS: manual instructions */
                                <div className="space-y-2.5 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007AFF]/20 shrink-0">
                                            <Share className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                                        </div>
                                        <p className="text-[13px] text-white">
                                            Toque no botão{" "}
                                            <span className="font-semibold">Compartilhar</span>
                                            {" "}na barra do Safari
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007AFF]/20 shrink-0">
                                            <Plus className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                                        </div>
                                        <p className="text-[13px] text-white">
                                            Selecione{" "}
                                            <span className="font-semibold">&ldquo;Adicionar à Tela de Início&rdquo;</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* Android: direct install button */
                                <button
                                    onClick={handleAndroidInstall}
                                    className="w-full mb-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black font-semibold text-[15px] py-3 px-4 active:scale-[0.97] transition-transform"
                                >
                                    <Download className="w-4.5 h-4.5" strokeWidth={2} />
                                    Instalar aplicativo
                                </button>
                            )}

                            {/* Don't remind toggle */}
                            <button
                                onClick={() => setDontRemind(!dontRemind)}
                                className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
                            >
                                <div
                                    className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-colors ${
                                        dontRemind
                                            ? "bg-[#6F00FF] border-[#6F00FF]"
                                            : "border-white/20"
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
                                <span className="text-[13px] text-white/60">
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
