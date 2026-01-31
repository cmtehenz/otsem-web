"use client";

import * as React from "react";
import { Phone, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/formatters";
import http from "@/lib/http";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PhoneStepProps {
    initialPhone?: string;
    onComplete: () => void;
}

export function PhoneStep({ initialPhone, onComplete }: PhoneStepProps) {
    const [phone, setPhone] = React.useState(initialPhone ? formatPhone(initialPhone) : "");
    const [codeSent, setCodeSent] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [countdown, setCountdown] = React.useState(0);
    const [sending, setSending] = React.useState(false);
    const [verifying, setVerifying] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    async function sendCode() {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            setError("Informe um telefone valido");
            return;
        }

        try {
            setSending(true);
            setError("");
            await http.post("/customers/me/phone/send-code", { phone: cleanPhone });
            setCodeSent(true);
            setCountdown(60);
            toast.success("Codigo enviado por SMS!");
        } catch {
            toast.error("Erro ao enviar codigo. Tente novamente.");
        } finally {
            setSending(false);
        }
    }

    async function verifyCode() {
        if (code.length !== 6) {
            setError("Informe o codigo de 6 digitos");
            return;
        }

        const cleanPhone = phone.replace(/\D/g, "");

        try {
            setVerifying(true);
            setError("");
            await http.post("/customers/me/phone/verify-code", {
                phone: cleanPhone,
                code,
            });
            toast.success("Telefone verificado!");
            onComplete();
        } catch {
            setError("Codigo invalido. Tente novamente.");
        } finally {
            setVerifying(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <Phone className="h-7 w-7 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Verificar telefone
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enviaremos um codigo por SMS para confirmar seu numero
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">
                        Numero de celular
                    </Label>
                    <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            inputMode="tel"
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            disabled={codeSent}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 pl-10 text-base"
                        />
                    </div>
                </div>

                {!codeSent ? (
                    <Button
                        onClick={sendCode}
                        disabled={sending || phone.replace(/\D/g, "").length < 10}
                        className="w-full h-12 rounded-2xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-bold text-sm"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar codigo"
                        )}
                    </Button>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-900 dark:text-white">
                                Codigo de verificacao
                            </Label>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={code}
                                    onChange={setCode}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className="h-12 w-12 text-lg rounded-xl" />
                                        <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                                        <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                                        <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                                        <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                                        <InputOTPSlot index={5} className="h-12 w-12 text-lg rounded-xl" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
                        )}

                        <Button
                            onClick={verifyCode}
                            disabled={verifying || code.length !== 6}
                            className="w-full h-12 rounded-2xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-bold text-sm"
                        >
                            {verifying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Verificar
                                    <CheckCircle2 className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={sendCode}
                            disabled={countdown > 0 || sending}
                            className="w-full text-center text-sm text-slate-500 hover:text-[#6F00FF] disabled:opacity-50 font-medium transition"
                        >
                            {countdown > 0
                                ? `Reenviar codigo em ${countdown}s`
                                : "Reenviar codigo"}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
