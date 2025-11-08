"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { http } from "@/lib/http";
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
                const data = await http.get<CustomerResponse>("/customers/me");

                console.log(data);
                setForm({
                    name: data.name ?? "",
                    cpf: data.cpf ?? "",
                    birthday: data.birthday ?? "",
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

            if (!customerId) {
                toast.error("Cliente não encontrado.");
                return;
            }

            // Atualiza os dados do cliente existente
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
                    neighborhood: form.neighborhood,
                    cityIbgeCode: Number(form.cityIbgeCode),
                },
            });

            toast.success("Dados atualizados com sucesso!");
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
            <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Carregando seus dados…
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold">
                        Verificação de Conta
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Complete suas informações pessoais e de endereço para ativar sua conta.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="grid grid-cols-2 w-full mb-6">
                                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="address">Endereço</TabsTrigger>
                            </TabsList>

                            {/* 🧍 Dados pessoais */}
                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid gap-3">
                                    <Label className="text-base">Nome completo</Label>
                                    <Input
                                        className="h-12 text-base"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base">CPF</Label>
                                        <Input
                                            className="h-12 text-base"
                                            value={form.cpf}
                                            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base">Data de Nascimento</Label>
                                        <Input
                                            type="date"
                                            className="h-12 text-base"
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
                                        <Label className="text-base">Telefone</Label>
                                        <Input
                                            className="h-12 text-base"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base">E-mail</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100"
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
                                    >
                                        Próximo: Endereço →
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* 🏠 Endereço */}
                            <TabsContent value="address" className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-base">CEP</Label>
                                        <Input
                                            className="h-12 text-base"
                                            value={form.zipCode}
                                            onChange={(e) =>
                                                setForm({ ...form, zipCode: e.target.value })
                                            }
                                            placeholder="00000-000"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-3 md:col-span-2">
                                        <Label className="text-base">Rua</Label>
                                        <Input
                                            className="h-12 text-base"
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
                                        <Label className="text-base">Número</Label>
                                        <Input
                                            className="h-12 text-base"
                                            value={form.number}
                                            onChange={(e) =>
                                                setForm({ ...form, number: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-3 md:col-span-2">
                                        <Label className="text-base">Bairro</Label>
                                        <Input
                                            className="h-12 text-base"
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
                                        <Label className="text-base">Cidade</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100"
                                            value={form.city}
                                            readOnly
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base">Estado (UF)</Label>
                                        <Input
                                            className="h-12 text-base bg-gray-100"
                                            value={form.state}
                                            readOnly
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-base">Código IBGE</Label>
                                        <Input
                                            className="h-12 text-base"
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
                                    >
                                        ← Voltar
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
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
