"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import http from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCep, isValidCep, onlyDigits } from "@/lib/cep";

const schema = z.object({
    identifier: z.string().min(1, "Identificador obrigatório"),
    name: z.string().min(3, "Nome completo obrigatório"),
    socialName: z.string().optional(),
    cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
    birthday: z.string().min(10, "Data de nascimento obrigatória"),
    phone: z.string().min(10, "Telefone obrigatório"),
    email: z.string().email("E-mail inválido"),
    genderId: z.enum(["1", "2"]).optional(),

    zipCode: z.string().min(8, "CEP obrigatório"),
    street: z.string().min(3, "Rua obrigatória"),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro obrigatório"),
    cityIbgeCode: z.string().min(7, "Código IBGE obrigatório"),

    singleTransfer: z.number().min(0),
    daytime: z.number().min(0),
    nighttime: z.number().min(0),
    monthly: z.number().min(0),
    serviceId: z.enum(["1", "8"]),
});

type FormValues = z.infer<typeof schema>;

export default function NewAccreditationPFPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            identifier: "",
            name: "",
            socialName: "",
            cpf: "",
            birthday: "",
            phone: "",
            email: "",
            genderId: "1",
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            cityIbgeCode: "",
            singleTransfer: 5000,
            daytime: 5000,
            nighttime: 1000,
            monthly: 20000,
            serviceId: "1",
        },
    });

    // Auto-preenche endereço ao digitar CEP
    const zipCode = form.watch("zipCode");
    React.useEffect(() => {
        if (!isValidCep(zipCode)) return;
        const controller = new AbortController();

        (async () => {
            try {
                const data = await fetchCep(zipCode, controller.signal);
                form.setValue("street", data.logradouro);
                form.setValue("neighborhood", data.bairro);
                form.setValue("cityIbgeCode", data.ibge);
            } catch (err) {
                console.error(err);
            }
        })();

        return () => controller.abort();
    }, [zipCode, form]);

    async function onSubmit(values: FormValues) {
        try {
            setSubmitting(true);

            const payload = {
                identifier: values.identifier,
                productId: 1,
                person: {
                    name: values.name,
                    socialName: values.socialName || undefined,
                    cpf: onlyDigits(values.cpf),
                    birthday: values.birthday,
                    phone: onlyDigits(values.phone),
                    email: values.email,
                    genderId: values.genderId ? Number(values.genderId) : undefined,
                    address: {
                        zipCode: onlyDigits(values.zipCode),
                        street: values.street,
                        number: values.number || undefined,
                        complement: values.complement || undefined,
                        neighborhood: values.neighborhood,
                        cityIbgeCode: Number(values.cityIbgeCode),
                    },
                },
                pixLimits: {
                    singleTransfer: values.singleTransfer,
                    daytime: values.daytime,
                    nighttime: values.nighttime,
                    monthly: values.monthly,
                    serviceId: Number(values.serviceId),
                },
            };

            await http.post("/customers/pf", payload);
            toast.success("Credenciamento PF solicitado com sucesso!");
            router.push("/admin/kyc");
        } catch (err) {
            console.error(err);
            toast.error("Falha ao enviar credenciamento");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/kyc")}
                >
                    <ArrowLeft className="mr-1 size-4" /> Voltar
                </Button>
                <h1 className="text-2xl font-bold">Credenciar Pessoa Física</h1>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Identificador */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identificador</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label>Identificador único *</Label>
                        <Input {...form.register("identifier")} placeholder="ex: PF_12345" />
                        {form.formState.errors.identifier && (
                            <p className="text-sm text-red-600">{form.formState.errors.identifier.message}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Dados Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Nome completo *</Label>
                            <Input {...form.register("name")} />
                        </div>
                        <div>
                            <Label>Nome social</Label>
                            <Input {...form.register("socialName")} />
                        </div>
                        <div>
                            <Label>CPF *</Label>
                            <Input {...form.register("cpf")} placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <Label>Data de nascimento *</Label>
                            <Input type="date" {...form.register("birthday")} />
                        </div>
                        <div>
                            <Label>Telefone *</Label>
                            <Input {...form.register("phone")} placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <Label>E-mail *</Label>
                            <Input type="email" {...form.register("email")} />
                        </div>
                        <div>
                            <Label>Gênero</Label>
                            <Select onValueChange={(v) => form.setValue("genderId", v as "1" | "2")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Masculino</SelectItem>
                                    <SelectItem value="2">Feminino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Endereço */}
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label>CEP *</Label>
                            <Input {...form.register("zipCode")} placeholder="00000-000" />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Rua *</Label>
                            <Input {...form.register("street")} />
                        </div>
                        <div>
                            <Label>Número</Label>
                            <Input {...form.register("number")} />
                        </div>
                        <div>
                            <Label>Complemento</Label>
                            <Input {...form.register("complement")} />
                        </div>
                        <div>
                            <Label>Bairro *</Label>
                            <Input {...form.register("neighborhood")} />
                        </div>
                        <div>
                            <Label>Código IBGE *</Label>
                            <Input {...form.register("cityIbgeCode")} placeholder="Ex: 3550308" />
                        </div>
                    </CardContent>
                </Card>

                {/* Limites PIX */}
                <Card>
                    <CardHeader>
                        <CardTitle>Limites PIX</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Transação única (R$)</Label>
                            <Input
                                type="number"
                                {...form.register("singleTransfer", { valueAsNumber: true })}
                            />
                        </div>
                        <div>
                            <Label>Diurno (R$)</Label>
                            <Input
                                type="number"
                                {...form.register("daytime", { valueAsNumber: true })}
                            />
                        </div>
                        <div>
                            <Label>Noturno (R$)</Label>
                            <Input
                                type="number"
                                {...form.register("nighttime", { valueAsNumber: true })}
                            />
                        </div>
                        <div>
                            <Label>Mensal (R$)</Label>
                            <Input
                                type="number"
                                {...form.register("monthly", { valueAsNumber: true })}
                            />
                        </div>
                        <div>
                            <Label>Service ID</Label>
                            <Select onValueChange={(v) => form.setValue("serviceId", v as "1" | "8")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 - Padrão</SelectItem>
                                    <SelectItem value="8">8 - Especial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.push("/admin/kyc")}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 size-4" />
                                Credenciar
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}