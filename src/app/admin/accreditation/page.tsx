"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { Separator } from "@/components/ui/separator";

const identifierDefault = "otsem-system";
const productIdDefault = 1;
const serviceIdDefault = 1;

/* -------------------------------------------
   SCHEMAS
------------------------------------------- */

const addressSchema = z.object({
    zipCode: z.string().min(8, "CEP inválido"),
    street: z.string().min(1),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(1),
    cityIbgeCode: z.union([z.string(), z.number()]),
});

const pixLimitsSchema = z.object({
    singleTransfer: z.number().nonnegative(),
    daytime: z.number().nonnegative(),
    nighttime: z.number().nonnegative(),
    monthly: z.number().nonnegative(),
    serviceId: z.number().int(),
});

/* Pessoa Física */
const personSchema = z.object({
    identifier: z.string(),
    productId: z.number().int(),
    name: z.string().min(3),
    socialName: z.string().optional(),
    cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato YYYY-MM-DD"),
    phone: z.string().min(8),
    email: z.string().email(),
    genderId: z.number().int().optional(),
    address: addressSchema,
    pixLimits: pixLimitsSchema,
});

/* Pessoa Jurídica */
const ownershipSchema = z.object({
    name: z.string().min(3),
    cpf: z.string().regex(/^\d{11}$/),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isAdministrator: z.boolean(),
});

const companySchema = z.object({
    identifier: z.string(),
    productId: z.number().int(),
    legalName: z.string().min(3),
    tradeName: z.string().min(3),
    cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve conter 14 dígitos"),
    phone: z.string().min(8),
    email: z.string().email(),
    address: addressSchema,
    ownershipStructure: z.array(ownershipSchema).min(1),
    pixLimits: pixLimitsSchema,
});

/* -------------------------------------------
   COMPONENTE PRINCIPAL
------------------------------------------- */

export default function AccreditationPage() {
    const [loading, setLoading] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("person");

    const personForm = useForm<z.infer<typeof personSchema>>({
        resolver: zodResolver(personSchema),
        defaultValues: {
            identifier: identifierDefault,
            productId: productIdDefault,
            name: "",
            socialName: "",
            cpf: "",
            birthday: "",
            phone: "",
            email: "",
            genderId: 1,
            address: {
                zipCode: "",
                street: "",
                neighborhood: "",
                cityIbgeCode: "",
            },
            pixLimits: {
                singleTransfer: 2000,
                daytime: 10000,
                nighttime: 1000,
                monthly: 100000,
                serviceId: serviceIdDefault,
            },
        },
    });

    const companyForm = useForm<z.infer<typeof companySchema>>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            identifier: identifierDefault,
            productId: productIdDefault,
            legalName: "",
            tradeName: "",
            cnpj: "",
            phone: "",
            email: "",
            address: {
                zipCode: "",
                street: "",
                neighborhood: "",
                cityIbgeCode: "",
            },
            ownershipStructure: [
                { name: "", cpf: "", birthday: "", isAdministrator: true },
            ],
            pixLimits: {
                singleTransfer: 2000,
                daytime: 10000,
                nighttime: 1000,
                monthly: 100000,
                serviceId: serviceIdDefault,
            },
        },
    });

    /* -------------------------------------------
       ENVIO PF
    ------------------------------------------- */
    async function handleSubmitPerson(values: z.infer<typeof personSchema>) {
        try {
            setLoading(true);
            const res = await http.post("/accreditation/person", values);
            toast.success("Pessoa física cadastrada com sucesso!");
            console.log("✅ PF:", res);
            personForm.reset();
        } catch (err: any) {
            toast.error(err.message ?? "Erro ao cadastrar PF");
        } finally {
            setLoading(false);
        }
    }

    /* -------------------------------------------
       ENVIO PJ
    ------------------------------------------- */
    async function handleSubmitCompany(values: z.infer<typeof companySchema>) {
        try {
            setLoading(true);
            const res = await http.post("/accreditation/company", values);
            toast.success("Pessoa jurídica cadastrada com sucesso!");
            console.log("✅ PJ:", res);
            companyForm.reset();
        } catch (err: any) {
            toast.error(err.message ?? "Erro ao cadastrar PJ");
        } finally {
            setLoading(false);
        }
    }

    /* -------------------------------------------
       UI
    ------------------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold">Cadastro de Cliente (KYC)</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="person">Pessoa Física</TabsTrigger>
                    <TabsTrigger value="company">Pessoa Jurídica</TabsTrigger>
                </TabsList>

                {/* -------------------------------------- */}
                {/* PESSOA FÍSICA */}
                <TabsContent value="person">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Credenciamento Pessoa Física</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 max-w-2xl">
                            <form
                                onSubmit={personForm.handleSubmit(handleSubmitPerson)}
                                className="grid gap-4"
                            >
                                <div>
                                    <Label>Nome</Label>
                                    <Input {...personForm.register("name")} />
                                </div>
                                <div>
                                    <Label>CPF</Label>
                                    <Input {...personForm.register("cpf")} />
                                </div>
                                <div>
                                    <Label>Data de Nascimento</Label>
                                    <Input
                                        type="date"
                                        {...personForm.register("birthday")}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>Telefone</Label>
                                        <Input {...personForm.register("phone")} />
                                    </div>
                                    <div>
                                        <Label>E-mail</Label>
                                        <Input {...personForm.register("email")} />
                                    </div>
                                </div>

                                <Separator />
                                <p className="font-medium">Endereço</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>CEP</Label>
                                        <Input {...personForm.register("address.zipCode")} />
                                    </div>
                                    <div>
                                        <Label>Rua</Label>
                                        <Input {...personForm.register("address.street")} />
                                    </div>
                                    <div>
                                        <Label>Bairro</Label>
                                        <Input {...personForm.register("address.neighborhood")} />
                                    </div>
                                    <div>
                                        <Label>Código IBGE</Label>
                                        <Input {...personForm.register("address.cityIbgeCode")} />
                                    </div>
                                </div>

                                <Separator />
                                <p className="font-medium">Limites Pix</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>Transação única</Label>
                                        <Input
                                            type="number"
                                            {...personForm.register("pixLimits.singleTransfer", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Diurno</Label>
                                        <Input
                                            type="number"
                                            {...personForm.register("pixLimits.daytime", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Noturno</Label>
                                        <Input
                                            type="number"
                                            {...personForm.register("pixLimits.nighttime", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Mensal</Label>
                                        <Input
                                            type="number"
                                            {...personForm.register("pixLimits.monthly", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading}>
                                    {loading ? "Enviando..." : "Cadastrar Pessoa Física"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* -------------------------------------- */}
                {/* PESSOA JURÍDICA */}
                <TabsContent value="company">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle>Credenciamento Pessoa Jurídica</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 max-w-2xl">
                            <form
                                onSubmit={companyForm.handleSubmit(handleSubmitCompany)}
                                className="grid gap-4"
                            >
                                <div>
                                    <Label>Razão Social</Label>
                                    <Input {...companyForm.register("legalName")} />
                                </div>
                                <div>
                                    <Label>Nome Fantasia</Label>
                                    <Input {...companyForm.register("tradeName")} />
                                </div>
                                <div>
                                    <Label>CNPJ</Label>
                                    <Input {...companyForm.register("cnpj")} />
                                </div>

                                <Separator />
                                <p className="font-medium">Endereço</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>CEP</Label>
                                        <Input {...companyForm.register("address.zipCode")} />
                                    </div>
                                    <div>
                                        <Label>Rua</Label>
                                        <Input {...companyForm.register("address.street")} />
                                    </div>
                                    <div>
                                        <Label>Bairro</Label>
                                        <Input {...companyForm.register("address.neighborhood")} />
                                    </div>
                                    <div>
                                        <Label>Código IBGE</Label>
                                        <Input {...companyForm.register("address.cityIbgeCode")} />
                                    </div>
                                </div>

                                <Separator />
                                <p className="font-medium">Sócio/Administrador</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>Nome</Label>
                                        <Input {...companyForm.register("ownershipStructure.0.name")} />
                                    </div>
                                    <div>
                                        <Label>CPF</Label>
                                        <Input {...companyForm.register("ownershipStructure.0.cpf")} />
                                    </div>
                                    <div>
                                        <Label>Data de Nascimento</Label>
                                        <Input
                                            type="date"
                                            {...companyForm.register("ownershipStructure.0.birthday")}
                                        />
                                    </div>
                                </div>

                                <Separator />
                                <p className="font-medium">Limites Pix</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                    <div>
                                        <Label>Transação única</Label>
                                        <Input
                                            type="number"
                                            {...companyForm.register("pixLimits.singleTransfer", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Diurno</Label>
                                        <Input
                                            type="number"
                                            {...companyForm.register("pixLimits.daytime", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Noturno</Label>
                                        <Input
                                            type="number"
                                            {...companyForm.register("pixLimits.nighttime", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Mensal</Label>
                                        <Input
                                            type="number"
                                            {...companyForm.register("pixLimits.monthly", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading}>
                                    {loading ? "Enviando..." : "Cadastrar Pessoa Jurídica"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
