"use client";

import * as React from "react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, ArrowRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import http from "@/lib/http";
import type { CustomerResponse, CpfVerificationStatus } from "@/types/customer";

interface CpfVerificationStepProps {
    customer: CustomerResponse | null;
    onComplete: () => void;
    onSkip: () => void;
}

export function CpfVerificationStep({ customer, onComplete, onSkip }: CpfVerificationStepProps) {
    const [status, setStatus] = React.useState<CpfVerificationStatus>(
        customer?.cpfVerificationStatus ?? "not_started"
    );
    const [starting, setStarting] = React.useState(false);

    const startVerification = React.useCallback(async () => {
        try {
            setStarting(true);
            await http.post("/customers/me/verify-cpf");
            setStatus("pending");
        } catch {
            toast.error("Erro ao iniciar verificacao. Tente novamente.");
        } finally {
            setStarting(false);
        }
    }, []);

    // Auto-start verification if not_started
    React.useEffect(() => {
        if (status === "not_started") {
            startVerification();
        }
    }, [status, startVerification]);

    // Poll for status updates while pending
    React.useEffect(() => {
        if (status !== "pending") return;

        const interval = setInterval(async () => {
            try {
                const res = await http.get<{ cpfVerificationStatus: CpfVerificationStatus } | { data: { cpfVerificationStatus: CpfVerificationStatus } }>("/customers/me/cpf-status");
                const data = "data" in res.data && (res.data as { data?: { cpfVerificationStatus: CpfVerificationStatus } }).data
                    ? (res.data as { data: { cpfVerificationStatus: CpfVerificationStatus } }).data
                    : res.data as { cpfVerificationStatus: CpfVerificationStatus };

                if (data.cpfVerificationStatus === "verified") {
                    setStatus("verified");
                    clearInterval(interval);
                } else if (data.cpfVerificationStatus === "failed") {
                    setStatus("failed");
                    clearInterval(interval);
                }
            } catch {
                // polling error, continue
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [status]);

    React.useEffect(() => {
        if (status === "verified") {
            onComplete();
        }
    }, [status, onComplete]);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <ShieldCheck className="h-6 w-6 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                    Verificacao de CPF
                </h2>
                <p className="text-sm text-white/60">
                    Estamos validando seu CPF junto a Receita Federal.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-6">
                {(status === "pending" || status === "not_started") && (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-[#6F00FF]" />
                        <p className="text-sm text-white/60 text-center">
                            Verificando seus dados...
                            <br />
                            Isso pode levar alguns instantes.
                        </p>
                    </>
                )}

                {status === "verified" && (
                    <>
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        <p className="text-sm font-semibold text-emerald-600">
                            CPF verificado com sucesso!
                        </p>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <XCircle className="h-10 w-10 text-red-500" />
                        <p className="text-sm text-red-600 text-center">
                            Nao foi possivel verificar seu CPF.
                            <br />
                            Verifique se seus dados estao corretos.
                        </p>
                        <Button
                            onClick={startVerification}
                            disabled={starting}
                            variant="outline"
                            className="rounded-xl"
                        >
                            {starting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RotateCw className="h-4 w-4 mr-2" />
                            )}
                            Tentar novamente
                        </Button>
                    </>
                )}
            </div>

            {status === "pending" && (
                <Button
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full rounded-xl text-white/60"
                >
                    Continuar mesmo assim
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            )}
        </div>
    );
}
