"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuccessStep() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white">
                    Sua conta esta pronta!
                </h2>
                <p className="text-sm text-white/60">
                    Voce completou todas as etapas de verificacao.
                    <br />
                    Agora pode acessar todas as funcionalidades.
                </p>
            </div>

            <Button
                onClick={() => router.replace("/customer/dashboard")}
                className="w-full h-12 rounded-xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-semibold"
            >
                Acessar Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    );
}
