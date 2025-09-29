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
import { apiPost } from "@/lib/api";

const schema = z.object({
    email: z.string().email("E-mail inválido"),
});
type FormValues = z.infer<typeof schema>;
const resolver = zodResolver(schema) as unknown as Resolver<FormValues>;

export default function ForgotPage() {
    const router = useRouter();
    // const sp = useSearchParams();
    // const next = sp.get("next") || "/login";

    const {
        register, handleSubmit, formState: { errors, isSubmitting }
    } = useForm<FormValues>({ resolver, defaultValues: { email: "" } });

    const [resetUrl, setResetUrl] = React.useState<string | null>(null);

    async function onSubmit(v: FormValues) {
        try {
            const res = await apiPost<{ ok: true; resetUrl?: string }>("/auth/forgot", { email: v.email });
            setResetUrl(res.resetUrl ?? null);
            toast.success("Se o e-mail existir, enviaremos as instruções.");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falha ao solicitar recuperação");
        }
    }

    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <Card className="w-full max-w-md rounded-2xl shadow-lg shadow-indigo-100/70 dark:shadow-indigo-900/10">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <CardTitle className="text-xl">Recuperar senha</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground px-2">Digite seu e-mail para receber o link de redefinição.</p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando…" : "Enviar link"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Lembrou a senha?{" "}
                                <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                                    Entrar
                                </Link>
                            </p>

                            {resetUrl && (
                                <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm">
                                    <div className="mb-1 font-medium">Link de redefinição (demo):</div>
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
