"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, User, Lock, CheckCircle2, Shield, Zap, Globe2, UserPlus, Gift, Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import http from "@/lib/http";
import { setTokens } from "@/lib/token";
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
        // Primeiro verifica se o axios já processou e colocou uma mensagem amigável no interceptor
        if ("message" in e && typeof (e as any).message === "string" && (e as any).message.includes("conectar ao servidor")) {
            return (e as any).message;
        }

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
            <div className="grid min-h-screen place-items-center bg-white text-sm text-slate-900/50">
                Carregando...
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
                    email: v.email, 
                    password: v.password,
                    ...(v.affiliateCode && codeValid ? { affiliateCode: v.affiliateCode } : {})
                },
                {}
            );

            setTokens(res.data.access_token, "");

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
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                    className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] bg-accent/5 blur-[100px] rounded-full"
                />
            </div>

            <div className="fixed top-6 left-6 z-50">
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl liquid-glass text-slate-900/70 hover:text-slate-900 font-bold text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </motion.button>
                </Link>
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-24 lg:px-8 xl:px-16">
                <div className="flex w-full max-w-6xl items-center gap-16">
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-8">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-black text-primary">
                                <Sparkles className="h-4 w-4" />
                                Comece gratis
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 xl:text-5xl tracking-tightest">
                                Crie sua conta
                                <br />
                                <span className="text-primary">
                                    em segundos
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-slate-500 font-medium">
                                Acesso completo a plataforma de operacoes OTC e cambio BRL ↔ USDT com as melhores taxas.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                title="Verificacao rapida"
                                desc="KYC simplificado em minutos"
                            />
                            <FeatureItem
                                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                                title="Taxas competitivas"
                                desc="A partir de 3% de spread"
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-5 w-5 text-primary" />}
                                title="Sem fronteiras"
                                desc="Opere de qualquer lugar"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <Card className="overflow-hidden rounded-[2.5rem] border-white/40 rich-glass">
                            <CardHeader className="space-y-3 border-b border-black/[0.03] pb-6">
<div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden">
                                      <img 
                                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769589355434.png?width=8000&height=8000&resize=contain" 
                                          alt="Otsem Pay"
                                          className="h-full w-full object-contain"
                                      />
                                  </div>
                                <CardTitle className="text-center text-2xl font-black text-slate-900">
                                    Criar conta
                                </CardTitle>
                                <p className="text-center text-sm text-slate-500 font-medium">
                                    Preencha os dados abaixo para comecar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-black text-slate-900">
                                            Nome completo
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="name"
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Seu nome"
                                                {...form.register("name")}
                                            />
                                        </div>
                                        {form.formState.errors.name && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-black text-slate-900">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="voce@exemplo.com"
                                                {...form.register("email")}
                                            />
                                        </div>
                                        {form.formState.errors.email && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm font-black text-slate-900">
                                            Senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="password"
                                                type={showPw ? "text" : "password"}
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 pr-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Minimo 8 caracteres"
                                                {...form.register("password")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
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
                                                                        : "bg-emerald-500"
                                                                : "bg-black/[0.05]"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-1.5 text-xs text-slate-500">
                                                    Forca:{" "}
                                                    <span
                                                        className={`font-bold ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-500" : "text-emerald-500"}`}
                                                    >
                                                        {scoreText}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {form.formState.errors.password && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm" className="text-sm font-black text-slate-900">
                                            Confirmar senha
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="confirm"
                                                type={showConfirm ? "text" : "password"}
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 pr-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Repita a senha"
                                                {...form.register("confirm")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                                                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                            >
                                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {form.formState.errors.confirm && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.confirm.message}</p>
                                        )}
                                    </div>

                                    <label className="flex items-start gap-3 rounded-2xl border border-black/[0.05] bg-white/60 p-3 text-sm transition hover:bg-white/80">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 rounded border-black/10 bg-white/60 text-primary focus:ring-2 focus:ring-primary/20"
                                            {...form.register("accept")}
                                        />
                                        <span className="text-slate-500 font-medium">
                                            Aceito os{" "}
                                            <a
                                                className="font-bold text-primary hover:underline"
                                                href="/termos"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                termos de uso
                                            </a>{" "}
                                            e a{" "}
                                            <a
                                                className="font-bold text-primary hover:underline"
                                                href="/privacidade"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                política de privacidade
                                            </a>
                                        </span>
                                    </label>
                                    {form.formState.errors.accept && (
                                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.accept.message}</p>
                                    )}

                                    {!showAffiliateField ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowAffiliateField(true)}
                                            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 p-3 text-sm text-slate-500 transition hover:border-primary/50 hover:text-primary font-medium"
                                        >
                                            <Gift className="h-4 w-4" />
                                            Tenho um codigo de indicacao
                                        </button>
                                    ) : (
                                        <div className="grid gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-3">
                                            <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-sm font-black text-slate-900">
                                                <Gift className="h-4 w-4 text-primary" />
                                                Codigo de indicacao
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="affiliateCode"
                                                    className="h-12 rounded-2xl border-black/[0.05] bg-white/80 pr-10 text-slate-900 uppercase placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Ex: PARCEIRO123"
                                                    {...form.register("affiliateCode")}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {validatingCode ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                                    ) : codeValid === true ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    ) : codeValid === false ? (
                                                        <span className="text-xs text-red-500 font-medium">Invalido</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-premium h-12 rounded-2xl font-black text-base disabled:opacity-50"
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Criando conta...' : 'Criar conta'}
                                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </motion.button>

                                    <Separator className="my-2 bg-black/[0.03]" />

                                    <p className="text-center text-sm text-slate-500 font-medium">
                                        Ja tem uma conta?{" "}
                                        <Link
                                            href="/login"
                                            className="font-bold text-primary transition hover:text-primary/80"
                                        >
                                            Entrar
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                Conexao segura
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                SSL/TLS
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/60 border border-black/[0.05] shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
