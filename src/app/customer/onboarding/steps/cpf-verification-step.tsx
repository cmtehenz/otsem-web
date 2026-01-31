"use client";

import * as React from "react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import http from "@/lib/http";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { CpfVerificationStatus } from "@/types/customer";

interface CpfVerificationStepProps {
    customerType: "PF" | "PJ";
    initialStatus: CpfVerificationStatus;
    onComplete: () => void;
}

export function CpfVerificationStep({
    customerType,
    initialStatus,
    onComplete,
}: CpfVerificationStepProps) {
    const [status, setStatus] = React.useState<CpfVerificationStatus>(initialStatus);
    const [triggering, setTriggering] = React.useState(false);
    const docLabel = customerType === "PF" ? "CPF" : "CNPJ";

    const triggerVerification = React.useCallback(async () => {
        try {
            setTriggering(true);
            await http.post("/customers/me/verify-cpf", {});
            setStatus("pending");
        } catch {
            toast.error(`Erro ao iniciar verificacao do ${docLabel}`);
        } finally {
            setTriggering(false);
        }
    }, [docLabel]);

    // Trigger verification if not started
    React.useEffect(() => {
        if (status === "not_started") {
            triggerVerification();
        }
    }, [status, triggerVerification]);

    // Poll for status updates
    React.useEffect(() => {
        if (status !== "pending") return;

        const interval = setInterval(async () => {
            try {
                const res = await http.get<{ status: CpfVerificationStatus; name?: string }>(
                    "/customers/me/cpf-status"
                );
                const newStatus = res.data.status;
                if (newStatus === "verified") {
                    setStatus("verified");
                    clearInterval(interval);
                    setTimeout(() => onComplete(), 2000);
                } else if (newStatus === "failed") {
                    setStatus("failed");
                    clearInterval(interval);
                }
            } catch {
                // silently retry on next interval
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [status, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <ShieldCheck className="h-7 w-7 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Verificacao de {docLabel}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Estamos validando seu {docLabel} na Receita Federal
                </p>
            </div>

            <div className="flex flex-col items-center space-y-6 py-4">
                {(status === "pending" || status === "not_started") && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6F00FF]/10"
                    >
                        <Loader2 className="h-10 w-10 text-[#6F00FF]" />
                    </motion.div>
                )}

                {status === "pending" && (
                    <div className="text-center space-y-2">
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                            Verificando...
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Isso pode levar alguns instantes. Aguarde.
                        </p>
                    </div>
                )}

                {status === "verified" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
                        >
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                        <div className="text-center space-y-2">
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                {docLabel} verificado com sucesso!
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Redirecionando...
                            </p>
                        </div>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-base font-bold text-red-600 dark:text-red-400">
                                Nao foi possivel verificar seu {docLabel}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Verifique se os dados estao corretos ou entre em contato com o suporte.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={triggerVerification}
                                disabled={triggering}
                                variant="outline"
                                className="rounded-2xl"
                            >
                                {triggering ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Tentar novamente
                            </Button>
                            <Button
                                onClick={onComplete}
                                className="rounded-2xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white"
                            >
                                Continuar mesmo assim
                            </Button>
                        </div>
                    </>
                )}

                {status === "pending" && (
                    <Button
                        onClick={onComplete}
                        variant="ghost"
                        className="text-sm text-slate-500 hover:text-[#6F00FF]"
                    >
                        Pular e continuar
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
