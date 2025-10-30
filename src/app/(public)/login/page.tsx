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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { authLogin, toErrorMessage } from "@/lib/auth";

// evita cache estático
export const dynamic = 'force-dynamic';

const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Informe seu e-mail')
        .email('E-mail inválido')
        .transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8, 'Mínimo de 8 caracteres'), // igual ao reset
    remember: z.boolean().default(true),
});
type LoginForm = z.infer<typeof loginSchema>;
const loginResolver = zodResolver(loginSchema) as unknown as Resolver<LoginForm>;

// Cookie opcional para SSR/middleware (não é HttpOnly)
function setAuthCookie(token: string, remember: boolean): void {
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 4; // 7d ou 4h
    const parts = [
        `access_token=${encodeURIComponent(token)}`,
        'Path=/',
        `Max-Age=${maxAge}`,
        'SameSite=Lax',
    ];
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        parts.push('Secure');
    }
    document.cookie = parts.join('; ');
}

// Sanitiza "next" para evitar open redirect
function safeNext(nextParam: string | null | undefined, fallback = '/dashboard') {
    if (!nextParam) return fallback;
    try {
        // Só permite caminhos relativos internos
        if (nextParam.startsWith('/')) return nextParam;
        return fallback;
    } catch {
        return fallback;
    }
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
    const sp = useSearchParams();
    const next = safeNext(sp.get('next'));

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
            // Chama sua API NestJS (helper deve salvar os tokens no storage)
            const res = await authLogin(values.email, values.password); // esperado: { access_token, role? }

            // (opcional) cookie legível pelo server (para guards/middleware SSR)
            setAuthCookie(res.access_token, values.remember);

            toast.success('Bem-vindo de volta!');
            // Se for rotear por role:
            // const dest = res.role === 'ADMIN' ? '/admin' : next;
            const dest = next;
            router.replace(dest);
        } catch (e) {
            // Tenta converter a mensagem via helper; se não, cai no fallback
            toast.error(toErrorMessage(e, 'Falha no login'));
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
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                                        aria-invalid={!!errors.email || undefined}
                                        {...register('email')}
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
                                        type={showPw ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-9 pr-10"
                                        aria-invalid={!!errors.password || undefined}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
                            </div>

                            {/* Extras */}
                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input type="checkbox" className="accent-indigo-600" {...register('remember')} />
                                    Lembrar de mim
                                </label>
                                <Link href="/forgot" className="text-sm text-indigo-600 hover:underline">
                                    Esqueci minha senha
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                                {isSubmitting ? 'Entrando…' : 'Entrar'}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground mt-2">
                                Ainda não tem conta?{' '}
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
