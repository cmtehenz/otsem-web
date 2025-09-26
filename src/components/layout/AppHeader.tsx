"use client";
import TopActionsMenu from "@/components/TopActionsMenu";
import { useActionsMenu } from "@/contexts/actions-menu";

export function AppHeader() {
    const a = useActionsMenu();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4 py-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/10" />
                        <span className="font-semibold">Otsem Bank</span>
                    </div>
                    <div className="flex-1">
                        <TopActionsMenu
                            onAddPix={a.addPix}
                            onConvertBrlToUsdt={a.convertBrlToUsdt}
                            onConvertUsdtToBrl={a.convertUsdtToBrl}
                            onSendUsdt={a.sendUsdt}
                            onReceiveUsdt={a.receiveUsdt}
                            onOpenHistory={a.openHistory}
                            onChargeOnCard={a.chargeOnCard}
                            onLoadDemo={a.loadDemo}
                            onRefresh={a.refresh}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
