"use client";

import * as React from "react";
import { Phone, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import http from "@/lib/http";
import { formatPhone } from "@/lib/formatters";
import type { CustomerResponse } from "@/types/customer";

interface PhoneStepProps {
    customer: CustomerResponse | null;
    onComplete: () => void;
}

export function PhoneStep({ customer, onComplete }: PhoneStepProps) {
    const [phone, setPhone] = React.useState(customer?.phone ?? "");
    const [codeSent, setCodeSent] = React.useState(false);
    const [code, setCode] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [verifying, setVerifying] = React.useState(false);
    const [countdown, setCountdown] = React.useState(0);

    React.useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const cleanPhone = phone.replace(/\D/g, "");
    const phoneValid = cleanPhone.length === 11;

    async function sendCode() {
        if (!phoneValid) {
            toast.error("Informe um telefone valido com DDD.");
            return;
        }
        try {
            setSending(true);
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
            toast.error("Informe o codigo de 6 digitos.");
            return;
        }
        try {
            setVerifying(true);
            await http.post("/customers/me/phone/verify-code", {
                phone: cleanPhone,
                code,
            });
            toast.success("Telefone verificado!");
            onComplete();
        } catch {
            toast.error("Codigo invalido. Tente novamente.");
        } finally {
            setVerifying(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <Phone className="h-6 w-6 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                    Verifique seu telefone
                </h2>
                <p className="text-sm text-white">
                    Enviaremos um codigo SMS para confirmar seu numero.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                        Telefone
                    </Label>
                    <Input
                        id="phone"
                        inputMode="numeric"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        disabled={codeSent}
                        className="h-12 rounded-xl"
                    />
                </div>

                {!codeSent ? (
                    <Button
                        onClick={sendCode}
                        disabled={!phoneValid || sending}
                        className="w-full h-12 rounded-xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-semibold"
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Enviar codigo
                    </Button>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Codigo de verificacao
                            </Label>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={code}
                                    onChange={setCode}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>

                        <Button
                            onClick={verifyCode}
                            disabled={code.length !== 6 || verifying}
                            className="w-full h-12 rounded-xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-semibold"
                        >
                            {verifying ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Verificar
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={sendCode}
                                disabled={countdown > 0 || sending}
                                className="text-sm text-white hover:text-white disabled:opacity-50 transition"
                            >
                                {countdown > 0
                                    ? `Reenviar em ${countdown}s`
                                    : "Reenviar codigo"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
