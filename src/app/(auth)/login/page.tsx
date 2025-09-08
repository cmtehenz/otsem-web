// src/app/(auth)/login/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema e tipos (sem any)
const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type LoginForm = z.infer<typeof loginSchema>;

// Alinha generics do RHF em qualquer versão
const loginResolver = zodResolver(loginSchema) as unknown as Resolver<LoginForm>;

export default function LoginPage(): JSX.Element {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: loginResolver,
        defaultValues: { email: "", password: "" },
    });

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        // DEMO: simula sucesso de login e redireciona
        // (Se tiver backend, troque por chamada real ao /auth/login)
        try {
            // Simulação de latência
            await new Promise<void>((r) => setTimeout(r, 400));

            // Armazena um “token” de demo
            if (typeof window !== "undefined") {
                localStorage.setItem("otsem_demo_token", "demo-token");
            }

            toast.success("Login realizado com sucesso!");
            router.push("/dashboard");
        } catch {
            toast.error("Falha no login");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Entrar no Otsem Bank
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" placeholder="voce@email.com" {...register("email")} />
                            {errors.email && (
                                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                            {errors.password && (
                                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Entrando…" : "Entrar"}
                        </Button>

                        <div className="text-center text-xs text-muted-foreground mt-2">
                            Ainda não tem conta?{" "}
                            <Link href="/register" className="underline">
                                Criar conta
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
