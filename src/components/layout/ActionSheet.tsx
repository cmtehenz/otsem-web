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
    iconBg: string;
    iconColor: string;
};

const actions: ActionItem[] = [
    {
        id: "deposit",
        label: "Depositar",
        sublabel: "Via PIX",
        icon: ArrowDownLeft,
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-500",
    },
    {
        id: "withdraw",
        label: "Transferir",
        sublabel: "PIX para qualquer banco",
        icon: ArrowUpRight,
        iconBg: "bg-blue-500/15",
        iconColor: "text-blue-500",
    },
    {
        id: "convertBrlUsdt",
        label: "Comprar USDT",
        sublabel: "Converter BRL para USDT",
        icon: ArrowRightLeft,
        iconBg: "bg-[#6F00FF]/15",
        iconColor: "text-[#6F00FF]",
    },
    {
        id: "sellUsdt",
        label: "Vender USDT",
        sublabel: "Converter USDT para BRL",
        icon: DollarSign,
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-500",
    },
    {
        id: "sendUsdt",
        label: "Enviar USDT",
        sublabel: "Para carteira externa",
        icon: Send,
        iconBg: "bg-sky-500/15",
        iconColor: "text-sky-500",
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
                            <div className="absolute inset-0 bg-[#1a1025]/95 border-t border-white/[0.08] backdrop-blur-[40px] saturate-[180%]" />

                            <div className="relative px-5 pt-3 pb-4">
                                {/* Drag handle */}
                                <div className="flex justify-center mb-3">
                                    <div className="w-9 h-1 rounded-full bg-white/20" />
                                </div>

                                {/* Title */}
                                <h3 className="text-[17px] font-bold text-white mb-0.5">
                                    Nova operação
                                </h3>
                                <p className="text-[13px] text-white/50 mb-4">
                                    O que você gostaria de fazer?
                                </p>

                                {/* Action items */}
                                <div className="space-y-1">
                                    {actions.map((action, index) => (
                                        <motion.button
                                            key={action.id}
                                            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl active:bg-white/[0.06] transition-colors"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{
                                                delay: index * 0.04,
                                                type: "spring",
                                                stiffness: 500,
                                                damping: 25,
                                            }}
                                            onClick={() => handleAction(action.id)}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-10 h-10 rounded-xl ${action.iconBg}`}
                                            >
                                                <action.icon
                                                    className={`w-[18px] h-[18px] ${action.iconColor}`}
                                                    strokeWidth={2}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[15px] font-semibold text-white">
                                                    {action.label}
                                                </p>
                                                <p className="text-[12px] text-white/50">
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
