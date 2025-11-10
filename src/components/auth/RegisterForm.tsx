// src/app/(public)/register/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, User, Lock, Sparkles, CheckCircle2, Shield } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";

// Evita cache estático
export const dynamic = "force-dynamic";

// ---------------- Schema ----------------
const schema = z
    .object({
        name: z.string().min(3, "Informe seu nome").transform((v) => v.trim()),
        email: z.string().email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
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

function passwordScore(pw: string): number {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
}
const SCORE_TEXT = ["fraca", "ok", "boa", "forte"] as const;

function getHttpStatus(e: unknown): number {
    if (e && typeof e === "object" && "response" in e) {
        const r = e as { response?: { status?: number } };
        return r.response?.status ?? 0;
    }
    return 0;
}
function getHttpMessage(e: unknown, fallback = "Falha no cadastro"): string {
    if (e && typeof e === "object") {
        const obj = e as {
            message?: string | string[];
            response?: { data?: { message?: string | string[] } };
        };
        const arr =
            (Array.isArray(obj.message) ? obj.message :
                Array.isArray(obj.response?.data?.message) ? obj.response?.data?.message : null);
        if (arr && arr.length) return arr.join(", ");
        const msg = obj.message ?? obj.response?.data?.message;
        if (typeof msg === "string" && msg.trim()) return msg;
    }
    if (e instanceof Error && e.message.trim()) return e.message;
    return fallback;
}

export default function RegisterPage(): React.JSX.Element {
    return (
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>}>
            <RegisterPageInner />
        </Suspense>
    );
}

function RegisterPageInner(): React.JSX.Element {
    const router = useRouter();

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

            const res = await http.post<{ access_token: string; role?: string }>(
                "/users/register",
                { name: v.name, email: v.email, password: v.password },
                {}
            );

            localStorage.setItem("accessToken", res.data.access_token);

            document.cookie = [
                `access_token=${encodeURIComponent(res.data.access_token)}`,
                "Path=/",
                "Max-Age=604800",
                "SameSite=Lax",
            ].join("; ");

            toast.success("Conta criada! Bem-vindo(a).");
            router.replace("/customer/dashboard");
        } catch (e: unknown) {
            const status = getHttpStatus(e);

            if (status === 409) {
                form.setError("email", { message: "Este e-mail já está em uso" });
                toast.error("Este e-mail já está em uso.");
            } else if (status === 400) {
                toast.error("Dados inválidos. Verifique as informações.");
            } else {
                toast.error(getHttpMessage(e, "Falha no cadastro"));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#faffff] via-[#faffff] to-[#f8bc07]/10">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-linear-to-br from-[#f8bc07]/20 to-[#b852ff]/20 opacity-60 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-linear-to-tr from-[#b852ff]/20 to-[#f8bc07]/20 opacity-60 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] bg-size-[26px_26px] opacity-[0.02]" />
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 lg:px-8 xl:px-16">
                <div className="flex w-full max-w-7xl items-center gap-16">
                    {/* Left side - Form */}
                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <Card className="overflow-hidden rounded-3xl border-[#000000]/10 shadow-xl shadow-[#000000]/5 backdrop-blur-sm">
                            <CardHeader className="space-y-3 border-b border-[#000000]/5 bg-linear-to-b from-[#faffff] to-[#faffff]/50 pb-6">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b852ff] shadow-lg shadow-[#b852ff]/25">
                                    <Lock className="h-6 w-6 text-[#faffff]" />
                                </div>
                                <CardTitle className="text-center text-2xl font-bold text-[#000000]">
                                    Criar conta
                                </CardTitle>
                                <p className="text-center text-sm text-[#000000]/70">
                                    Preencha os dados abaixo para começar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                                    {/* Nome */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-[#000000]">
                                            Nome completo
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#000000]/40" />
                                            <Input
                                                id="name"
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                placeholder="Seu nome"
                                                {...form.register("name")}
                                            />
                                        </div>
                                        {form.formState.errors.name && (
                                            <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-[#000000]">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#000000]/40" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                placeholder="voce@exemplo.com"
                                                {...form.register("email")}
                                            />
                                        </div>
                                        {form.formState.errors.email && (
                                            <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Senha */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm font-semibold text-[#000000]">
                                            Senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#000000]/40" />
                                            <Input
                                                id="password"
                                                type={showPw ? "text" : "password"}
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 pr-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                {...form.register("password")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#000000]/40 transition hover:text-[#000000]/70"
                                                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

                                        {/* Password strength meter */}
                                        {pw && (
                                            <div className="mt-1">
                                                <div className="flex gap-1">
                                                    {[0, 1, 2, 3].map((i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-1 flex-1 rounded-full transition-all ${i <= score
                                                                ? score <= 1
                                                                    ? "bg-red-500"
                                                                    : score === 2
                                                                        ? "bg-[#f8bc07]"
                                                                        : "bg-green-500"
                                                                : "bg-[#000000]/10"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-1.5 text-xs text-[#000000]/60">
                                                    Força:{" "}
                                                    <span
                                                        className={`font-medium ${score <= 1 ? "text-red-600" : score === 2 ? "text-[#f8bc07]" : "text-green-600"
                                                            }`}
                                                    >
                                                        {scoreText}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {form.formState.errors.password && (
                                            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    {/* Confirmar */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm" className="text-sm font-semibold text-[#000000]">
                                            Confirmar senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#000000]/40" />
                                            <Input
                                                id="confirm"
                                                type={showConfirm ? "text" : "password"}
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 pr-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                {...form.register("confirm")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#000000]/40 transition hover:text-[#000000]/70"
                                                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                            >
                                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {form.formState.errors.confirm && (
                                            <p className="text-xs text-red-600">{form.formState.errors.confirm.message}</p>
                                        )}
                                    </div>

                                    {/* Termos */}
                                    <label className="flex items-start gap-3 rounded-lg border border-[#000000]/10 bg-[#faffff]/50 p-3 text-sm transition hover:bg-[#faffff]">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 rounded border-[#000000]/20 text-[#b852ff] focus:ring-2 focus:ring-[#b852ff]/20"
                                            {...form.register("accept")}
                                        />
                                        <span className="text-[#000000]/70">
                                            Aceito os{" "}
                                            <a
                                                className="font-medium text-[#b852ff] underline-offset-2 hover:underline"
                                                href="/terms"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                termos de uso
                                            </a>{" "}
                                            e a{" "}
                                            <a
                                                className="font-medium text-[#b852ff] underline-offset-2 hover:underline"
                                                href="/privacy"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                política de privacidade
                                            </a>
                                        </span>
                                    </label>
                                    {form.formState.errors.accept && (
                                        <p className="text-xs text-red-600">{form.formState.errors.accept.message}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="h-11 rounded-xl bg-[#b852ff] font-semibold text-[#faffff] shadow-lg shadow-[#b852ff]/25 transition hover:bg-[#b852ff]/90 hover:shadow-xl disabled:opacity-50"
                                        aria-busy={loading}
                                    >
                                        {loading ? "Criando conta..." : "Criar conta"}
                                    </Button>

                                    <Separator className="my-2" />

                                    <p className="text-center text-sm text-[#000000]/70">
                                        Já tem conta?{" "}
                                        <button
                                            type="button"
                                            onClick={() => router.push("/login")}
                                            className="font-semibold text-[#b852ff] transition hover:text-[#b852ff]/80 hover:underline"
                                        >
                                            Entrar
                                        </button>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Trust badges */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#000000]/60">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-green-600" />
                                Dados criptografados
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#b852ff]" />
                                LGPD compliant
                            </div>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-8">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f8bc07]/30 bg-[#f8bc07]/10 px-4 py-1.5 text-sm font-medium text-[#000000]">
                                <Sparkles className="h-4 w-4 text-[#f8bc07]" />
                                Comece grátis
                            </div>
                            <h1 className="text-4xl font-bold text-[#000000] xl:text-5xl">
                                Crie sua conta
                                <br />
                                <span className="bg-linear-to-r from-[#f8bc07] to-[#b852ff] bg-clip-text text-transparent">
                                    em segundos
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-[#000000]/70">
                                Acesso completo à plataforma de pagamentos e câmbio BRL ↔ USDT
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                                title="Verificação instantânea"
                                desc="KYC simplificado e rápido"
                            />
                            <FeatureItem
                                icon={<Shield className="h-5 w-5 text-[#b852ff]" />}
                                title="Segurança avançada"
                                desc="Criptografia de ponta a ponta"
                            />
                            <FeatureItem
                                icon={<Sparkles className="h-5 w-5 text-[#f8bc07]" />}
                                title="Taxas competitivas"
                                desc="A partir de 0.79% por transação"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#faffff] shadow-sm ring-1 ring-[#000000]/10">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-[#000000]">{title}</h3>
                <p className="text-sm text-[#000000]/70">{desc}</p>
            </div>
        </div>
    );
}
