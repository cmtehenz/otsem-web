"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function SuccessStep() {
    const router = useRouter();

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace("/customer/dashboard");
        }, 5000);
        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 py-8"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
                >
                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        Sua conta esta pronta!
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Seu cadastro foi concluido com sucesso. Voce ja pode acessar o dashboard e comecar a operar.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Button
                    onClick={() => router.replace("/customer/dashboard")}
                    className="w-full h-12 rounded-2xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-bold text-sm"
                >
                    Acessar Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>

            <p className="text-center text-xs text-slate-400">
                Voce sera redirecionado automaticamente...
            </p>
        </motion.div>
    );
}
