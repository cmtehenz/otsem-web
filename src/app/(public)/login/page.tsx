// src/app/(public)/login/page.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/contexts/auth-context';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido').transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    remember: z.boolean().default(true),
});
type LoginForm = z.infer<typeof loginSchema>;
const loginResolver = zodResolver(loginSchema) as unknown as Resolver<LoginForm>;

function safeNext(nextParam: string | null | undefined, fallback = '/customer/dashboard'): string {
    if (!nextParam) return fallback;
    try {
        return nextParam.startsWith('/') ? nextParam : fallback;
    } catch {
        return fallback;
    }
}

export default function LoginPage(): React.JSX.Element {
    return (
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando…</div>}>
            <LoginPageInner />
        </Suspense>
    );
}

function LoginPageInner(): React.JSX.Element {
    const router = useRouter();
    const sp = useSearchParams();
    const next = safeNext(sp ? sp.get('next') : undefined);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: loginResolver,
        defaultValues: { email: '', password: '', remember: true },
    });

    const [showPw, setShowPw] = React.useState(false);

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
            await login(values.email, values.password);
            toast.success('Bem-vindo de volta!');
            router.replace(next);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Falha no login';
            toast.error(message);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#faffff] via-[#faffff] to-[#f8bc07]/10">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-[#f8bc07]/20 to-[#b852ff]/20 opacity-60 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-linear-to-tr from-[#b852ff]/20 to-[#f8bc07]/20 opacity-60 blur-3xl" />
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
                                    Entrar
                                </CardTitle>
                                <p className="text-center text-sm text-[#000000]/70">
                                    Acesse sua conta para continuar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
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
                                                autoComplete="email"
                                                inputMode="email"
                                                placeholder="voce@exemplo.com"
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                aria-invalid={!!errors.email || undefined}
                                                {...register('email')}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-600">{errors.email.message}</p>
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
                                                type={showPw ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-11 rounded-xl border-[#000000]/10 pl-10 pr-10 transition focus:border-[#f8bc07] focus:ring-2 focus:ring-[#f8bc07]/20"
                                                aria-invalid={!!errors.password || undefined}
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#000000]/40 transition hover:text-[#000000]/70"
                                                aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-red-600">{errors.password.message}</p>
                                        )}
                                    </div>

                                    {/* Extras */}
                                    <div className="flex items-center justify-between text-sm">
                                        <label className="inline-flex items-center gap-2 text-[#000000]/70">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-[#000000]/20 text-[#b852ff] focus:ring-2 focus:ring-[#b852ff]/20"
                                                {...register('remember')}
                                            />
                                            Lembrar de mim
                                        </label>
                                        <Link
                                            href="/forgot"
                                            className="font-medium text-[#b852ff] transition hover:text-[#b852ff]/80 hover:underline"
                                        >
                                            Esqueci a senha
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-11 rounded-xl bg-[#b852ff] font-semibold text-[#faffff] shadow-lg shadow-[#b852ff]/25 transition hover:bg-[#b852ff]/90 hover:shadow-xl disabled:opacity-50"
                                        aria-busy={isSubmitting}
                                    >
                                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>

                                    <Separator className="my-2" />

                                    <p className="text-center text-sm text-[#000000]/70">
                                        Ainda não tem conta?{' '}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-[#b852ff] transition hover:text-[#b852ff]/80 hover:underline"
                                        >
                                            Criar conta
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Trust badges */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#000000]/60">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-green-600" />
                                Conexão segura
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#b852ff]" />
                                SSL/TLS
                            </div>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-8">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f8bc07]/30 bg-[#f8bc07]/10 px-4 py-1.5 text-sm font-medium text-[#000000]">
                                <Sparkles className="h-4 w-4 text-[#f8bc07]" />
                                Bem-vindo de volta
                            </div>
                            <h1 className="text-4xl font-bold text-[#000000] xl:text-5xl">
                                Acesse sua conta
                                <br />
                                <span className="bg-linear-to-r from-[#f8bc07] to-[#b852ff] bg-clip-text text-transparent">
                                    otsempay
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-[#000000]/70">
                                Gerencie seus pagamentos e câmbio BRL ↔ USDT com segurança
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                                title="Transações instantâneas"
                                desc="Conversão em tempo real"
                            />
                            <FeatureItem
                                icon={<Shield className="h-5 w-5 text-[#b852ff]" />}
                                title="Proteção total"
                                desc="Seus dados sempre seguros"
                            />
                            <FeatureItem
                                icon={<Sparkles className="h-5 w-5 text-[#f8bc07]" />}
                                title="Suporte 24/7"
                                desc="Atendimento sempre disponível"
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
