"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Send,
    DollarSign,
} from "lucide-react";
import { useUiModals } from "@/stores/ui-modals";

type ActionItem = {
    id: string;
    label: string;
    sublabel: string;
    icon: typeof ArrowDownLeft;
    color: string;
    iconBg: string;
};

const actions: ActionItem[] = [
    {
        id: "deposit",
        label: "Depositar",
        sublabel: "Via PIX",
        icon: ArrowDownLeft,
        color: "text-white",
        iconBg: "bg-white/10",
    },
    {
        id: "withdraw",
        label: "Transferir",
        sublabel: "PIX para qualquer banco",
        icon: ArrowUpRight,
        color: "text-white",
        iconBg: "bg-white/10",
    },
    {
        id: "convertBrlUsdt",
        label: "Comprar USDT",
        sublabel: "Converter BRL para USDT",
        icon: ArrowRightLeft,
        color: "text-white",
        iconBg: "bg-white/10",
    },
    {
        id: "sellUsdt",
        label: "Vender USDT",
        sublabel: "Converter USDT para BRL",
        icon: DollarSign,
        color: "text-white",
        iconBg: "bg-white/10",
    },
    {
        id: "sendUsdt",
        label: "Enviar USDT",
        sublabel: "Para carteira externa",
        icon: Send,
        color: "text-white",
        iconBg: "bg-white/10",
    },
];

export function ActionSheet({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { openModal } = useUiModals();

    function handleAction(id: string) {
        onClose();
        // Small delay to let the sheet close animation start
        setTimeout(() => {
            if (id === "deposit") openModal("deposit");
            else if (id === "withdraw") openModal("withdraw");
            else if (id === "convertBrlUsdt") openModal("convertBrlUsdt");
            else if (id === "sellUsdt") openModal("sellUsdt");
            else if (id === "sendUsdt") openModal("sendUsdt");
        }, 150);
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 z-[60] bg-black/40"
                        style={{
                            WebkitBackdropFilter: "blur(4px)",
                            backdropFilter: "blur(4px)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[61]"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                            mass: 0.8,
                        }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                    >
                        <div className="relative rounded-t-[28px] overflow-hidden pwa-sheet-safe-bottom">
                            {/* Glass background */}
                            <div className="absolute inset-0 bg-white/80 dark:bg-[#1a1025]/90 border-t border-white/40 dark:border-white/[0.08] backdrop-blur-[40px] saturate-[180%]" />

                            <div className="relative px-6 pt-3 pb-4">
                                {/* Drag handle */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-9 h-1 rounded-full bg-black/10 dark:bg-white/20" />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-foreground mb-1">
                                    Nova operação
                                </h3>
                                <p className="text-sm text-muted-foreground mb-5">
                                    O que você gostaria de fazer?
                                </p>

                                {/* Action items */}
                                <div className="space-y-2">
                                    {actions.map((action, index) => (
                                        <motion.button
                                            key={action.id}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/[0.04] border border-white/60 dark:border-white/[0.06] transition-transform"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 25,
                                            }}
                                            onClick={() => handleAction(action.id)}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-12 h-12 rounded-2xl ${action.iconBg}`}
                                            >
                                                <action.icon
                                                    className={`w-5 h-5 ${action.color}`}
                                                    strokeWidth={2}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[15px] font-semibold text-foreground">
                                                    {action.label}
                                                </p>
                                                <p className="text-[13px] text-muted-foreground">
                                                    {action.sublabel}
                                                </p>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
