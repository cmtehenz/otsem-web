"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuickActions() {
    return (
        <div className="rounded-2xl border border-[#000000]/10 bg-linear-to-br from-[#faffff] to-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="border-[#b852ff]/20 hover:bg-[#b852ff]/5">
                    <Link href="/admin/kyc">Gerenciar KYC</Link>
                </Button>
                <Button asChild variant="outline" className="border-[#f8bc07]/20 hover:bg-[#f8bc07]/5">
                    <Link href="/admin/pix">Chaves Pix</Link>
                </Button>
                <Button asChild variant="outline" className="border-[#00d9ff]/20 hover:bg-[#00d9ff]/5">
                    <Link href="/admin/cards">Pagamentos Cartão</Link>
                </Button>
                <Button asChild variant="outline" className="border-purple-500/20 hover:bg-purple-500/5">
                    <Link href="/admin/crypto">Crypto Payouts</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/admin/settings">Configurações</Link>
                </Button>
            </div>
        </div>
    );
}