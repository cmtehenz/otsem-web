// src/app/(public)/register/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";

// Evita cache estático em páginas públicas sensíveis
export const dynamic = "force-dynamic";

// ---------------- Schema ----------------
const schema = z
    .object({
        name: z.string().min(3, "Informe seu nome"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        confirm: z.string().min(8, "Confirme sua senha"),
        accept: z.literal(true, { message: "Aceite os termos para continuar" }),
    })
    .refine((v) => v.password === v.confirm, {
        message: "As senhas não conferem",
        path: ["confirm"],
    });

type FormValues = z.infer<typeof schema>;
const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

// medidor simples (0..3)
function passwordScore(pw: string): number {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
}
const SCORE_TEXT = ["fraca", "ok", "boa", "forte"] as const;

// helper para setar cookie no client (o guard do server enxerga)
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

export default function RegisterPage(): React.JSX.Element {
    return (
        <Suspense fallback={<div className="min-h-dvh grid place-items-center text-sm text-muted-foreground">Carregando…</div>}>
            <RegisterPageInner />
        </Suspense>
    );
}

function RegisterPageInner(): React.JSX.Element {
    const router = useRouter();
    const sp = useSearchParams(); // agora seguro dentro de <Suspense/>
    const next = sp.get("next") || "/dashboard";

    const [showPw, setShowPw] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver,
        defaultValues: { name: "", email: "", password: "", confirm: "", accept: true },
    });

    const pw = form.watch("password") || "";
    const score = passwordScore(pw);
    const scoreText = SCORE_TEXT[score] ?? "fraca";

    async function onSubmit(v: FormValues): Promise<void> {
        try {
            setLoading(true);
            // cria conta
            await apiPost("/auth/register", { name: v.name, email: v.email, password: v.password }).catch(() => {
                // DEMO: se a API não existir, segue o fluxo
            });

            // faz login (ou simula)
            await apiPost("/auth/login", { email: v.email, password: v.password }).catch(() => {
                // DEMO fallback
            });

            // persiste token no client (opcional)
            if (typeof window !== "undefined") {
                localStorage.setItem("otsem_demo_token", "demo-token");
            }
            // cookie para o guard do server
            setAuthCookie("demo-token", true);

            router.replace(next);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Falha no cadastro");
        } finally {
            setLoading(false);
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
                        <CardTitle className="text-2xl">Criar conta</CardTitle>
                        <p className="text-sm text-muted-foreground">Comece grátis. Leva menos de um minuto.</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            {/* Nome */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="name" className="pl-9" placeholder="Seu nome" {...form.register("name")} />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="email" type="email" className="pl-9" placeholder="voce@exemplo.com" {...form.register("email")} />
                                </div>
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            {/* Senha */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPw ? "text" : "password"}
                                        className="pl-9 pr-10"
                                        {...form.register("password")}
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

                                {/* medidor */}
                                <div className="mt-1">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full transition-all ${score <= 1 ? "bg-red-500" : score === 2 ? "bg-yellow-500" : "bg-green-500"
                                                }`}
                                            style={{ width: `${(score / 3) * 100}%` }}
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        Força: <span className="font-medium">{scoreText}</span>
                                    </div>
                                </div>

                                {form.formState.errors.password && (
                                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirmar */}
                            <div className="grid gap-2">
                                <Label htmlFor="confirm">Confirmar senha</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="confirm"
                                        type={showConfirm ? "text" : "password"}
                                        className="pl-9 pr-10"
                                        {...form.register("confirm")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.formState.errors.confirm && (
                                    <p className="text-sm text-destructive">{form.formState.errors.confirm.message}</p>
                                )}
                            </div>

                            {/* Termos */}
                            <label className="inline-flex items-center gap-2 text-sm">
                                <input type="checkbox" className="accent-indigo-600" {...form.register("accept")} />
                                Aceito os{" "}
                                <a className="underline underline-offset-2 hover:text-indigo-600" href="/terms" target="_blank" rel="noreferrer">
                                    termos
                                </a>{" "}
                                e a{" "}
                                <a className="underline underline-offset-2 hover:text-indigo-600" href="/privacy" target="_blank" rel="noreferrer">
                                    privacidade
                                </a>.
                            </label>
                            {form.formState.errors.accept && (
                                <p className="text-sm text-destructive">{form.formState.errors.accept.message}</p>
                            )}

                            <Button type="submit" disabled={loading} className="mt-2">
                                {loading ? "Criando conta..." : "Criar conta"}
                            </Button>

                            <Separator className="my-2" />
                            <p className="text-center text-sm text-muted-foreground">
                                Já tem conta?{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push("/login")}
                                    className="font-medium text-indigo-600 hover:underline"
                                >
                                    Entrar
                                </button>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
