"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Download,
    Send,
    DollarSign,
    UserRoundSearch,
    Receipt,
    X,
} from "lucide-react";
import { useUiModals } from "@/stores/ui-modals";
import { iconColors, type IconType } from "@/lib/icon-colors";
import { AppIcon } from "@/components/ui/app-icon";

type ActionItem = {
    id: string;
    label: string;
    sublabel: string;
    icon: typeof ArrowDownLeft;
    colorKey: IconType;
};

const actions: ActionItem[] = [
    {
        id: "deposit",
        label: "Depositar",
        sublabel: "Via PIX",
        icon: ArrowDownLeft,
        colorKey: "deposit",
    },
    {
        id: "withdraw",
        label: "Transferir",
        sublabel: "PIX para qualquer banco",
        icon: ArrowUpRight,
        colorKey: "withdraw",
    },
    {
        id: "convertBrlUsdt",
        label: "Comprar USDT",
        sublabel: "Converter BRL para USDT",
        icon: ArrowRightLeft,
        colorKey: "conversion",
    },
    {
        id: "sellUsdt",
        label: "Vender USDT",
        sublabel: "Converter USDT para BRL",
        icon: DollarSign,
        colorKey: "sell",
    },
    {
        id: "usernameTransfer",
        label: "Enviar para usuário",
        sublabel: "Transferir BRL por @username",
        icon: UserRoundSearch,
        colorKey: "transfer",
    },
    {
        id: "sendUsdt",
        label: "Enviar cripto",
        sublabel: "Para carteira externa",
        icon: Send,
        colorKey: "send",
    },
    {
        id: "receiveUsdt",
        label: "Receber cripto",
        sublabel: "Mostrar endereço e QR Code",
        icon: Download,
        colorKey: "deposit",
    },
    {
        id: "payBoleto",
        label: "Pagar Boleto",
        sublabel: "Pague boletos com crypto",
        icon: Receipt,
        colorKey: "boleto",
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
            else if (id === "usernameTransfer") openModal("usernameTransfer");
            else if (id === "sendUsdt") openModal("sendUsdt");
            else if (id === "receiveUsdt") openModal("receiveUsdt");
            else if (id === "payBoleto") openModal("payBoleto");
        }, 150);
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="fixed inset-0 z-[60] bg-black/45"
                        style={{
                            WebkitBackdropFilter: "blur(6px)",
                            backdropFilter: "blur(6px)",
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
                        <div
                            className="relative mx-3 mb-2 rounded-[30px] overflow-hidden pwa-sheet-safe-bottom border border-white/[0.14] shadow-[0_24px_52px_-18px_rgba(0,0,0,0.55)]"
                            style={{
                                background:
                                    "linear-gradient(150deg, rgba(33, 21, 50, 0.96) 0%, rgba(19, 12, 31, 0.98) 100%)",
                            }}
                        >
                            <div className="absolute -top-24 -right-16 w-44 h-44 rounded-full bg-[#6F00FF]/30 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-16 w-44 h-44 rounded-full bg-[#FFB300]/20 blur-3xl pointer-events-none" />

                            <div className="relative px-4 pt-3 pb-4">
                                {/* Drag handle */}
                                <div className="flex justify-center mb-2.5">
                                    <div className="w-10 h-1 rounded-full bg-white/20" />
                                </div>

                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-[18px] font-bold text-white mb-0.5">
                                            Nova operação
                                        </h3>
                                        <p className="text-[12px] text-white">
                                            Acesse os atalhos mais usados da sua conta.
                                        </p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.92 }}
                                        onClick={onClose}
                                        className="shrink-0 w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center active:bg-white/[0.14] transition-colors"
                                        aria-label="Fechar ações"
                                    >
                                        <AppIcon icon={X} size="sm" className="text-white" />
                                    </motion.button>
                                </div>

                                {/* Action items */}
                                <div className="grid grid-cols-2 gap-2">
                                    {actions.map((action, index) => {
                                        const colors = iconColors[action.colorKey];
                                        return (
                                            <motion.button
                                                key={action.id}
                                                className="w-full text-left rounded-2xl border border-white/[0.10] bg-white/[0.05] px-3 py-3.5 min-h-[86px] active:bg-white/[0.1] transition-colors"
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
                                                <div className="flex items-start gap-2.5">
                                                    <div
                                                        className={`flex items-center justify-center w-9 h-9 rounded-xl ${colors.bg}`}
                                                    >
                                                        <AppIcon icon={action.icon} size="md" className={colors.text} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-white leading-tight">
                                                            {action.label}
                                                        </p>
                                                        <p className="text-[11px] text-white mt-1 leading-snug">
                                                            {action.sublabel}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
