// src/components/layout/AppHeader.tsx
"use client";

import * as React from "react";
import Logo from "@/components/brand/Logo";
// import TopActionsMenu from "@/components/layout/TopActionsMenu";
import UserMenu from "@/components/layout/UserMenu";
// import { Button } from "@/components/ui/button";
// import {
//     DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";
// import { Menu, PlusCircle, ArrowRightLeft, Send, Download, History, CreditCard, FlaskConical, RotateCw } from "lucide-react";


const TICKER = "1 USDT ≈ R$ 5,50";

export default function AppHeader() {



    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 md:px-4">
                {/* esquerda: logo */}
                <div className="min-w-0"><Logo /></div>

                {/* centro: ticker (desktop) */}
                <div className="hidden md:flex items-center justify-center px-3 text-xs font-medium text-muted-foreground">
                    {TICKER}
                </div>

                {/* centro: ações (desktop) */}
                <div className="hidden flex-1 md:flex">
                    {/* <TopActionsMenu
                        {...actions}
                        brlAmount={balances?.brl ?? null}
                        usdtAmount={balances?.usdt ?? null}
                        // opcional: para mostrar o ticker dentro do menu USDT:
                        tickerText={TICKER}
                    /> */}
                </div>

                {/* direita: mobile actions + user */}
                <div className="flex items-center gap-2">
                    <div className="md:hidden">
                        {/* <MobileActions
                            {...actions}
                            brlAmount={balances?.brl ?? null}
                            usdtAmount={balances?.usdt ?? null}
                            tickerText={TICKER}
                        /> */}
                    </div>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

/** Menu compacto para telas pequenas (mesmas ações do TopActionsMenu) */
// function MobileActions(p: {
//     onAddPix: () => void;
//     onConvertBrlToUsdt: () => void;
//     onConvertUsdtToBrl: () => void;
//     onSendUsdt: () => void;
//     onReceiveUsdt: () => void;
//     onOpenHistory: () => void;
//     onChargeOnCard: () => void;
//     onLoadDemo: () => void;
//     onRefresh: () => void;
//     brlAmount?: number | null;
//     usdtAmount?: number | null;
//     tickerText?: string;
// }) {
//     const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
//     const usdtFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 6 });

//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="icon" className="rounded-xl" aria-label="Ações">
//                     <Menu className="h-4 w-4" />
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-60">
//                 {/* ticker estático */}
//                 <div className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">
//                     {p.tickerText ?? "1 USDT ≈ R$ 5,50"}
//                 </div>
//                 <DropdownMenuSeparator />

//                 {/* resumo de saldos */}
//                 <div className="px-2 py-1.5 text-xs text-muted-foreground">
//                     <div className="flex items-center justify-between">
//                         <span>BRL</span>
//                         <span className="font-medium">{typeof p.brlAmount === "number" ? brlFmt.format(p.brlAmount) : "—"}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                         <span>USDT</span>
//                         <span className="font-medium">
//                             {typeof p.usdtAmount === "number" ? `${usdtFmt.format(p.usdtAmount)} USDT` : "—"}
//                         </span>
//                     </div>
//                 </div>
//                 <DropdownMenuSeparator />

//                 {/* BRL */}
//                 <DropdownMenuItem onClick={p.onAddPix} className="gap-2">
//                     <PlusCircle className="h-4 w-4" /> Adicionar via Pix
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={p.onConvertBrlToUsdt} className="gap-2">
//                     <ArrowRightLeft className="h-4 w-4" /> Converter BRL → USDT
//                 </DropdownMenuItem>

//                 {/* USDT */}
//                 <DropdownMenuItem onClick={p.onSendUsdt} className="gap-2">
//                     <Send className="h-4 w-4" /> Enviar USDT
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={p.onReceiveUsdt} className="gap-2">
//                     <Download className="h-4 w-4" /> Receber USDT
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={p.onConvertUsdtToBrl} className="gap-2">
//                     <ArrowRightLeft className="h-4 w-4" /> Converter USDT → BRL
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator />

//                 {/* Outras ações */}
//                 <DropdownMenuItem onClick={p.onOpenHistory} className="gap-2">
//                     <History className="h-4 w-4" /> Histórico
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={p.onChargeOnCard} className="gap-2">
//                     <CreditCard className="h-4 w-4" /> Cobrar no Cartão
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator />

//                 <DropdownMenuItem onClick={p.onLoadDemo} className="gap-2">
//                     <FlaskConical className="h-4 w-4" /> Carregar saldo demo
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={p.onRefresh} className="gap-2">
//                     <RotateCw className="h-4 w-4" /> Atualizar
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }
