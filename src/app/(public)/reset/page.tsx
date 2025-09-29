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
import { Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";

// Evita cache estático nessa página sensível
export const dynamic = "force-dynamic";

const schema = z
    .object({
        password: z.string().min(8, "Mínimo 8 caracteres"),
        confirm: z.string().min(8, "Confirme sua senha"),
    })
    .refine((v) => v.password === v.confirm, {
        message: "As senhas não conferem",
        path: ["confirm"],
    });

type FormValues = z.infer<typeof schema>;
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
    const sp = useSearchParams(); // agora seguro dentro de <Suspense/>
    const token = sp.get("token") || "";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver, defaultValues: { password: "", confirm: "" } });

    async function onSubmit(v: FormValues): Promise<void> {
        try {
            await apiPost("/auth/reset", { token, password: v.password });
            toast.success("Senha alterada. Faça login para continuar.");
            router.replace("/login");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao redefinir senha";
            toast.error(msg);
        }
    }

    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <Card className="w-full max-w-md rounded-2xl shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto h-10 w-10 rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/20 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl">Definir nova senha</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {token ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirmar senha</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        autoComplete="new-password"
                                        {...register("confirm")}
                                    />
                                    {errors.confirm && (
                                        <p className="text-xs text-rose-500 mt-1">{errors.confirm.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
