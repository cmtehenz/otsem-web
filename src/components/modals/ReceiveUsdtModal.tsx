"use client";

import * as React from "react";
import { BottomSheet, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetFooter } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
// opcional: npm i qrcode.react
// import { QRCode } from "react-qrcode-logo";

export default function ReceiveUsdtModal() {
    const { open, closeModal } = useUiModals();
    const address = "0xSEU_ENDERECO_USDT";

    return (
        <BottomSheet open={open.receiveUsdt} onOpenChange={(v) => (!v ? closeModal("receiveUsdt") : null)}>
            <BottomSheetContent>
                <BottomSheetHeader>
                    <BottomSheetTitle>Receber USDT</BottomSheetTitle>
                </BottomSheetHeader>

                <div className="grid gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white break-all">{address}</div>
                    {/* {<QRCode value={address} size={180} />} */}
                </div>

                <BottomSheetFooter className="gap-2">
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(address)} className="border-white/10 text-white hover:bg-white/10">Copiar</Button>
                    <Button onClick={() => closeModal("receiveUsdt")} className="bg-[#6F00FF] hover:bg-[#5800CC] text-white">Fechar</Button>
                </BottomSheetFooter>
            </BottomSheetContent>
        </BottomSheet>
    );
}
