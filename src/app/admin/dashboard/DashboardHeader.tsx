"use client";

import Link from "next/link";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <LayoutDashboard className="size-6 text-[#b852ff]" />
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" asChild>
                    <Link href="/admin/settings">Configurações</Link>
                </Button>
                <Button className="bg-[#b852ff] hover:bg-[#a942ee]" asChild>
                    <Link href="/admin/transactions">
                        Ver todas transações <ArrowUpRight className="ml-1 size-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}