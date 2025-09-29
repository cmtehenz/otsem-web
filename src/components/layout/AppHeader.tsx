"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import TopActionsMenu from "@/components/layout/TopActionsMenu";
import UserMenu from "@/components/layout/UserMenu";
import { useUiModals } from "@/stores/ui-modals";
import { apiPost } from "@/lib/api";

export default function AppHeader() {
    const router = useRouter();
    const { openModal } = useUiModals();

    const actions = React.useMemo(
        () => ({
            onAddPix: () => openModal("pix"),
            onConvertBrlToUsdt: () => openModal("convertBrlUsdt"),
            onConvertUsdtToBrl: () => openModal("convertUsdtBrl"),
            onSendUsdt: () => openModal("sendUsdt"),       // certifique-se de ter esse modal/flag
            onReceiveUsdt: () => openModal("receiveUsdt"), // idem
            onOpenHistory: () => router.push("/history"),
            onChargeOnCard: () => router.push("/merchant/charge"),
            onLoadDemo: async () => {
                try {
                    await apiPost("/demo/fund", { addBRL: 500, addUSDT: 100 });
                } catch (e) {
                    // opcional: toast
                    console.error(e);
                }
            },
            onRefresh: () => router.refresh(),
        }),
        [openModal, router]
    );

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3">
                {/* esquerda: ações rápidas */}
                <div className="flex-1">
                    <TopActionsMenu {...actions} />
                </div>

                {/* direita: menu do usuário */}
                <div className="flex items-center gap-3">
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
