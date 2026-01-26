"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import http from "@/lib/http";

// Evita cache estático nessa página sensível
export const dynamic = "force-dynamic";

// Flag de dev para exibir resetUrl retornada pela API
const SHOW_RESET_URL =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SHOW_RESET_URL === "true";

const schema = z
    .object({
        email: z
            .string()
            .min(1, "Informe seu e-mail")
            .email("E-mail inválido")
            .transform((v) => v.trim().toLowerCase()),
        // Honeypot invisível (bots costumam preencher)
        hp: z.string().optional().refine((v) => !v, { message: "bot" }),
    })
    .strict();

type FormValues = z.infer<typeof schema>;
const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

export default function ForgotPage(): React.JSX.Element {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormValues>({
        resolver,
        defaultValues: { email: "", hp: "" },
    });

    const [resetUrl, setResetUrl] = React.useState<string | null>(null);
    const [cooldown, setCooldown] = React.useState<number>(0);

    // simples cooldown (30s) pós envio para evitar spam
    React.useEffect(() => {
        if (!cooldown) return;
        const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    async function onSubmit(v: FormValues): Promise<void> {
        // se o honeypot veio preenchido, silenciosamente "sucesso" (evita feedback a bot)
        if (v.hp) {
            toast.success("Se o e-mail existir, enviaremos as instruções.");
            return;
        }

        try {
            const res = await http.post<{ ok: true; resetUrl?: string }>(
                "/auth/forgot",
                { email: v.email },
            );

            // em dev podemos exibir a URL de reset, em prod mantemos resposta neutra
            setResetUrl(SHOW_RESET_URL ? res.data.resetUrl ?? null : null);

            // mensagem neutra (não revela se o email existe)
            toast.success("Se o e-mail existir, enviaremos as instruções.");
            // trava novo envio por 30s
            setCooldown(30);
        } catch (e: unknown) {
            if (e && typeof e === "object" && "response" in e) {
                const axiosErr = e as { response?: { status?: number }; message?: string };
                const status = axiosErr.response?.status ?? 0;

                if (status === 429) {
                    setCooldown((c) => (c > 0 ? c : 60));
                    toast.error("Muitas tentativas. Tente novamente em instantes.");
                } else if (status === 400) {
                    setError("email", { message: "Verifique o e-mail informado." });
                    toast.error("Não foi possível processar sua solicitação.");
                } else {
                    toast.error(axiosErr.message ?? "Falha ao solicitar recuperação");
                }
            } else if (e instanceof Error) {
                toast.error(e.message);
            } else {
                toast.error("Falha ao solicitar recuperação.");
            }
        }
    }

    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <Card className="w-full max-w-md rounded-2xl shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                aria-label="Voltar"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <CardTitle className="text-xl">Recuperar senha</CardTitle>
                        </div>
                        <p className="px-2 text-sm text-muted-foreground">
                            Digite seu e-mail para receber o link de redefinição.
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            {/* Honeypot oculto */}
                            <div className="sr-only">
                                <Label htmlFor="hp">Deixe em branco</Label>
                                <Input id="hp" tabIndex={-1} autoComplete="off" {...register("hp")} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="voce@email.com"
                                        className="pl-9"
                                        aria-invalid={!!errors.email || undefined}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || cooldown > 0}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Enviando…"
                                    : cooldown > 0
                                        ? `Aguardar ${cooldown}s`
                                        : "Enviar link"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Lembrou a senha?{" "}
                                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                                    Entrar
                                </Link>
                            </p>

                            {SHOW_RESET_URL && resetUrl && (
                                <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm">
                                    <div className="mb-1 font-medium">Link de redefinição (DEV):</div>
                                    <button
                                        type="button"
                                        onClick={() => (window.location.href = resetUrl)}
                                        className="truncate font-mono text-indigo-600 underline underline-offset-2"
                                        title={resetUrl}
                                    >
                                        {resetUrl}
                                    </button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
