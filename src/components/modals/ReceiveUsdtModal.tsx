"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiModals } from "@/stores/ui-modals";
// opcional: npm i qrcode.react
// import { QRCode } from "react-qrcode-logo";

export default function ReceiveUsdtModal() {
    const { open, closeModal } = useUiModals();
    const address = "0xSEU_ENDERECO_USDT";

    return (
        <Dialog open={open.receiveUsdt} onOpenChange={(v) => (!v ? closeModal("receiveUsdt") : null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Receber USDT</DialogTitle>
                </DialogHeader>

                <div className="grid gap-3">
                    <div className="rounded-xl border p-3 font-mono text-xs break-all">{address}</div>
                    {/* {<QRCode value={address} size={180} />} */}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(address)}>Copiar</Button>
                    <Button onClick={() => closeModal("receiveUsdt")}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
