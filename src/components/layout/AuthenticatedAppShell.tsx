"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { ActionsMenuProvider, Actions } from "@/contexts/actions-menu";
import { useUiModals } from "@/stores/ui-modals";
import PixModal from "@/components/modals/PixModal";
import ConvertModal from "@/components/modals/ConvertModal";
import ReceiveUsdtModal from "@/components/modals/ReceiveUsdtModal";

export default function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { openModal } = useUiModals(); // hook client

    const actions = React.useMemo<Actions>(() => ({
        addPix: () => openModal("pix"),
        convertBrlToUsdt: () => openModal("convertBrlUsdt"),
        convertUsdtToBrl: () => openModal("convertUsdtBrl"),
        sendUsdt: () => router.push("/send"),
        receiveUsdt: () => openModal("receiveUsdt"),
        openHistory: () => router.push("/history"),
        chargeOnCard: () => router.push("/merchant/charge"),
        loadDemo: () => {
            // exemplo: sem bloquear UI
            void fetch("/api/demo/seed", { method: "POST" }).then(() => router.refresh());
        },
        refresh: () => router.refresh(),
    }), [openModal, router]);

    return (
        <ActionsMenuProvider value={actions}>
            <div className="min-h-dvh flex flex-col">
                <AppHeader />
                <main className="flex-1">
                    <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
                </main>
            </div>

            {/* Portais globais */}
            <PixModal />
            <ConvertModal />
            <ReceiveUsdtModal />
        </ActionsMenuProvider>
    );
}
