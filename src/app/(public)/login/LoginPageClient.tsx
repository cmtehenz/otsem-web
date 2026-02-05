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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAuth } from '@/contexts/auth-context';
import { TwoFactorVerify } from '@/components/auth/TwoFactorVerify';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PwaInstallPrompt } from '@/components/layout/PwaInstallPrompt';

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
            <div className="fixed inset-0 grid place-items-center overflow-hidden fintech-bg-container text-sm text-white/50" style={{ overscrollBehavior: 'none' }}>
                ...
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
    const { login, verifyTwoFactor, user } = useAuth();
    const t = useTranslations();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: loginResolver,
        defaultValues: { email: '', password: '', remember: true },
    });

    const [showPw, setShowPw] = React.useState(false);
    const [requires2FA, setRequires2FA] = React.useState(false);
    const [tempToken, setTempToken] = React.useState('');
    const [userEmail, setUserEmail] = React.useState('');
    const [_pendingUser, setPendingUser] = React.useState<unknown>(null);
    const [isPwa, setIsPwa] = React.useState(false);

    // Detect PWA standalone mode
    React.useEffect(() => {
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
        setIsPwa(!!standalone);
    }, []);

    // Lock body scroll while login page is mounted — prevents iOS scroll
    // state from carrying over to the dashboard after navigation.
    React.useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
        return () => {
            html.style.overflow = '';
            body.style.overflow = '';
        };
    }, []);

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
            const result = await login(values.email, values.password);

            // Check if 2FA is required
            if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
                setRequires2FA(true);
                setTempToken(result.tempToken);
                setUserEmail(values.email);
                setPendingUser(result.user);
                return;
            }

            // Redirect based on role if no 'next' parameter
            if (sp && sp.get('next')) {
                router.replace(next);
            } else {
                const dashboardPath = result.role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";
                router.replace(dashboardPath);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : t('auth.loginFailed');
            toast.error(message);
        }
    };

    const handle2FAVerify = async (code: string, isBackupCode: boolean) => {
        try {
            const loggedInUser = await verifyTwoFactor(code, tempToken, isBackupCode);
            toast.success(t('auth.authComplete'));

            // Redirect based on role
            if (sp && sp.get('next')) {
                router.replace(next);
            } else {
                const dashboardPath = loggedInUser.role === "ADMIN" ? "/admin/dashboard" : "/customer/dashboard";
                router.replace(dashboardPath);
            }
        } catch (error) {
            throw error; // Let TwoFactorVerify handle the error display
        }
    };

    const handleCancel2FA = () => {
        setRequires2FA(false);
        setTempToken('');
        setUserEmail('');
        setPendingUser(null);
    };

    // Show 2FA verification if required
    if (requires2FA) {
        return (
            <div className="fixed inset-0 overflow-hidden fintech-bg-container" style={{ overscrollBehavior: 'none', touchAction: 'pan-x' }}>
                {!isPwa && (
                    <div className="fixed top-6 left-6 z-50">
                        <motion.button
                            onClick={handleCancel2FA}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fintech-glass-card text-white/70 hover:text-white font-bold text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('common.back')}
                        </motion.button>
                    </div>
                )}

                <div className="flex min-h-full w-full items-center justify-center px-4 py-24">
                    <TwoFactorVerify
                        onVerify={handle2FAVerify}
                        onCancel={handleCancel2FA}
                        email={userEmail}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 overflow-hidden fintech-bg-container" style={{ overscrollBehavior: 'none', touchAction: 'pan-x' }}>
            {!isPwa && (
                <div className="fixed top-6 left-6 z-50">
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl fintech-glass-card text-white/70 hover:text-white font-bold text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('common.back')}
                        </motion.button>
                    </Link>
                </div>
            )}

            <div className="fixed top-6 right-6 z-50">
                <div className="rounded-2xl fintech-glass-card px-1 py-1">
                    <LanguageSwitcher className="text-white/70 hover:text-white" />
                </div>
            </div>

            <div className="flex h-full w-full items-center justify-center px-4 py-24 lg:px-8 xl:px-16">
                <div className="flex w-full max-w-6xl items-center gap-16">
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-8">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-sm font-black text-white">
                                <Sparkles className="h-4 w-4" />
                                {t('auth.welcomeBack')}
                            </div>
                            <h1 className="text-4xl font-black text-white xl:text-5xl tracking-tightest">
                                {t('auth.accessYourAccount')}
                                <br />
                                <span className="text-[#9B4DFF]">
                                    OtsemPay
                                </span>
                            </h1>
                            <p className="mt-4 text-lg text-white/60 font-medium whitespace-pre-line">
                                {t('auth.accountDescription')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureItem
                                icon={<Zap className="h-5 w-5 text-yellow-400" />}
                                title={t('auth.fastSettlement')}
                                desc={t('auth.fastSettlementDesc')}
                            />
                            <FeatureItem
                                icon={<Shield className="h-5 w-5 text-[#9B4DFF]" />}
                                title={t('auth.totalSecurity')}
                                desc={t('auth.totalSecurityDesc')}
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-5 w-5 text-emerald-400" />}
                                title={t('auth.noBorders')}
                                desc={t('auth.noBordersDesc')}
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <div className="overflow-hidden rounded-[2.5rem] fintech-glass-card p-0">
                            <div className="space-y-3 border-b border-white/[0.08] px-6 pt-8 pb-6 sm:px-8">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden">
                                    <img
                                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769589355434.png?width=8000&height=8000&resize=contain"
                                        alt="Otsem Pay"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <h2 className="text-center text-2xl font-black text-white">
                                    {t('auth.loginTitle')}
                                </h2>
                                <p className="text-center text-sm text-white font-medium">
                                    {t('auth.loginSubtitle')}
                                </p>
                            </div>

                            <div className="p-6 sm:p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-black text-white">
                                            {t('common.email')}
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                inputMode="email"
                                                placeholder="voce@exemplo.com"
                                                className="h-12 rounded-2xl border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/40 transition focus:border-[#8B2FFF] focus:ring-2 focus:ring-[#8B2FFF]/20"
                                                aria-invalid={!!errors.email || undefined}
                                                {...register('email')}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm font-black text-white">
                                            {t('common.password')}
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                                            <Input
                                                id="password"
                                                type={showPw ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="h-12 rounded-2xl border-white/15 bg-white/10 pl-10 pr-10 text-white placeholder:text-white/40 transition focus:border-[#8B2FFF] focus:ring-2 focus:ring-[#8B2FFF]/20"
                                                aria-invalid={!!errors.password || undefined}
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw((v) => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                                                aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
                                            >
                                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="inline-flex items-center gap-2 text-white font-medium">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#6F00FF] focus:ring-2 focus:ring-[#8B2FFF]/20"
                                                {...register('remember')}
                                            />
                                            {t('auth.rememberMe')}
                                        </label>
                                        <Link
                                            href="/forgot"
                                            className="font-bold text-white transition hover:text-white/80"
                                        >
                                            {t('auth.forgotPassword')}
                                        </Link>
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-black text-base disabled:opacity-50 bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-400/25 transition-colors"
                                        aria-busy={isSubmitting}
                                    >
                                        {isSubmitting ? t('auth.loggingIn') : 'Entrar'}
                                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </motion.button>

                                    <div className="my-2 h-px bg-white/[0.08]" />

                                    <p className="text-center text-sm text-white font-medium">
                                        {t('auth.noAccount')}{' '}
                                        <Link
                                            href="/register"
                                            className="font-bold text-white transition hover:text-white/80"
                                        >
                                            {t('auth.createAccount')}
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                                {t('common.secureConnection')}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#9B4DFF]" />
                                SSL/TLS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {!isPwa && <PwaInstallPrompt />}
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
                {icon}
            </div>
            <div>
                <h3 className="text-sm font-black text-white">{title}</h3>
                <p className="text-sm text-white/60 font-medium">{desc}</p>
            </div>
        </div>
    );
}
