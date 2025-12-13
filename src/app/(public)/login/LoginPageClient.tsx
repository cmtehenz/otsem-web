// src/app/(public)/login/LoginPageClient.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, CheckCircle2, ArrowRight, Zap, Globe2, Rocket } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/contexts/auth-context';

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

export default function LoginPageClient(): React.JSX.Element {
    return (
        <Suspense fallback={
            <div className="grid min-h-screen place-items-center bg-[#0a0118] text-sm text-white/50">
                Carregando…
            </div>
        }>
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
                    
                    <Link href="/register">
                        <Button className="rounded-full bg-white px-6 text-sm font-semibold text-[#0a0118] hover:bg-white/90">
                            Criar conta
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
                                Bem-vindo de volta
                            </div>
                            <h1 className="text-4xl font-bold text-white xl:text-5xl">
                                Acesse sua conta
                                <br />
                                <span className="bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                                    OtsemPay
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-white/60">
                                Gerencie suas operações OTC e converta BRL ↔ USDT com as melhores taxas do mercado.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                                title="Liquidação rápida"
                                desc="Operações finalizadas em 10-30 min"
                            />
                            <FeatureItem
                                icon={<Shield className="h-5 w-5 text-violet-400" />}
                                title="Segurança total"
                                desc="Criptografia end-to-end"
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-5 w-5 text-green-500" />}
                                title="Sem fronteiras"
                                desc="Opere de qualquer lugar do mundo"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader className="space-y-3 border-b border-white/5 pb-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
                                    <Rocket className="h-7 w-7 text-white" />
                                </div>
                                <CardTitle className="text-center text-2xl font-bold text-white">
                                    Entrar
                                </CardTitle>
                                <p className="text-center text-sm text-white/60">
                                    Acesse sua conta para continuar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-white">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                inputMode="email"
                                                placeholder="voce@exemplo.com"
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                aria-invalid={!!errors.email || undefined}
                                                {...register('email')}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-400">{errors.email.message}</p>
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
                                                type={showPw ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                aria-invalid={!!errors.password || undefined}
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
                                                aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-red-400">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="inline-flex items-center gap-2 text-white/60">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                                {...register('remember')}
                                            />
                                            Lembrar de mim
                                        </label>
                                        <Link
                                            href="/forgot"
                                            className="font-medium text-violet-400 transition hover:text-violet-300 hover:underline"
                                        >
                                            Esqueci a senha
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50"
                                        aria-busy={isSubmitting}
                                    >
                                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>

                                    <Separator className="my-2 bg-white/10" />

                                    <p className="text-center text-sm text-white/60">
                                        Ainda não tem conta?{' '}
                                        <Link
                                            href="/register"
                                            className="font-semibold text-violet-400 transition hover:text-violet-300 hover:underline"
                                        >
                                            Criar conta
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-green-500" />
                                Conexão segura
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
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
