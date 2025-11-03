"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, CalendarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fetchCep, toIbgeNumber } from "@/lib/kyc/cep";
import type { AccreditationPFIn, AccreditationPFResponse } from "@/lib/kyc/types";

/* zod */

const addressSchema = z.object({
    zipCode: z.string().min(8, "Informe o CEP").max(9),
    street: z.string().min(2),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    cityIbgeCode: z.number().int().positive(),
});

const schema = z.object({
    identifier: z.string().min(1),
    productId: z.literal(1),
    person: z.object({
        name: z.string().min(2),
        socialName: z.string().optional(),
        cpf: z.string().min(11),
        birthday: z.date(), // DatePicker
        phone: z.string().min(8),
        email: z.string().email(),
        genderId: z.union([z.literal(1), z.literal(2)]).optional(),
        address: addressSchema,
    }),
    pixLimits: z.object({
        singleTransfer: z.number().nonnegative(),
        daytime: z.number().nonnegative(),
        nighttime: z.number().nonnegative(),
        monthly: z.number().nonnegative(),
        serviceId: z.union([z.literal(1), z.literal(8)]),
    }),
});

type FormValues = z.infer<typeof schema>;

function isErrorWithMessage(e: unknown): e is { message: string } {
    return typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string";
}

export default function NewPFPage(): React.JSX.Element {
    const [loading, setLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            identifier: "",
            productId: 1,
            person: {
                name: "",
                socialName: "",
                cpf: "",
                birthday: new Date(),
                phone: "",
                email: "",
                address: {
                    zipCode: "",
                    street: "",
                    number: "",
                    complement: "",
                    neighborhood: "",
                    cityIbgeCode: 0,
                },
            },
            pixLimits: {
                singleTransfer: 0,
                daytime: 0,
                nighttime: 0,
                monthly: 0,
                serviceId: 8,
            },
        },
    });

    /* CEP */
    const abortRef = React.useRef<AbortController | null>(null);
    async function handleCep(): Promise<void> {
        try {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            const raw = form.getValues("person.address.zipCode");
            const data = await fetchCep(raw, ctrl.signal);
            form.setValue("person.address.street", data.logradouro ?? "", { shouldValidate: true });
            form.setValue("person.address.neighborhood", data.bairro ?? "", { shouldValidate: true });
            form.setValue("person.address.cityIbgeCode", toIbgeNumber(data.ibge), { shouldValidate: true });
            toast.success("Endereço preenchido pelo CEP!");
        } catch (e) {
            toast.error(isErrorWithMessage(e) ? e.message : "Falha ao consultar CEP");
        }
    }

    async function onSubmit(values: FormValues): Promise<void> {
        try {
            setLoading(true);
            const payload: AccreditationPFIn = {
                identifier: values.identifier,
                productId: 1,
                person: {
                    ...values.person,
                    birthday: format(values.person.birthday, "yyyy-MM-dd"),
                },
                pixLimits: values.pixLimits,
            };
            const res = await http.post<AccreditationPFResponse>("/accreditation/person", {
                Identifier: payload.identifier,
                ProductId: payload.productId,
                Person: {
                    Name: payload.person.name,
                    SocialName: payload.person.socialName ?? "",
                    Cpf: payload.person.cpf,
                    Birthday: payload.person.birthday,
                    Phone: payload.person.phone,
                    Email: payload.person.email,
                    GenderId: payload.person.genderId,
                    Address: {
                        ZipCode: payload.person.address.zipCode,
                        Street: payload.person.address.street,
                        Number: payload.person.address.number ?? "",
                        Complement: payload.person.address.complement ?? "",
                        Neighborhood: payload.person.address.neighborhood,
                        CityIbgeCode: payload.person.address.cityIbgeCode,
                    },
                },
                PixLimits: {
                    SingleTransfer: payload.pixLimits.singleTransfer,
                    DayTime: payload.pixLimits.daytime,
                    NightTime: payload.pixLimits.nighttime,
                    Monthly: payload.pixLimits.monthly,
                    ServiceId: payload.pixLimits.serviceId,
                },
            });

            const msg = res?.Extensions?.Message ?? "Pessoa física cadastrada com sucesso!";
            toast.success(msg);
            form.reset();
        } catch (e) {
            toast.error(isErrorWithMessage(e) ? e.message : "Erro ao cadastrar PF");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Novo credenciamento — PF</h1>
                <Link href="/admin/kyc"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button></Link>
            </div>

            <Card className="rounded-2xl max-w-3xl">
                <CardHeader><CardTitle>Dados</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                    {/* topo */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Identifier</Label>
                            <Input {...form.register("identifier")} placeholder="ID do integrador" />
                        </div>
                        <div className="grid gap-2"><Label>Produto</Label><Input value="1" readOnly /></div>
                    </div>

                    <Separator />

                    {/* pessoa */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Nome</Label><Input {...form.register("person.name")} /></div>
                        <div className="grid gap-2"><Label>Nome social</Label><Input {...form.register("person.socialName")} /></div>
                        <div className="grid gap-2"><Label>CPF</Label><Input {...form.register("person.cpf")} /></div>

                        <div className="grid gap-2">
                            <Label>Nascimento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start", !form.watch("person.birthday") && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch("person.birthday") ? format(form.watch("person.birthday"), "dd/MM/yyyy") : "Selecione a data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch("person.birthday")}
                                        onSelect={(date) => form.setValue("person.birthday", date ?? new Date(), { shouldValidate: true })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2"><Label>Telefone</Label><Input {...form.register("person.phone")} /></div>
                        <div className="grid gap-2"><Label>E-mail</Label><Input {...form.register("person.email")} /></div>
                        <div className="grid gap-2">
                            <Label>Gênero</Label>
                            <select className="h-9 rounded-md border bg-background px-2 text-sm" {...form.register("person.genderId", { valueAsNumber: true })}>
                                <option value="">Selecione</option>
                                <option value={1}>Masculino</option>
                                <option value={2}>Feminino</option>
                            </select>
                        </div>
                    </div>

                    {/* endereço */}
                    <Separator />
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label>CEP</Label>
                            <div className="flex gap-2">
                                <Input {...form.register("person.address.zipCode")} placeholder="00000-000" />
                                <Button type="button" variant="outline" onClick={handleCep} title="Buscar CEP"><Search className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="grid gap-2 md:col-span-2"><Label>Rua</Label><Input {...form.register("person.address.street")} /></div>
                        <div className="grid gap-2"><Label>Número</Label><Input {...form.register("person.address.number")} /></div>
                        <div className="grid gap-2"><Label>Complemento</Label><Input {...form.register("person.address.complement")} /></div>
                        <div className="grid gap-2"><Label>Bairro</Label><Input {...form.register("person.address.neighborhood")} /></div>
                        <div className="grid gap-2"><Label>Cidade (IBGE)</Label>
                            <Input {...form.register("person.address.cityIbgeCode", { valueAsNumber: true })} placeholder="Ex.: 3550308" />
                        </div>
                    </div>

                    {/* limites */}
                    <Separator />
                    <div className="grid md:grid-cols-5 gap-4">
                        <div className="grid gap-2"><Label>Single Transfer</Label>
                            <Input type="number" step="0.01" {...form.register("pixLimits.singleTransfer", { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2"><Label>Daytime</Label>
                            <Input type="number" step="0.01" {...form.register("pixLimits.daytime", { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2"><Label>Nighttime</Label>
                            <Input type="number" step="0.01" {...form.register("pixLimits.nighttime", { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2"><Label>Monthly</Label>
                            <Input type="number" step="0.01" {...form.register("pixLimits.monthly", { valueAsNumber: true })} />
                        </div>
                        <div className="grid gap-2"><Label>Serviço</Label>
                            <select className="h-9 rounded-md border bg-background px-2 text-sm" {...form.register("pixLimits.serviceId", { valueAsNumber: true })}>
                                <option value={8}>Pix</option>
                                <option value={1}>BigPix</option>
                            </select>
                        </div>
                    </div>

                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>{loading ? "Enviando…" : "Cadastrar PF"}</Button>
                </CardContent>
            </Card>
        </div>
    );
}
