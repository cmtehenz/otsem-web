"use client";
import * as React from "react";
import {
    Menubar, MenubarMenu, MenubarTrigger, MenubarContent,
    MenubarItem, MenubarSeparator, MenubarShortcut
} from "@/components/ui/menubar";
import {
    PlusCircle, ArrowRightLeft, Send, Download,
    History, CreditCard, Wallet, DollarSign, RotateCw, FlaskConical
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
    // Atalhos globais simples (ignora quando digitando em inputs/textareas)
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement | null;
            const isTyping =
                t &&
                (t.tagName === "INPUT" ||
                    t.tagName === "TEXTAREA" ||
                    (t as HTMLElement).isContentEditable);
            if (isTyping) return;

            // mapa de atalhos
            const k = e.key.toLowerCase();
            // BRL
            if (k === "p") { e.preventDefault(); p.onAddPix(); }
            if (k === "c") { e.preventDefault(); p.onConvertBrlToUsdt(); }
            // USDT
            if (k === "e") { e.preventDefault(); p.onSendUsdt(); }
            if (k === "r") { e.preventDefault(); p.onReceiveUsdt(); }
            if (k === "u") { e.preventDefault(); p.onConvertUsdtToBrl(); } // U de USDT→BRL
            // ações
            if (k === "h") { e.preventDefault(); p.onOpenHistory(); }
            if (k === "l") { e.preventDefault(); p.onChargeOnCard(); } // L de Loja/Cartão
            if (k === "d") { e.preventDefault(); p.onLoadDemo(); }     // D de Demo
            if (k === "R") { /* uppercase quando Shift+R */ }
            if (k === "r" && e.shiftKey) { e.preventDefault(); p.onRefresh(); } // Shift+R evita conflito com refresh do navegador
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [p]);

    return (
        <div className="w-full flex items-center gap-3">
            <Menubar className="flex-1 rounded-2xl">
                {/* BRL */}
                <MenubarMenu>
                    <MenubarTrigger className="gap-2" aria-label="Ações de BRL">
                        <Wallet className="h-4 w-4" /> BRL
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onAddPix} className="gap-2">
                            <PlusCircle className="h-4 w-4" /> Adicionar via Pix
                            <MenubarShortcut>P</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={p.onConvertBrlToUsdt} className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Converter BRL → USDT
                            <MenubarShortcut>C</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>

                {/* USDT */}
                <MenubarMenu>
                    <MenubarTrigger className="gap-2" aria-label="Ações de USDT">
                        <DollarSign className="h-4 w-4" /> USDT
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onSendUsdt} className="gap-2">
                            <Send className="h-4 w-4" /> Enviar USDT
                            <MenubarShortcut>E</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={p.onReceiveUsdt} className="gap-2">
                            <Download className="h-4 w-4" /> Receber USDT
                            <MenubarShortcut>R</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={p.onConvertUsdtToBrl} className="gap-2">
                            <ArrowRightLeft className="h-4 w-4" /> Converter USDT → BRL
                            <MenubarShortcut>U</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>

                {/* Ações */}
                <MenubarMenu>
                    <MenubarTrigger className="gap-2" aria-label="Outras ações">
                        Ações
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={p.onOpenHistory} className="gap-2">
                            <History className="h-4 w-4" /> Histórico
                            <MenubarShortcut>H</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={p.onChargeOnCard} className="gap-2">
                            <CreditCard className="h-4 w-4" /> Cobrar no Cartão (lojista)
                            <MenubarShortcut>L</MenubarShortcut>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={p.onLoadDemo} className="gap-2">
                            <FlaskConical className="h-4 w-4" /> Carregar saldo demo
                            <MenubarShortcut>D</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onClick={p.onRefresh} className="gap-2">
                            <RotateCw className="h-4 w-4" /> Atualizar
                            <MenubarShortcut>Shift+R</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    );
}
