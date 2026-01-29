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
import { Eye, EyeOff, Mail, User, Lock, CheckCircle2, Shield, Zap, Globe2, Gift, Loader2, ArrowRight, ArrowLeft, Building2, IdCard } from "lucide-react";
import http from "@/lib/http";
import { setTokens } from "@/lib/token";
import { toast } from "sonner";

// CPF/CNPJ validation functions
function validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;
    if (checkDigit1 !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;
    if (checkDigit2 !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
}

function validateCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    let length = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, length);
    const digits = cleanCNPJ.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cleanCNPJ.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

// Formatting functions
function formatCPF(value: string): string {
    const clean = value.replace(/\D/g, '');
    const limited = clean.slice(0, 11);
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    if (limited.length <= 9) return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
}

function formatCNPJ(value: string): string {
    const clean = value.replace(/\D/g, '');
    const limited = clean.slice(0, 14);
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

const schema = z
    .object({
        name: z.string().min(3, "Informe seu nome").transform((v) => v.trim()),
        email: z.string().email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
        password: z.string().min(8, "Mínimo 8 caracteres"),
        confirm: z.string().min(8, "Confirme sua senha"),
        customerType: z.enum(["PF", "PJ"], { message: "Selecione o tipo de cadastro" }),
        cpf: z.string().optional(),
        cnpj: z.string().optional(),
        affiliateCode: z.string().optional().transform((v) => v?.trim().toUpperCase() || undefined),
        accept: z.literal(true, { message: "Aceite os termos para continuar" }),
    })
    .refine((v) => v.password === v.confirm, {
        message: "As senhas não conferem",
        path: ["confirm"],
    })
    .refine((v) => {
        if (v.customerType === "PF") {
            return !!v.cpf && v.cpf.replace(/\D/g, '').length > 0;
        }
        return true;
    }, {
        message: "CPF é obrigatório para Pessoa Física",
        path: ["cpf"],
    })
    .refine((v) => {
        if (v.customerType === "PF" && v.cpf) {
            return validateCPF(v.cpf);
        }
        return true;
    }, {
        message: "CPF inválido",
        path: ["cpf"],
    })
    .refine((v) => {
        if (v.customerType === "PJ") {
            return !!v.cnpj && v.cnpj.replace(/\D/g, '').length > 0;
        }
        return true;
    }, {
        message: "CNPJ é obrigatório para Pessoa Jurídica",
        path: ["cnpj"],
    })
    .refine((v) => {
        if (v.customerType === "PJ" && v.cnpj) {
            return validateCNPJ(v.cnpj);
        }
        return true;
    }, {
        message: "CNPJ inválido",
        path: ["cnpj"],
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
        const msg = obj.response?.data?.message ?? obj.message;
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
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirm: "",
            customerType: "PF",
            cpf: "",
            cnpj: "",
            affiliateCode: "",
            accept: true
        },
    });

    const [showAffiliateField, setShowAffiliateField] = React.useState(false);
    const [validatingCode, setValidatingCode] = React.useState(false);
    const [codeValid, setCodeValid] = React.useState<boolean | null>(null);
    const affiliateCode = form.watch("affiliateCode") || "";
    const customerType = form.watch("customerType");
    const cpfValue = form.watch("cpf") || "";
    const cnpjValue = form.watch("cnpj") || "";

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

            const payload: any = {
                email: v.email,
                password: v.password,
                name: v.name,
                type: v.customerType,
            };

            // Add document based on type
            if (v.customerType === "PF" && v.cpf) {
                payload.cpf = v.cpf.replace(/\D/g, '');
            } else if (v.customerType === "PJ" && v.cnpj) {
                payload.cnpj = v.cnpj.replace(/\D/g, '');
            }

            if (v.affiliateCode && codeValid) {
                payload.affiliateCode = v.affiliateCode;
            }

            const res = await http.post<{ access_token: string; role?: string }>(
                "/auth/register",
                payload,
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
                const msg = getHttpMessage(e);
                console.log("Backend error:", msg, e);
                if (msg.includes("cpf_already_registered")) {
                    form.setError("cpf", { message: "Este CPF já está cadastrado" });
                    toast.error("Este CPF já está cadastrado");
                } else if (msg.includes("invalid_cpf")) {
                    form.setError("cpf", { message: "CPF inválido" });
                    toast.error("CPF inválido");
                } else if (msg.includes("cnpj_already_registered")) {
                    form.setError("cnpj", { message: "Este CNPJ já está cadastrado" });
                    toast.error("Este CNPJ já está cadastrado");
                } else if (msg.includes("invalid_cnpj")) {
                    form.setError("cnpj", { message: "CNPJ inválido" });
                    toast.error("CNPJ inválido");
                } else {
                    toast.error(`Dados inválidos: ${msg}`);
                }
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

            <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl liquid-glass text-slate-900/70 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Voltar</span>
                    </motion.button>
                </Link>
            </div>

            <div className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:py-16 lg:px-8 xl:px-16">
                <div className="flex w-full max-w-6xl items-center gap-12 xl:gap-16">
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-6 lg:self-start lg:pt-16">
                        <div>
                            <h1 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tightest leading-tight">
                                Crie sua conta
                            </h1>
                            <p className="mt-2 text-sm xl:text-base text-slate-500 font-medium">
                                Cadastre-se para começar a operar.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <FeatureItem
                                icon={<CheckCircle2 className="h-4 w-4 xl:h-5 xl:w-5 text-emerald-500" />}
                                title="Registro rápido"
                                desc="Valide seu documento e comece a operar"
                            />
                            <FeatureItem
                                icon={<Zap className="h-4 w-4 xl:h-5 xl:w-5 text-yellow-500" />}
                                title="Limites progressivos"
                                desc="Aumente seus limites quando precisar"
                            />
                            <FeatureItem
                                icon={<Globe2 className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />}
                                title="Sem fronteiras"
                                desc="Opere de qualquer lugar"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 lg:max-w-md">
                        <Card className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] border-white/40 rich-glass">
                            <CardHeader className="space-y-2 border-b border-black/[0.03] pb-3.5 sm:pb-4 pt-4 sm:pt-5">
                                <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center overflow-hidden">
                                    <img
                                        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/8dca9fc2-17fe-42a1-b323-5e4a298d9904/Untitled-1769589355434.png?width=8000&height=8000&resize=contain"
                                        alt="Otsem Pay"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <CardTitle className="text-center text-lg sm:text-xl font-black text-slate-900">
                                    Criar conta
                                </CardTitle>
                                <p className="text-center text-xs text-slate-500 font-medium">
                                    Preencha os dados para comecar
                                </p>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-5 md:p-6">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 sm:gap-3.5" noValidate>

                                    {/* Customer Type Selection */}
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs sm:text-sm font-black text-slate-900">
                                            Tipo de cadastro
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className={`flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-3 sm:p-4 cursor-pointer transition ${
                                                customerType === "PF"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-black/[0.05] bg-white/60 hover:bg-white/80"
                                            }`}>
                                                <input
                                                    type="radio"
                                                    value="PF"
                                                    className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                                                    {...form.register("customerType")}
                                                />
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                                        Pessoa Física
                                                    </span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border p-3 sm:p-4 cursor-pointer transition ${
                                                customerType === "PJ"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-black/[0.05] bg-white/60 hover:bg-white/80"
                                            }`}>
                                                <input
                                                    type="radio"
                                                    value="PJ"
                                                    className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                                                    {...form.register("customerType")}
                                                />
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                                        Pessoa Jurídica
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                        {form.formState.errors.customerType && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.customerType.message}</p>
                                        )}
                                    </div>

                                    {/* Full Name */}
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name" className="text-xs sm:text-sm font-black text-slate-900">
                                            Nome completo
                                        </Label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="name"
                                                className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="Seu nome completo"
                                                {...form.register("name")}
                                            />
                                        </div>
                                        {form.formState.errors.name && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* CPF Field (only for PF) */}
                                    {customerType === "PF" && (
                                        <div className="grid gap-1.5 sm:gap-2">
                                            <Label htmlFor="cpf" className="text-xs sm:text-sm font-black text-slate-900">
                                                CPF
                                            </Label>
                                            <div className="relative">
                                                <IdCard className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <Input
                                                    id="cpf"
                                                    inputMode="numeric"
                                                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    placeholder="000.000.000-00"
                                                    value={cpfValue}
                                                    onChange={(e) => {
                                                        const formatted = formatCPF(e.target.value);
                                                        form.setValue("cpf", formatted);
                                                    }}
                                                />
                                            </div>
                                            {form.formState.errors.cpf && (
                                                <p className="text-xs text-red-500 font-medium">{form.formState.errors.cpf.message}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* CNPJ Field (only for PJ) */}
                                    {customerType === "PJ" && (
                                        <div className="grid gap-1.5 sm:gap-2">
                                            <Label htmlFor="cnpj" className="text-xs sm:text-sm font-black text-slate-900">
                                                CNPJ
                                            </Label>
                                            <div className="relative">
                                                <Building2 className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <Input
                                                    id="cnpj"
                                                    inputMode="numeric"
                                                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    placeholder="00.000.000/0000-00"
                                                    value={cnpjValue}
                                                    onChange={(e) => {
                                                        const formatted = formatCNPJ(e.target.value);
                                                        form.setValue("cnpj", formatted);
                                                    }}
                                                />
                                            </div>
                                            {form.formState.errors.cnpj && (
                                                <p className="text-xs text-red-500 font-medium">{form.formState.errors.cnpj.message}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="grid gap-1.5 sm:gap-2">
                                        <Label htmlFor="email" className="text-xs sm:text-sm font-black text-slate-900">
                                            E-mail
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                inputMode="email"
                                                autoComplete="email"
                                                className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                placeholder="voce@exemplo.com"
                                                {...form.register("email")}
                                            />
                                        </div>
                                        {form.formState.errors.email && (
                                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    {/* Password Fields - 2 columns on desktop */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="password" className="text-xs sm:text-sm font-black text-slate-900">
                                                Senha
                                            </Label>
                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <Input
                                                    id="password"
                                                    type={showPw ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-10 sm:pr-11 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Minimo 8 caracteres"
                                                    {...form.register("password")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPw((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900 p-1 touch-manipulation"
                                                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                                >
                                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {form.formState.errors.password && (
                                                <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="confirm" className="text-xs sm:text-sm font-black text-slate-900">
                                                Confirmar senha
                                            </Label>
                                            <div className="relative">
                                                <Lock className="pointer-events-none absolute left-3 sm:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <Input
                                                    id="confirm"
                                                    type={showConfirm ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/60 pl-9 sm:pl-10 pr-10 sm:pr-11 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Repita a senha"
                                                    {...form.register("confirm")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900 p-1 touch-manipulation"
                                                    aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                                                >
                                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {form.formState.errors.confirm && (
                                                <p className="text-xs text-red-500 font-medium">{form.formState.errors.confirm.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Password strength indicator */}
                                    {pw && (
                                        <div className="mt-[-0.5rem]">
                                            <div className="flex gap-1">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all ${i <= score
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
                                            <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
                                                Forca:{" "}
                                                <span
                                                    className={`font-bold ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-500" : "text-emerald-500"}`}
                                                >
                                                    {scoreText}
                                                </span>
                                            </p>
                                        </div>
                                    )}

                                    <label className="flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-black/[0.05] bg-white/60 p-2.5 sm:p-3 text-xs sm:text-sm transition hover:bg-white/80 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-black/10 bg-white/60 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                            {...form.register("accept")}
                                        />
                                        <span className="text-slate-500 font-medium leading-relaxed">
                                            Aceito os{" "}
                                            <a
                                                className="font-bold text-primary hover:underline"
                                                href="https://drive.google.com/file/d/1w5iM6U1BRHhKemNVXcKiEc1TJ1YjqFCu/view?usp=share_link"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                termos de uso
                                            </a>{" "}
                                            e a{" "}
                                            <a
                                                className="font-bold text-primary hover:underline"
                                                href="https://drive.google.com/file/d/1X0RHbjkm9uG9k_v7wqBIKMVWkbKI8Qcv/view?usp=share_link"
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
                                            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-dashed border-black/10 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-500 transition hover:border-primary/50 hover:text-primary font-medium touch-manipulation"
                                        >
                                            <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Tenho um codigo de indicacao
                                        </button>
                                    ) : (
                                        <div className="grid gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-primary/30 bg-primary/5 p-2.5 sm:p-3">
                                            <Label htmlFor="affiliateCode" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-black text-slate-900">
                                                <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                                                Codigo de indicacao
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="affiliateCode"
                                                    className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-black/[0.05] bg-white/80 pr-10 sm:pr-11 text-sm sm:text-base text-slate-900 uppercase placeholder:text-slate-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                                        className="btn-premium h-11 sm:h-12 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base disabled:opacity-50 touch-manipulation"
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Criando conta...' : 'Criar conta'}
                                        {!loading && <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    </motion.button>

                                    <Separator className="my-1.5 sm:my-2 bg-black/[0.03]" />

                                    <p className="text-center text-xs sm:text-sm text-slate-500 font-medium">
                                        Ja tem uma conta?{" "}
                                        <Link
                                            href="/login"
                                            className="font-bold text-primary transition hover:text-primary/80 touch-manipulation"
                                        >
                                            Entrar
                                        </Link>
                                    </p>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500 flex-shrink-0" />
                                <span>Conexao segura</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
                                <span>Registro verificado</span>
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
        <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 xl:h-9 xl:w-9 shrink-0 items-center justify-center rounded-xl xl:rounded-2xl bg-white/60 border border-black/[0.05] shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-xs xl:text-sm font-black text-slate-900">{title}</h3>
                <p className="text-xs xl:text-sm text-slate-500 font-medium leading-snug">{desc}</p>
            </div>
        </div>
    );
}
