// src/app/(public)/reset/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { apiPost } from "@/lib/api"; // ❌ não usamos mais
import http from "@/lib/http"; // ✅ novo client

// Evita cache estático nessa página sensível
export const dynamic = "force-dynamic";

// Validação: mínimo 8, e confirmação igual
const schema = z
    .object({
        password: z
            .string()
            .min(8, "Mínimo 8 caracteres")
            .refine((s) => /\S/.test(s), "Não use apenas espaços"),
        confirm: z.string().min(8, "Confirme sua senha"),
    })
    .refine((v) => v.password === v.confirm, {
        message: "As senhas não conferem",
        path: ["confirm"],
    });

type FormValues = z.infer<typeof schema>;
// Padrão que você prefere: cast no resolver
const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

export default function ResetPage(): React.JSX.Element {
    return (
        <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-muted-foreground">Carregando…</div>}>
            <ResetPageInner />
        </Suspense>
    );
}

function ResetPageInner(): React.JSX.Element {
    const router = useRouter();
    const sp = useSearchParams();
    const rawToken = sp ? sp.get("token") ?? "" : "";
    const token = rawToken.trim();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver, defaultValues: { password: "", confirm: "" } });

    const [showPwd, setShowPwd] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    async function onSubmit(v: FormValues): Promise<void> {
        try {
            // chama sua API NestJS diretamente
            await http.post("/auth/reset", { token, password: v.password });

            toast.success("Senha alterada. Faça login para continuar.");
            router.replace("/login");
        } catch (e: unknown) {
            let status = 0;
            let message = "Falha ao redefinir senha";

            if (e && typeof e === "object" && "response" in e) {
                const err = e as { response?: { status?: number }; message?: string };
                status = err.response?.status ?? 0;
                message = err.message ?? message;
            } else if (e instanceof Error) {
                message = e.message;
            }

            if (status === 400) {
                toast.error("Link inválido ou já utilizado.");
            } else if (status === 401) {
                toast.error("Token não autorizado ou expirado.");
            } else if (status === 410) {
                toast.error("Este link expirou. Solicite um novo.");
            } else {
                toast.error(message);
            }
        }

    }

    const tokenMissing = !token;

    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <Card className="w-full max-w-md rounded-2xl shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto h-10 w-10 rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/20 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl">Definir nova senha</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {!tokenMissing ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPwd ? "text" : "password"}
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.password || undefined}
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd((s) => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                                            aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirmar senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm"
                                            type={showConfirm ? "text" : "password"}
                                            autoComplete="new-password"
                                            aria-invalid={!!errors.confirm || undefined}
                                            {...register("confirm")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm((s) => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                                            aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirm && (
                                        <p className="text-xs text-rose-500 mt-1">{errors.confirm.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                                    {isSubmitting ? "Salvando…" : "Salvar nova senha"}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Lembrou?{" "}
                                    <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                                        Entrar
                                    </Link>
                                </p>
                            </form>
                        ) : (
                            <div className="text-center text-sm">
                                Token ausente ou inválido. Volte para{" "}
                                <Link href="/forgot" className="font-medium text-indigo-600 hover:underline">
                                    Recuperar senha
                                </Link>.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
