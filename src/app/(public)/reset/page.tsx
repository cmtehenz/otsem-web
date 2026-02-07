// src/app/(public)/reset/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import http from "@/lib/http";

const schema = z
    .object({
        password: z.string().min(8, "Mínimo de 8 caracteres"),
        confirm: z.string().min(1, "Confirme a senha"),
    })
    .refine((v) => v.password === v.confirm, {
        message: "As senhas não conferem",
        path: ["confirm"],
    });

type FormValues = z.infer<typeof schema>;
const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

export default function ResetPage(): React.JSX.Element {
    return (
        <Suspense
            fallback={
                <div className="min-h-dvh grid place-items-center text-sm text-white/50" style={{ background: 'linear-gradient(180deg, #0a1352 0%, #0d1a5a 25%, #091040 50%, #060a28 75%, #030614 100%)' }}>
                    Carregando...
                </div>
            }
        >
            <ResetInner />
        </Suspense>
    );
}

function ResetInner(): React.JSX.Element {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver });

    const [showPw, setShowPw] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    if (!token) {
        return (
            <div className="min-h-dvh grid place-items-center px-4" style={{ background: 'linear-gradient(180deg, #0a1352 0%, #0d1a5a 25%, #091040 50%, #060a28 75%, #030614 100%)' }}>
                <div className="fintech-glass-card rounded-[2rem] p-8 max-w-sm w-full text-center space-y-4">
                    <h2 className="text-lg font-semibold text-white">Link inválido</h2>
                    <p className="text-sm text-white/60">
                        O link de redefinição é inválido ou já expirou.
                    </p>
                    <Link
                        href="/forgot"
                        className="inline-block text-sm font-bold text-[#9B4DFF] hover:underline"
                    >
                        Solicitar novo link
                    </Link>
                </div>
            </div>
        );
    }

    async function onSubmit(v: FormValues): Promise<void> {
        try {
            await http.post("/auth/reset", {
                token,
                newPassword: v.password,
            });
            toast.success("Senha redefinida! Faça login com a nova senha.");
            router.push("/login");
        } catch (e: unknown) {
            if (e && typeof e === "object" && "response" in e) {
                const axiosErr = e as { response?: { status?: number }; message?: string };
                const status = axiosErr.response?.status ?? 0;
                if (status === 400) {
                    toast.error("Token inválido ou expirado.");
                } else {
                    toast.error(axiosErr.message ?? "Falha ao redefinir senha");
                }
            } else if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Falha ao redefinir senha.");
            }
        }
    }

    return (
        <div className="min-h-dvh" style={{ background: 'linear-gradient(180deg, #0a1352 0%, #0d1a5a 25%, #091040 50%, #060a28 75%, #030614 100%)' }}>
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="fintech-glass-card rounded-[2rem] overflow-hidden">
                        <div className="p-6 space-y-1 border-b border-white/[0.08]">
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push("/login")}
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white/70 hover:text-white transition-colors"
                                    aria-label="Voltar"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </motion.button>
                                <h1 className="text-xl font-semibold text-white">Nova senha</h1>
                            </div>
                            <p className="px-2 text-sm text-white/60">
                                Escolha uma nova senha para sua conta.
                            </p>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-bold text-white">
                                        Nova senha
                                    </Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                        <Input
                                            id="password"
                                            type={showPw ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Mínimo 8 caracteres"
                                            className="h-12 rounded-2xl border-white/15 bg-white/10 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-[#8B2FFF] focus:ring-2 focus:ring-[#8B2FFF]/20"
                                            aria-invalid={!!errors.password || undefined}
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                                        >
                                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm" className="text-sm font-bold text-white">
                                        Confirmar senha
                                    </Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                        <Input
                                            id="confirm"
                                            type={showConfirm ? "text" : "password"}
                                            autoComplete="new-password"
                                            placeholder="Repita a senha"
                                            className="h-12 rounded-2xl border-white/15 bg-white/10 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-[#8B2FFF] focus:ring-2 focus:ring-[#8B2FFF]/20"
                                            aria-invalid={!!errors.confirm || undefined}
                                            {...register("confirm")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirm && (
                                        <p className="mt-1 text-xs text-rose-400">{errors.confirm.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-2xl bg-[#6F00FF] hover:bg-[#5800CC] text-white font-bold"
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? "Redefinindo…" : "Redefinir senha"}
                                </Button>

                                <p className="text-center text-sm text-white/60">
                                    Lembrou a senha?{" "}
                                    <Link href="/login" className="font-bold text-[#9B4DFF] hover:underline">
                                        Entrar
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
