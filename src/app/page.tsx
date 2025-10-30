"use client";

import Link from "next/link";
import { Landmark, CreditCard, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao OtsemBank</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Escolha uma das opções abaixo para começar a usar o app.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <Link href="/login">
          <Button variant="default" className="gap-2">
            <Landmark className="size-5" /> Ir para Dashboard
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" className="gap-2">
            <Landmark className="size-5" /> Adicionar via Pix
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" className="gap-2">
            <ArrowUpRight className="size-5" /> Novo Payout
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="gap-2">
            <CreditCard className="size-5" /> Cobrança no Cartão
          </Button>
        </Link>
      </div>
    </main>
  );
}
