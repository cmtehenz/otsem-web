"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";

const schema = z.object({
    name: z.string().min(3, "Informe seu nome"),
    email: z.email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string().min(8, "Confirme sua senha"),
    accept: z.literal(true, { message: "Aceite os termos para continuar" }),
}).refine((v) => v.password === v.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
});

type FormValues = z.infer<typeof schema>;

// medidor simples (0..3)
function passwordScore(pw: string) {
    let s = 0;
    if (pw.length >= 8) {s++;}
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) {s++;}
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) {s++;}
    return s;
}

export default function RegisterForm() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "/dashboard";

    const [showPw, setShowPw] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: { name: "", email: "", password: "", confirm: "", accept: true },
    });

    const pw = form.watch("password") || "";
    const score = passwordScore(pw);
    const scoreText = ["fraca", "ok", "boa", "forte"][score] ?? "fraca";

    async function onSubmit(v: FormValues) {
        try {
            setLoading(true);
            await apiPost("/auth/register", { name: v.name, email: v.email, password: v.password });
            await apiPost("/auth/login", { email: v.email, password: v.password });
            router.replace(next);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Falha no cadastro");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
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
                        Aceito os <a className="underline underline-offset-2 hover:text-indigo-600" href="/terms" target="_blank">termos</a> e a{" "}
                        <a className="underline underline-offset-2 hover:text-indigo-600" href="/privacy" target="_blank">privacidade</a>.
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
    );
}
