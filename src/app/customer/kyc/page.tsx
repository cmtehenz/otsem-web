"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { http } from "@/lib/http";
import { toast } from "sonner";
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

export default function CustomerKycPage(): React.JSX.Element {
    const router = useRouter();
    const { user } = useAuth();

    const [tab, setTab] = React.useState("personal");
    const [loading, setLoading] = React.useState(false);

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
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setLoading(true);
            await http.post("/customers/pf", {
                identifier: "customer-panel",
                productId: 1,
                name: form.name,
                cpf: form.cpf,
                birthday: form.birthday,
                phone: form.phone,
                email: form.email,
                address: {
                    zipCode: form.zipCode,
                    street: form.street,
                    number: form.number,
                    neighborhood: form.neighborhood,
                    cityIbgeCode: Number(form.cityIbgeCode),
                },
                pixLimits: {
                    singleTransfer: 1000,
                    daytime: 5000,
                    nighttime: 1000,
                    monthly: 50000,
                    serviceId: 8,
                },
            });
            toast.success("Verificação enviada para análise!");
            router.push("/customer/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Falha ao enviar dados.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Verificação de Conta</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Complete suas informações para ativar sua conta.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <Tabs value={tab} onValueChange={setTab}>
                            <TabsList className="grid grid-cols-2 w-full mb-4">
                                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="address">Endereço</TabsTrigger>
                            </TabsList>

                            {/* Aba 1 — Dados Pessoais */}
                            <TabsContent value="personal" className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nome completo</Label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        placeholder="Digite seu nome completo"
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>CPF</Label>
                                        <Input
                                            value={form.cpf}
                                            onChange={(e) =>
                                                setForm({ ...form, cpf: e.target.value })
                                            }
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Data de Nascimento</Label>
                                        <Input
                                            type="date"
                                            value={form.birthday}
                                            onChange={(e) =>
                                                setForm({ ...form, birthday: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Telefone</Label>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm({ ...form, phone: e.target.value })
                                            }
                                            placeholder="(00) 00000-0000"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>E-mail</Label>
                                        <Input value={form.email} disabled className="bg-gray-50" />
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

                            {/* Aba 2 — Endereço */}
                            <TabsContent value="address" className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>CEP</Label>
                                        <Input
                                            value={form.zipCode}
                                            onChange={(e) =>
                                                setForm({ ...form, zipCode: e.target.value })
                                            }
                                            placeholder="00000-000"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Rua</Label>
                                        <Input
                                            value={form.street}
                                            onChange={(e) =>
                                                setForm({ ...form, street: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Número</Label>
                                        <Input
                                            value={form.number}
                                            onChange={(e) =>
                                                setForm({ ...form, number: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>Bairro</Label>
                                        <Input
                                            value={form.neighborhood}
                                            onChange={(e) =>
                                                setForm({ ...form, neighborhood: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Código IBGE</Label>
                                    <Input
                                        value={form.cityIbgeCode}
                                        onChange={(e) =>
                                            setForm({ ...form, cityIbgeCode: e.target.value })
                                        }
                                        placeholder="Ex: 3550308"
                                        required
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setTab("personal")}
                                    >
                                        ← Voltar
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Enviando…" : "Concluir Verificação"}
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
