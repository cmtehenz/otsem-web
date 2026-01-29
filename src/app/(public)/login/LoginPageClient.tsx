'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Zap, Globe2, Shield, CheckCircle2, Sparkles } from 'lucide-react';

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
            <div className="grid min-h-screen place-items-center bg-white text-sm text-slate-900/50">
                Carregando...
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
                                Bem-vindo de volta
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 xl:text-5xl tracking-tightest">
                                Acesse sua conta
                                <br />
                                <span className="text-primary">
                                    OtsemPay
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-slate-500 font-medium">
                                Gerencie suas operacoes OTC e converta BRL ↔ USDT com as melhores taxas do mercado.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                                title="Liquidacao rapida"
                                desc="Operacoes finalizadas imediatamente"
                            />
                            <FeatureItem
                                icon={<Shield className="h-5 w-5 text-primary" />}
                                title="Seguranca total"
                                desc="Criptografia end-to-end"
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-5 w-5 text-emerald-500" />}
                                title="Sem fronteiras"
                                desc="Opere de qualquer lugar do mundo"
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
                                    Entrar
                                </CardTitle>
                                <p className="text-center text-sm text-slate-500 font-medium">
                                    Acesse sua conta para continuar
                                </p>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-black text-slate-900">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                inputMode="email"
                                                placeholder="voce@exemplo.com"
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                aria-invalid={!!errors.email || undefined}
                                                {...register('email')}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
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
                                                type={showPw ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border-black/[0.05] bg-white/60 pl-10 pr-10 text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                aria-invalid={!!errors.password || undefined}
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                                                aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="inline-flex items-center gap-2 text-slate-500 font-medium">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-black/10 bg-white/60 text-primary focus:ring-2 focus:ring-primary/20"
                                                {...register('remember')}
                                            />
                                            Lembrar de mim
                                        </label>
                                        <Link
                                            href="/forgot"
                                            className="font-bold text-primary transition hover:text-primary/80"
                                        >
                                            Esqueci a senha
                                        </Link>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-premium h-12 rounded-2xl font-black text-base disabled:opacity-50"
                                        aria-busy={isSubmitting}
                                    >
                                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </motion.button>

                                    <Separator className="my-2 bg-black/[0.03]" />

                                    <p className="text-center text-sm text-slate-500 font-medium">
                                        Ainda não tem conta?{' '}
                                        <Link
                                            href="/register"
                                            className="font-bold text-primary transition hover:text-primary/80"
                                        >
                                            Criar conta
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                Conexão segura
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
