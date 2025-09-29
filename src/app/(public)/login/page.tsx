// src/app/(public)/login/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";

// Opcional, mas ajuda a evitar cache estático em auth
export const dynamic = "force-dynamic";

const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    remember: z.boolean().default(false),
});
type LoginForm = z.infer<typeof loginSchema>;
const loginResolver = zodResolver(loginSchema) as unknown as Resolver<LoginForm>;

// ---- helper para setar cookie no client (visível ao server) ----
function setAuthCookie(token: string, remember: boolean): void {
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 4; // 7 dias ou 4h
    document.cookie = [
        `access_token=${encodeURIComponent(token)}`,
        "Path=/",
        `Max-Age=${maxAge}`,
        "SameSite=Lax",
        // Em produção HTTPS, inclua "Secure"
        // "Secure",
    ].join("; ");
}

export default function LoginPage(): React.JSX.Element {
    return (
        <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-muted-foreground">Carregando…</div>}>
            <LoginPageInner />
        </Suspense>
    );
}

function LoginPageInner(): React.JSX.Element {
    const router = useRouter();
    const sp = useSearchParams(); // válido pois está dentro de <Suspense/>
    const next = sp.get("next") || "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: loginResolver,
        defaultValues: { email: "", password: "", remember: true },
    });

    const [showPw, setShowPw] = React.useState(false);

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
            // tente autenticar na sua API; se não existir no demo, caímos no fallback
            try {
                await apiPost("/auth/login", {
                    email: values.email,
                    password: values.password,
                });
            } catch {
                // DEMO fallback (sem backend real)
            }

            // Persistência no client (opcional)
            if (typeof window !== "undefined") {
                localStorage.setItem("otsem_demo_token", "demo-token");
            }
            // Cookie para o guard do server (é o que evita redirecionar de volta)
            setAuthCookie("demo-token", values.remember);

            toast.success("Bem-vindo de volta!");
            router.replace(next);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha no login";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <Card className="w-full max-w-md rounded-2xl shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto h-10 w-10 rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/20 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl">Entrar no Otsem Bank</CardTitle>
                        <p className="text-sm text-muted-foreground">Acesse sua conta para continuar</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        inputMode="email"
                                        placeholder="voce@email.com"
                                        className="pl-9"
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPw ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-9 pr-10"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
                            </div>

                            {/* Extras */}
                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input type="checkbox" className="accent-indigo-600" {...register("remember")} />
                                    Lembrar de mim
                                </label>
                                <Link href="/forgot" className="text-sm text-indigo-600 hover:underline">
                                    Esqueci minha senha
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Entrando…" : "Entrar"}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground mt-2">
                                Ainda não tem conta?{" "}
                                <Link href="/register" className="font-medium text-indigo-600 hover:underline">
                                    Criar conta
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
