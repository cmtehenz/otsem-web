"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import { toast } from "sonner";
import { fetchCep, isValidCep, onlyDigits } from "@/lib/cep"; // ✅ importa suas funções

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

export default function CustomerKycPage(): React.JSX.Element {
    const router = useRouter();
    const { user } = useAuth();

    const [tab, setTab] = React.useState("personal");
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [customerId, setCustomerId] = React.useState<string | null>(null);

    console.log(customerId)

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

    // 🔹 Busca dados do cliente
    React.useEffect(() => {
        async function loadCustomer() {
            try {
                setLoading(true);
                // Agora usamos o endpoint autenticado
                const response = await http.get<CustomerResponse>("/customers/me");
                const data = response.data;

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
            } catch (err) {
                console.error(err);
                toast.error("Não foi possível carregar os dados do cliente.");
            } finally {
                setLoading(false);
            }
        }

        // Só carrega se houver usuário autenticado
        if (user) void loadCustomer();

    }, [user]);




    // 🔹 Busca CEP e preenche endereço automaticamente
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
                toast.success("Endereço preenchido automaticamente!");
            } catch (err) {
                console.error(err);
                toast.error("CEP não encontrado ou inválido.");
            }
        }

        if (form.zipCode.length >= 8) {
            void handleCepLookup();
        }

        return () => controller.abort();
    }, [form.zipCode]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setSubmitting(true);

            // 1) Carrega para pegar o ID
            const me = await http.get<{ success: boolean; data: CustomerResponse } | CustomerResponse>("/customers/me");
            const responseData = me.data;
            const customerIdValue =
                "data" in responseData && responseData.data
                    ? (responseData as { success: boolean; data: CustomerResponse }).data.id
                    : (responseData as CustomerResponse).id;
            if (!customerIdValue) {
                toast.error("Cliente não encontrado.");
                return;
            }
            // Atualiza os dados do cliente existente
            await http.patch(`/customers/${customerIdValue}`, {
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

            // 3) Submete para análise (muda status para in_review)
            await http.post("/customers/submit-kyc", {});

            toast.success("Verificação enviada! Sua conta está em análise.");
            router.push("/customer/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Falha ao salvar as alterações.");
        } finally {
            setSubmitting(false);
        }
    }


    if (loading)
        return (
            <div className="flex h-[70vh] items-center justify-center text-[#b852ff]">
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Carregando seus dados…
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl shadow-md bg-[#faffff] border border-[#b852ff]/10">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-[#b852ff]">
                        Verificação de Conta
                    </CardTitle>
                    <p className="text-sm text-[#000000]/60">
                        Complete suas informações pessoais e de endereço para ativar sua conta.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="grid grid-cols-2 w-full mb-6 bg-[#faffff] border border-[#b852ff]/10 rounded-lg">
                                <TabsTrigger
                                    value="personal"
                                    className={tab === "personal"
                                        ? "bg-[#b852ff] text-[#000000] font-semibold"
                                        : "text-[#b852ff] hover:bg-[#f8bc07]/30"}
                                >
                                    Dados Pessoais
                                </TabsTrigger>
                                <TabsTrigger
                                    value="address"
                                    className={tab === "address"
                                        ? "bg-[#b852ff] text-[#000000] font-semibold"
                                        : "text-[#b852ff] hover:bg-[#f8bc07]/30"}
                                >
                                    Endereço
                                </TabsTrigger>
                            </TabsList>

                            {/* 🧍 Dados pessoais */}
                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid gap-3">
                                    <Label className="text-base text-[#000000]">Nome completo</Label>
                                    <Input
                                        className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">CPF</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.cpf}
                                            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Data de Nascimento</Label>
                                        <Input
                                            type="date"
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.birthday}
                                            onChange={(e) =>
                                                setForm({ ...form, birthday: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Telefone</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">E-mail</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100 text-[#000000]/70"
                                            value={form.email}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => setTab("address")}
                                        variant="outline"
                                        className="border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                                    >
                                        Próximo: Endereço →
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* 🏠 Endereço */}
                            <TabsContent value="address" className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">CEP</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.zipCode}
                                            onChange={(e) =>
                                                setForm({ ...form, zipCode: e.target.value })
                                            }
                                            placeholder="00000-000"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3 md:col-span-2">
                                        <Label className="text-base text-[#000000]">Rua</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.street}
                                            onChange={(e) =>
                                                setForm({ ...form, street: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Número</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.number}
                                            onChange={(e) =>
                                                setForm({ ...form, number: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-3 md:col-span-2">
                                        <Label className="text-base text-[#000000]">Bairro</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.neighborhood}
                                            onChange={(e) =>
                                                setForm({ ...form, neighborhood: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Cidade</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100 text-[#000000]/70"
                                            value={form.city}
                                            readOnly
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Estado (UF)</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100 text-[#000000]/70"
                                            value={form.state}
                                            readOnly
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base text-[#000000]">Código IBGE</Label>
                                        <Input
                                            className="h-12 text-base border border-[#b852ff]/30 text-[#000000] bg-[#faffff]"
                                            value={form.cityIbgeCode}
                                            onChange={(e) =>
                                                setForm({ ...form, cityIbgeCode: e.target.value })
                                            }
                                            placeholder="Ex: 3550308"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setTab("personal")}
                                        className="border-[#b852ff] text-[#b852ff] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                                    >
                                        ← Voltar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-[#f8bc07] text-[#000000] hover:bg-[#b852ff] hover:text-[#faffff] transition"
                                    >
                                        {submitting ? "Enviando…" : "Concluir Verificação"}
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
