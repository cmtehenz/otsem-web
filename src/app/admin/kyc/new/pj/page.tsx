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
import type { AccreditationPJIn, AccreditationPJResponse } from "@/lib/kyc/types";

/* zod */
const addressSchema = z.object({
    zipCode: z.string().min(8, "Informe o CEP").max(9),
    street: z.string().min(2),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    cityIbgeCode: z.number().int().positive(),
});

const ownerSchema = z.object({
    name: z.string().min(2),
    cpf: z.string().min(11),
    birthday: z.date(), // datepicker
    isAdministrator: z.boolean(),
});

const schema = z.object({
    identifier: z.string().min(1),
    productId: z.literal(1),
    company: z.object({
        legalName: z.string().min(2),
        tradeName: z.string().min(2),
        cnpj: z.string().min(14),
        phone: z.string().min(8),
        email: z.string().email(),
        address: addressSchema,
        ownershipStructure: z.array(ownerSchema).min(1),
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

export default function NewPJPage(): React.JSX.Element {
    const [loading, setLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            identifier: "",
            productId: 1,
            company: {
                legalName: "",
                tradeName: "",
                cnpj: "",
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
                ownershipStructure: [
                    { name: "", cpf: "", birthday: new Date(), isAdministrator: true },
                ],
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
            const raw = form.getValues("company.address.zipCode");
            const data = await fetchCep(raw, ctrl.signal);
            form.setValue("company.address.street", data.logradouro ?? "", { shouldValidate: true });
            form.setValue("company.address.neighborhood", data.bairro ?? "", { shouldValidate: true });
            form.setValue("company.address.cityIbgeCode", toIbgeNumber(data.ibge), { shouldValidate: true });
            toast.success("Endereço preenchido pelo CEP!");
        } catch (e) {
            toast.error(isErrorWithMessage(e) ? e.message : "Falha ao consultar CEP");
        }
    }

    function addOwner(): void {
        const arr = form.getValues("company.ownershipStructure");
        form.setValue("company.ownershipStructure", [...arr, { name: "", cpf: "", birthday: new Date(), isAdministrator: false }], { shouldValidate: true });
    }
    function removeLastOwner(): void {
        const arr = form.getValues("company.ownershipStructure");
        if (arr.length > 1) form.setValue("company.ownershipStructure", arr.slice(0, -1), { shouldValidate: true });
    }

    async function onSubmit(values: FormValues): Promise<void> {
        try {
            setLoading(true);
            const payload: AccreditationPJIn = {
                identifier: values.identifier,
                productId: 1,
                company: {
                    ...values.company,
                    ownershipStructure: values.company.ownershipStructure.map(o => ({
                        ...o,
                        birthday: format(o.birthday, "yyyy-MM-dd"),
                    })),
                },
                pixLimits: values.pixLimits,
            };
            const res = await http.post<AccreditationPJResponse>("/accreditation/company", {
                Identifier: payload.identifier,
                ProductId: payload.productId,
                Company: {
                    LegalName: payload.company.legalName,
                    TradeName: payload.company.tradeName,
                    Cnpj: payload.company.cnpj,
                    Phone: payload.company.phone,
                    Email: payload.company.email,
                    Address: {
                        ZipCode: payload.company.address.zipCode,
                        Street: payload.company.address.street,
                        Number: payload.company.address.number ?? "",
                        Complement: payload.company.address.complement ?? "",
                        Neighborhood: payload.company.address.neighborhood,
                        CityIbgeCode: payload.company.address.cityIbgeCode,
                    },
                    OwnershipStructure: payload.company.ownershipStructure.map(o => ({
                        Name: o.name,
                        Cpf: o.cpf,
                        Birthday: o.birthday,
                        IsAdministrator: o.isAdministrator,
                    })),
                },
                PixLimits: {
                    SingleTransfer: payload.pixLimits.singleTransfer,
                    DayTime: payload.pixLimits.daytime,
                    NightTime: payload.pixLimits.nighttime,
                    Monthly: payload.pixLimits.monthly,
                    ServiceId: payload.pixLimits.serviceId,
                },
            });

            const msg = res?.Extensions?.Message ?? "Pessoa jurídica cadastrada com sucesso!";
            toast.success(msg);
            form.reset();
        } catch (e) {
            toast.error(isErrorWithMessage(e) ? e.message : "Erro ao cadastrar PJ");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Novo credenciamento — PJ</h1>
                <Link href="/admin/kyc"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button></Link>
            </div>

            <Card className="rounded-2xl max-w-3xl">
                <CardHeader><CardTitle>Dados</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                    {/* topo */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Identifier</Label><Input {...form.register("identifier")} placeholder="ID do integrador" /></div>
                        <div className="grid gap-2"><Label>Produto</Label><Input value="1" readOnly /></div>
                    </div>

                    <Separator />

                    {/* empresa */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Razão Social</Label><Input {...form.register("company.legalName")} /></div>
                        <div className="grid gap-2"><Label>Nome Fantasia</Label><Input {...form.register("company.tradeName")} /></div>
                        <div className="grid gap-2"><Label>CNPJ</Label><Input {...form.register("company.cnpj")} /></div>
                        <div className="grid gap-2"><Label>Telefone</Label><Input {...form.register("company.phone")} /></div>
                        <div className="grid gap-2"><Label>E-mail</Label><Input {...form.register("company.email")} /></div>
                    </div>

                    {/* endereço */}
                    <Separator />
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label>CEP</Label>
                            <div className="flex gap-2">
                                <Input {...form.register("company.address.zipCode")} placeholder="00000-000" />
                                <Button type="button" variant="outline" onClick={handleCep}><Search className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="grid gap-2 md:col-span-2"><Label>Rua</Label><Input {...form.register("company.address.street")} /></div>
                        <div className="grid gap-2"><Label>Número</Label><Input {...form.register("company.address.number")} /></div>
                        <div className="grid gap-2"><Label>Complemento</Label><Input {...form.register("company.address.complement")} /></div>
                        <div className="grid gap-2"><Label>Bairro</Label><Input {...form.register("company.address.neighborhood")} /></div>
                        <div className="grid gap-2"><Label>Cidade (IBGE)</Label>
                            <Input {...form.register("company.address.cityIbgeCode", { valueAsNumber: true })} placeholder="Ex.: 3550308" />
                        </div>
                    </div>

                    {/* sócios */}
                    <Separator />
                    <div className="grid gap-3">
                        <Label>Sócios</Label>
                        {form.watch("company.ownershipStructure").map((_, idx) => (
                            <div className="grid md:grid-cols-4 gap-3 border rounded-md p-3" key={idx}>
                                <Input placeholder="Nome" {...form.register(`company.ownershipStructure.${idx}.name` as const)} />
                                <Input placeholder="CPF" {...form.register(`company.ownershipStructure.${idx}.cpf` as const)} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-xs">Nascimento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("justify-start", !form.watch(`company.ownershipStructure.${idx}.birthday` as const) && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch(`company.ownershipStructure.${idx}.birthday` as const)
                                                    ? format(form.watch(`company.ownershipStructure.${idx}.birthday` as const), "dd/MM/yyyy")
                                                    : "Selecione a data"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch(`company.ownershipStructure.${idx}.birthday` as const)}
                                                onSelect={(date) => form.setValue(`company.ownershipStructure.${idx}.birthday` as const, date ?? new Date(), { shouldValidate: true })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="size-4 accent-foreground" {...form.register(`company.ownershipStructure.${idx}.isAdministrator` as const)} />
                                    <span className="text-sm">Administrador</span>
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={addOwner}>Adicionar sócio</Button>
                            <Button type="button" variant="outline" onClick={removeLastOwner}>Remover último</Button>
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

                    <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>{loading ? "Enviando…" : "Cadastrar PJ"}</Button>
                </CardContent>
            </Card>
        </div>
    );
}
