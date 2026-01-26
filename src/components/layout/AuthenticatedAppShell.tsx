"use client";

import * as React from "react";
import AppHeader from "@/components/layout/AppHeader";
// iport PixModal from "@/components/modals/PixModal";
// import ConvertModal from "@/components/modals/ConvertModal";
// Se já tiver, pode adicionar também:
// import SendUsdtModal from "@/components/modals/SendUsdtModal";
// import ReceiveUsdtModal from "@/components/modals/ReceiveUsdtModal";

export default function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col">
            <AppHeader />
            <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>

            {/* 🔽 Monta os modais uma única vez na aplicação */}
            {/* <PixModal /> */}
            {/* <ConvertModal /> */}
            {/* <SendUsdtModal /> */}
            {/* <ReceiveUsdtModal /> */}
        </div>
    );
}
