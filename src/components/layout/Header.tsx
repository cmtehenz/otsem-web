"use client";

import TopActionsMenu from "@/components/layout/TopActionsMenu";
import UserMenu from "@/components/layout/UserMenu";

export default function Header() {
    return (
        <header className="w-full border-b bg-background px-4 py-2 flex items-center justify-between">
            {/* Esquerda → menu de ações */}
            <TopActionsMenu
                onAddPix={() => { }}
                onConvertBrlToUsdt={() => { }}
                onConvertUsdtToBrl={() => { }}
                onSendUsdt={() => { }}
                onReceiveUsdt={() => { }}
                onOpenHistory={() => { }}
                onChargeOnCard={() => { }}
                onLoadDemo={() => { }}
                onRefresh={() => { }}
            />

            {/* Direita → menu do usuário */}
            <UserMenu />
        </header>
    );
}
