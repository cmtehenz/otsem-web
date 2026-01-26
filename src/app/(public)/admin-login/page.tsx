"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Shield, ShieldCheck, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
const loginResolver = zodResolver(loginSchema) as unknown as Resolver<LoginForm>;

export default function AdminLoginPage() {
    const router = useRouter();
    const { login, user } = useAuth();
    const [showPw, setShowPw] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: loginResolver,
        defaultValues: { email: "", password: "" },
    });

    React.useEffect(() => {
        if (user) {
            if (user.role === "ADMIN") {
                router.replace("/admin/dashboard");
            } else {
                toast.error("Acesso restrito a administradores");
                router.replace("/customer/dashboard");
            }
        }
    }, [user, router]);

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
            await login(values.email, values.password);
            toast.success("Bem-vindo, Administrador!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha no login";
            toast.error(message);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-800/50 via-slate-900/30 to-transparent blur-3xl" />
                <div className="absolute top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-red-900/20 to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-slate-800/30 to-transparent blur-3xl" />
            </div>

            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/logo.png" alt="OtsemPay" className="h-10 w-10 object-contain" />
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-amber-400">Otsem</span>
                            <span className="text-slate-400">Admin</span>
                        </span>
                    </Link>
                    
                    <Link href="/login">
                        <Button variant="outline" className="rounded-full border-white/10 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white">
                            Área do Cliente
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-24">
                <div className="w-full max-w-md">
                    <Card className="overflow-hidden rounded-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="space-y-4 border-b border-white/5 bg-gradient-to-r from-slate-800/50 to-slate-900/50 pb-6 pt-8">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/25">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-center">
                                <CardTitle className="text-2xl font-bold text-white">
                                    Painel Administrativo
                                </CardTitle>
                                <p className="mt-2 text-sm text-white/50">
                                    Acesso restrito a administradores
                                </p>
                            </div>
                        </CardHeader>

                        <CardContent className="p-6 sm:p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-white/80">
                                        E-mail do administrador
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            inputMode="email"
                                            placeholder="admin@otsempay.com"
                                            className="h-12 rounded-xl border-white/10 bg-slate-800/50 pl-10 text-white placeholder:text-white/30 transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                            aria-invalid={!!errors.email || undefined}
                                            {...register("email")}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-400">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-white/80">
                                        Senha
                                    </Label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <Input
                                            id="password"
                                            type={showPw ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-12 rounded-xl border-white/10 bg-slate-800/50 pl-10 pr-10 text-white placeholder:text-white/30 transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                            aria-invalid={!!errors.password || undefined}
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                                            aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-400">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-2 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 font-semibold text-white shadow-lg shadow-red-500/25 transition hover:from-red-500 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-50"
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? "Verificando..." : "Acessar Painel"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            Conexão criptografada
                        </div>
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-red-400" />
                            Acesso monitorado
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-white/30">
                        Todas as tentativas de acesso são registradas.
                        <br />
                        Uso não autorizado é proibido.
                    </p>
                </div>
            </div>
        </div>
    );
}
