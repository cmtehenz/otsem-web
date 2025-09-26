"use client";
import * as React from "react";
import {
    Menubar, MenubarMenu, MenubarTrigger, MenubarContent,
    MenubarItem, MenubarSeparator
} from "@/components/ui/menubar";
import {
    PlusCircle, ArrowRightLeft, Send, Download,
    History, CreditCard, Wallet, DollarSign
} from "lucide-react";

type Props = {
    onAddPix: () => void;
    onConvertBrlToUsdt: () => void;
    onConvertUsdtToBrl: () => void;
    onSendUsdt: () => void;
    onReceiveUsdt: () => void;
    onOpenHistory: () => void;
    onChargeOnCard: () => void;
    onLoadDemo: () => void;
    onRefresh: () => void;
};

export default function TopActionsMenu(p: Props) {
    return (
        <div className="w-full flex items-center gap-3">
            <Menubar className="flex-1 rounded-2xl">
                <MenubarMenu>
                    <MenubarTrigger className="gap-2">
                        <Wallet className="h-4 w-4" /> BRL
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onAddPix} className="gap-2">
                            <PlusCircle className="h-4 w-4" /> Adicionar via Pix
                        </MenubarItem>
                        <MenubarItem onClick={p.onConvertBrlToUsdt} className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Converter BRL → USDT
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                    <MenubarTrigger className="gap-2">
                        <DollarSign className="h-4 w-4" /> USDT
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onSendUsdt} className="gap-2">
                            <Send className="h-4 w-4" /> Enviar USDT
                        </MenubarItem>
                        <MenubarItem onClick={p.onReceiveUsdt} className="gap-2">
                            <Download className="h-4 w-4" /> Receber USDT
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={p.onConvertUsdtToBrl} className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Converter USDT → BRL
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>

                <MenubarMenu>
                    <MenubarTrigger className="gap-2">Ações</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onOpenHistory} className="gap-2">
                            <History className="h-4 w-4" /> Histórico
                        </MenubarItem>
                        <MenubarItem onClick={p.onChargeOnCard} className="gap-2">
                            <CreditCard className="h-4 w-4" /> Cobrar no Cartão (lojista)
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>

        </div>
    );
}
