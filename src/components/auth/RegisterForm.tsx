"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, User, Lock, Sparkles, CheckCircle2, Shield, Zap, Globe2, UserPlus, Gift, Loader2 } from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";

const schema = z
    .object({
        name: z.string().min(3, "Informe seu nome").transform((v) => v.trim()),
        email: z.string().email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        confirm: z.string().min(8, "Confirme sua senha"),
        affiliateCode: z.string().optional().transform((v) => v?.trim().toUpperCase() || undefined),
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

export default function RegisterForm(): React.JSX.Element {
    return (
        <Suspense fallback={
            <div className="grid min-h-screen place-items-center bg-[#0a0118] text-sm text-white/50">
                Carregando…
            </div>
        }>
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
        defaultValues: { name: "", email: "", password: "", confirm: "", affiliateCode: "", accept: true },
    });

    const [showAffiliateField, setShowAffiliateField] = React.useState(false);
    const [validatingCode, setValidatingCode] = React.useState(false);
    const [codeValid, setCodeValid] = React.useState<boolean | null>(null);
    const affiliateCode = form.watch("affiliateCode") || "";

    const validateAffiliateCode = React.useCallback(async (code: string) => {
        if (!code || code.length < 3) {
            setCodeValid(null);
            return;
        }
        try {
            setValidatingCode(true);
            await http.get(`/affiliates/validate/${code.toUpperCase()}`);
            setCodeValid(true);
        } catch {
            setCodeValid(false);
        } finally {
            setValidatingCode(false);
        }
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (affiliateCode) {
                validateAffiliateCode(affiliateCode);
            } else {
                setCodeValid(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [affiliateCode, validateAffiliateCode]);

    const pw = form.watch("password") || "";
    const score = passwordScore(pw);
    const scoreText = SCORE_TEXT[score] ?? "fraca";

    async function onSubmit(v: FormValues): Promise<void> {
        try {
            setLoading(true);

            const res = await http.post<{ access_token: string; role?: string }>(
                "/auth/register",
                { 
                    name: v.name, 
                    email: v.email, 
                    password: v.password,
                    ...(v.affiliateCode && codeValid ? { affiliateCode: v.affiliateCode } : {})
                },
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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0118]">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/30 via-purple-600/20 to-transparent blur-3xl" />
                <div className="absolute top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-violet-600/20 to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-purple-600/20 to-transparent blur-3xl" />
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0118]/80 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo.png" alt="OtsemPay" className="h-10 w-10 object-contain" />
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-amber-400">Otsem</span>
                            <span className="text-violet-400">Pay</span>
                        </span>
                    </Link>
                    
                    <Link href="/login">
                        <Button variant="ghost" className="rounded-full border border-white/10 px-6 text-sm font-medium text-white hover:bg-white/5">
                            Entrar
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-24 lg:px-8 xl:px-16">
                <div className="flex w-full max-w-6xl items-center gap-16">
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-8">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-200">
                                <Sparkles className="h-4 w-4 text-violet-400" />
                                Comece grátis
                            </div>
                            <h1 className="text-4xl font-bold text-white xl:text-5xl">
                                Crie sua conta
                                <br />
                                <span className="bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                                    em segundos
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-white/60">
                                Acesso completo à plataforma de operações OTC e câmbio BRL ↔ USDT com as melhores taxas.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                title="Verificação rápida"
                                desc="KYC simplificado em minutos"
                            />
                            <FeatureItem
                                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                                title="Taxas competitivas"
                                desc="A partir de 3% de spread"
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-5 w-5 text-violet-400" />}
                                title="Sem fronteiras"
                                desc="Opere de qualquer lugar"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="space-y-3 border-b border-white/5 pb-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
                                    <UserPlus className="h-7 w-7 text-white" />
                                </div>
                                <CardTitle className="text-center text-2xl font-bold text-white">
                                    Criar conta
                                </CardTitle>
                                <p className="text-center text-sm text-white/60">
                                    Preencha os dados abaixo para começar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-white">
                                            Nome completo
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="name"
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                placeholder="Seu nome"
                                                {...form.register("name")}
                                            />
                                        </div>
                                        {form.formState.errors.name && (
                                            <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-white">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                placeholder="voce@exemplo.com"
                                                {...form.register("email")}
                                            />
                                        </div>
                                        {form.formState.errors.email && (
                                            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm font-semibold text-white">
                                            Senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="password"
                                                type={showPw ? "text" : "password"}
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                placeholder="Mínimo 8 caracteres"
                                                {...form.register("password")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
                                                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>

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
                                                                        ? "bg-yellow-500"
                                                                        : "bg-green-500"
                                                                : "bg-white/10"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-1.5 text-xs text-white/50">
                                                    Força:{" "}
                                                    <span
                                                        className={`font-medium ${score <= 1 ? "text-red-400" : score === 2 ? "text-yellow-400" : "text-green-400"}`}
                                                    >
                                                        {scoreText}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {form.formState.errors.password && (
                                            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm" className="text-sm font-semibold text-white">
                                            Confirmar senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="confirm"
                                                type={showConfirm ? "text" : "password"}
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                placeholder="Repita a senha"
                                                {...form.register("confirm")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
                                                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                            >
                                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {form.formState.errors.confirm && (
                                            <p className="text-xs text-red-400">{form.formState.errors.confirm.message}</p>
                                        )}
                                    </div>

                                    <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm transition hover:bg-white/10">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                            {...form.register("accept")}
                                        />
                                        <span className="text-white/60">
                                            Aceito os{" "}
                                            <a
                                                className="font-medium text-violet-400 underline-offset-2 hover:underline"
                                                href="/termos"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                termos de uso
                                            </a>{" "}
                                            e a{" "}
                                            <a
                                                className="font-medium text-violet-400 underline-offset-2 hover:underline"
                                                href="/privacidade"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                política de privacidade
                                            </a>
                                        </span>
                                    </label>
                                    {form.formState.errors.accept && (
                                        <p className="text-xs text-red-400">{form.formState.errors.accept.message}</p>
                                    )}

                                    {!showAffiliateField ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowAffiliateField(true)}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-3 text-sm text-white/60 transition hover:border-violet-500/50 hover:text-violet-400"
                                        >
                                            <Gift className="h-4 w-4" />
                                            Tenho um código de indicação
                                        </button>
                                    ) : (
                                        <div className="grid gap-2 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                                            <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-sm font-semibold text-white">
                                                <Gift className="h-4 w-4 text-violet-400" />
                                                Código de indicação
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="affiliateCode"
                                                    className="h-11 rounded-xl border-white/10 bg-white/5 pr-10 text-white uppercase placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                    placeholder="Ex: PARCEIRO123"
                                                    {...form.register("affiliateCode")}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {validatingCode ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                                                    ) : codeValid === true ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : codeValid === false ? (
                                                        <span className="text-xs text-red-400">Inválido</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            {codeValid === true && (
                                                <p className="text-xs text-green-400">Código válido! Você será vinculado a um parceiro.</p>
                                            )}
                                            {codeValid === false && (
                                                <p className="text-xs text-red-400">Código não encontrado. Verifique e tente novamente.</p>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50"
                                        aria-busy={loading}
                                    >
                                        {loading ? "Criando conta..." : "Criar conta"}
                                    </Button>

                                    <Separator className="my-2 bg-white/10" />

                                    <p className="text-center text-sm text-white/60">
                                        Já tem conta?{" "}
                                        <Link
                                            href="/login"
                                            className="font-semibold text-violet-400 transition hover:text-violet-300 hover:underline"
                                        >
                                            Entrar
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-green-500" />
                                Dados criptografados
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
                                LGPD compliant
                            </div>
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/60">{desc}</p>
            </div>
        </div>
    );
}
