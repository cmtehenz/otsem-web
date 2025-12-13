"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";
import { fetchCep, isValidCep, onlyDigits } from "@/lib/cep";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    ShieldQuestion,
    User,
    MapPin,
    Camera,
    CheckCircle2,
    ExternalLink,
    RefreshCw,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";

interface CustomerAddress {
    zipCode: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    cityIbgeCode: string;
    city?: string;
    state?: string;
}

interface CustomerResponse {
    id: string;
    type: "PF" | "PJ";
    accountStatus: "not_requested" | "in_review" | "approved" | "rejected";
    name?: string;
    cpf?: string;
    birthday?: string;
    phone?: string;
    email: string;
    address?: CustomerAddress;
    createdAt: string;
}

type Step = "personal" | "address" | "identity";

const steps = [
    { id: "personal", label: "Dados Pessoais", icon: User },
    { id: "address", label: "Endereço", icon: MapPin },
    { id: "identity", label: "Verificação", icon: Camera },
] as const;

const statusConfig = {
    approved: {
        icon: ShieldCheck,
        title: "Identidade Verificada",
        description: "Sua identidade foi verificada com sucesso!",
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
    },
    in_review: {
        icon: ShieldQuestion,
        title: "Em Análise",
        description: "Sua verificação está sendo processada.",
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
    },
    rejected: {
        icon: ShieldAlert,
        title: "Verificação Rejeitada",
        description: "Tente novamente com documentos válidos.",
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
    },
    not_requested: {
        icon: ShieldAlert,
        title: "Pendente",
        description: "Complete a verificação de identidade.",
        color: "text-amber-400",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-500/30",
    },
};

export default function CustomerKycPage(): React.JSX.Element {
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = React.useState<Step>("personal");
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [startingVerification, setStartingVerification] = React.useState(false);
    const [customerId, setCustomerId] = React.useState<string | null>(null);
    const [accountStatus, setAccountStatus] = React.useState<CustomerResponse["accountStatus"]>("not_requested");

    const [form, setForm] = React.useState({
        name: "",
        cpf: "",
        birthday: "",
        phone: "",
        email: user?.email ?? "",
        zipCode: "",
        street: "",
        number: "",
        neighborhood: "",
        cityIbgeCode: "",
        city: "",
        state: "",
    });

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                const response = await http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me");
                const data = "data" in response.data ? response.data.data : response.data;

                setForm({
                    name: data.name ?? "",
                    cpf: data.cpf ?? "",
                    birthday: data.birthday ? data.birthday.split("T")[0] : "",
                    phone: data.phone ?? "",
                    email: data.email ?? user?.email ?? "",
                    zipCode: data.address?.zipCode ?? "",
                    street: data.address?.street ?? "",
                    number: data.address?.number ?? "",
                    neighborhood: data.address?.neighborhood ?? "",
                    cityIbgeCode: data.address?.cityIbgeCode ?? "",
                    city: data.address?.city ?? "",
                    state: data.address?.state ?? "",
                });

                setCustomerId(data.id);
                setAccountStatus(data.accountStatus);
            } catch (err) {
                console.error(err);
                toast.error("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        }

        if (user) void loadCustomer();
    }, [user]);

    React.useEffect(() => {
        const controller = new AbortController();

        async function handleCepLookup() {
            const cep = onlyDigits(form.zipCode);
            if (!isValidCep(cep)) return;

            try {
                const data = await fetchCep(cep, controller.signal);
                setForm((f) => ({
                    ...f,
                    street: data.logradouro ?? f.street,
                    neighborhood: data.bairro ?? f.neighborhood,
                    cityIbgeCode: data.ibge ?? f.cityIbgeCode,
                    city: data.localidade ?? f.city,
                    state: data.uf ?? f.state,
                }));
                toast.success("Endereço preenchido!");
            } catch {
                // Silently ignore CEP lookup errors
            }
        }

        if (form.zipCode.length >= 8) {
            void handleCepLookup();
        }

        return () => controller.abort();
    }, [form.zipCode]);

    async function saveData() {
        if (!customerId) return false;

        try {
            setSubmitting(true);
            await http.patch(`/customers/${customerId}`, {
                name: form.name,
                cpf: onlyDigits(form.cpf),
                birthday: form.birthday,
                phone: form.phone,
                email: form.email,
                address: {
                    zipCode: onlyDigits(form.zipCode),
                    street: form.street,
                    number: form.number,
                    city: form.city,
                    state: form.state,
                    neighborhood: form.neighborhood,
                    cityIbgeCode: Number(form.cityIbgeCode),
                },
            });
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Falha ao salvar dados.");
            return false;
        } finally {
            setSubmitting(false);
        }
    }

    async function handleNextStep() {
        if (step === "personal") {
            if (!form.name || !form.cpf || !form.birthday || !form.phone) {
                toast.error("Preencha todos os campos obrigatórios.");
                return;
            }
            setStep("address");
        } else if (step === "address") {
            if (!form.zipCode || !form.street || !form.neighborhood || !form.cityIbgeCode) {
                toast.error("Preencha todos os campos obrigatórios.");
                return;
            }
            const saved = await saveData();
            if (saved) {
                toast.success("Dados salvos!");
                setStep("identity");
            }
        }
    }

    async function startVerification() {
        if (!customerId) return;

        try {
            setStartingVerification(true);

            const response = await http.post<{ verificationUrl: string }>(
                `/customers/${customerId}/kyc/request`
            );

            const verificationUrl = response.data?.verificationUrl;

            if (verificationUrl) {
                window.open(verificationUrl, "_blank");
                toast.success("Complete a verificação na nova aba.");
                setAccountStatus("in_review");
            } else {
                throw new Error("URL de verificação não recebida");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Erro ao iniciar verificação");
        } finally {
            setStartingVerification(false);
        }
    }

    async function refreshStatus() {
        if (!customerId) return;
        
        try {
            const response = await http.get<{ accountStatus: CustomerResponse["accountStatus"] }>(
                `/customers/${customerId}/kyc/status`
            );
            setAccountStatus(response.data.accountStatus);
            toast.success("Status atualizado!");
        } catch {
            toast.error("Erro ao atualizar status");
        }
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="text-sm text-white/60 mt-4">Carregando...</p>
            </div>
        );
    }

    const currentStepIndex = steps.findIndex((s) => s.id === step);
    const statusInfo = statusConfig[accountStatus];
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Verificação de Conta</h1>
                    <p className="text-white/50 text-sm mt-1">
                        Complete seus dados para ativar sua conta
                    </p>
                </div>
                {step === "identity" && (
                    <Button
                        variant="ghost"
                        onClick={refreshStatus}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between bg-[#1a1025] border border-white/10 rounded-2xl p-4">
                {steps.map((s, index) => {
                    const Icon = s.icon;
                    const isActive = s.id === step;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <React.Fragment key={s.id}>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isCompleted
                                            ? "bg-green-500/20"
                                            : isActive
                                            ? "bg-violet-500/20"
                                            : "bg-white/5"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <Icon
                                            className={`w-5 h-5 ${
                                                isActive ? "text-violet-400" : "text-white/30"
                                            }`}
                                        />
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-medium hidden sm:block ${
                                        isActive ? "text-white" : "text-white/40"
                                    }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-4 ${
                                        isCompleted ? "bg-green-500/50" : "bg-white/10"
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-6">
                {step === "personal" && (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white/70">Nome completo</Label>
                            <Input
                                className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white/70">CPF</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.cpf}
                                    onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Data de Nascimento</Label>
                                <Input
                                    type="date"
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.birthday}
                                    onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white/70">Telefone</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">E-mail</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white/60"
                                    value={form.email}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleNextStep}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-8"
                            >
                                Próximo
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === "address" && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-white/70">CEP</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.zipCode}
                                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-white/70">Rua</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.street}
                                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-white/70">Número</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.number}
                                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-white/70">Bairro</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.neighborhood}
                                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-white/70">Cidade</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white/60"
                                    value={form.city}
                                    readOnly
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Estado</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white/60"
                                    value={form.state}
                                    readOnly
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Código IBGE</Label>
                                <Input
                                    className="mt-1.5 h-12 border-white/10 bg-white/5 text-white"
                                    value={form.cityIbgeCode}
                                    onChange={(e) => setForm({ ...form, cityIbgeCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setStep("personal")}
                                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                            <Button
                                onClick={handleNextStep}
                                disabled={submitting}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-8"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {step === "identity" && (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-xl border ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${statusInfo.bgColor}`}>
                                    <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                                        {statusInfo.title}
                                    </h3>
                                    <p className="text-white/60 mt-1">{statusInfo.description}</p>
                                </div>
                            </div>
                        </div>

                        {accountStatus === "approved" && (
                            <div className="text-center py-6">
                                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <p className="text-white font-medium mb-2">Tudo certo!</p>
                                <p className="text-white/60 text-sm mb-6">
                                    Sua conta está verificada e você tem acesso completo.
                                </p>
                                <Button
                                    onClick={() => router.push("/customer/dashboard")}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                                >
                                    Ir para Dashboard
                                </Button>
                            </div>
                        )}

                        {accountStatus === "in_review" && (
                            <div className="text-center py-6">
                                <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
                                <p className="text-white font-medium mb-2">Aguardando análise</p>
                                <p className="text-white/60 text-sm">
                                    Sua verificação está sendo processada. Isso pode levar alguns minutos.
                                </p>
                            </div>
                        )}

                        {(accountStatus === "not_requested" || accountStatus === "rejected") && (
                            <>
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium">O que você vai precisar:</h4>
                                    <div className="grid gap-3">
                                        {[
                                            "Documento de identidade válido (RG, CNH ou Passaporte)",
                                            "Boa iluminação para tirar as fotos",
                                            "Alguns minutos para completar o processo",
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-sm font-medium">
                                                    {i + 1}
                                                </div>
                                                <span className="text-white/70 text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep("address")}
                                        className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Voltar
                                    </Button>
                                    <Button
                                        onClick={startVerification}
                                        disabled={startingVerification}
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold"
                                    >
                                        {startingVerification ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Iniciando...
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                {accountStatus === "rejected"
                                                    ? "Tentar Novamente"
                                                    : "Iniciar Verificação"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-violet-400 font-medium text-sm">Seus dados estão seguros</p>
                    <p className="text-white/60 text-sm mt-1">
                        A verificação é realizada por uma empresa certificada em segurança de dados.
                        Suas informações são criptografadas e protegidas.
                    </p>
                </div>
            </div>
        </div>
    );
}
