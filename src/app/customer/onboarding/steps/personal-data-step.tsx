"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRound, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import http from "@/lib/http";
import { formatDate, parseDateBR } from "@/lib/formatters";
import { formatCep } from "@/lib/formatters";
import { fetchAddressByCep } from "@/lib/viacep";
import type { CustomerResponse } from "@/types/customer";

const schema = z.object({
    birthday: z.string().min(10, "Informe a data de nascimento"),
    zipCode: z.string().min(9, "CEP invalido"),
    street: z.string().min(1, "Informe o logradouro"),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Informe o bairro"),
    city: z.string().min(1, "Informe a cidade"),
    state: z.string().min(2, "Informe o estado"),
    cityIbgeCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PersonalDataStepProps {
    customer: CustomerResponse | null;
    onComplete: () => void;
}

export function PersonalDataStep({ customer, onComplete }: PersonalDataStepProps) {
    const [submitting, setSubmitting] = React.useState(false);
    const [loadingCep, setLoadingCep] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            birthday: customer?.birthday ?? "",
            zipCode: customer?.address?.zipCode ?? "",
            street: customer?.address?.street ?? "",
            number: customer?.address?.number ?? "",
            complement: customer?.address?.complement ?? "",
            neighborhood: customer?.address?.neighborhood ?? "",
            city: customer?.address?.city ?? "",
            state: customer?.address?.state ?? "",
            cityIbgeCode: String(customer?.address?.cityIbgeCode ?? ""),
        },
    });

    const zipCode = form.watch("zipCode");

    React.useEffect(() => {
        const clean = zipCode?.replace(/\D/g, "") ?? "";
        if (clean.length !== 8) return;

        let cancelled = false;
        setLoadingCep(true);

        fetchAddressByCep(clean).then((data) => {
            if (cancelled || !data) {
                setLoadingCep(false);
                return;
            }
            form.setValue("street", data.logradouro);
            form.setValue("neighborhood", data.bairro);
            form.setValue("city", data.localidade);
            form.setValue("state", data.uf);
            form.setValue("cityIbgeCode", data.ibge);
            setLoadingCep(false);
        }).catch(() => {
            if (!cancelled) setLoadingCep(false);
        });

        return () => { cancelled = true; };
    }, [zipCode, form]);

    async function onSubmit(values: FormValues) {
        const isoDate = parseDateBR(values.birthday);
        if (!isoDate) {
            form.setError("birthday", { message: "Data invalida" });
            return;
        }

        try {
            setSubmitting(true);
            await http.patch("/customers/me/onboarding", {
                birthday: isoDate,
                address: {
                    zipCode: values.zipCode.replace(/\D/g, ""),
                    street: values.street,
                    number: values.number || undefined,
                    complement: values.complement || undefined,
                    neighborhood: values.neighborhood,
                    city: values.city,
                    state: values.state,
                    cityIbgeCode: values.cityIbgeCode || undefined,
                },
            });
            toast.success("Dados salvos!");
            onComplete();
        } catch (err) {
            const msg =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? String(err.response.data.message)
                    : "Erro ao salvar dados. Tente novamente.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <UserRound className="h-6 w-6 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                    Dados pessoais
                </h2>
                <p className="text-sm text-white/60">
                    Informe sua data de nascimento e endereco.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-sm font-semibold">
                        Data de nascimento
                    </Label>
                    <Input
                        id="birthday"
                        inputMode="numeric"
                        placeholder="DD/MM/AAAA"
                        value={form.watch("birthday")}
                        onChange={(e) =>
                            form.setValue("birthday", formatDate(e.target.value), { shouldValidate: true })
                        }
                        className="h-12 rounded-xl"
                    />
                    {form.formState.errors.birthday && (
                        <p className="text-xs text-red-500">{form.formState.errors.birthday.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-semibold">
                        CEP
                    </Label>
                    <div className="relative">
                        <Input
                            id="zipCode"
                            inputMode="numeric"
                            placeholder="00000-000"
                            value={form.watch("zipCode")}
                            onChange={(e) =>
                                form.setValue("zipCode", formatCep(e.target.value), { shouldValidate: true })
                            }
                            className="h-12 rounded-xl"
                        />
                        {loadingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-white/60" />
                        )}
                    </div>
                    {form.formState.errors.zipCode && (
                        <p className="text-xs text-red-500">{form.formState.errors.zipCode.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-semibold">
                        Logradouro
                    </Label>
                    <Input
                        id="street"
                        placeholder="Rua, Avenida..."
                        {...form.register("street")}
                        className="h-12 rounded-xl"
                    />
                    {form.formState.errors.street && (
                        <p className="text-xs text-red-500">{form.formState.errors.street.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="number" className="text-sm font-semibold">
                            Numero
                        </Label>
                        <Input
                            id="number"
                            placeholder="123"
                            {...form.register("number")}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complement" className="text-sm font-semibold">
                            Complemento
                        </Label>
                        <Input
                            id="complement"
                            placeholder="Apto, Bloco..."
                            {...form.register("complement")}
                            className="h-12 rounded-xl"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="neighborhood" className="text-sm font-semibold">
                        Bairro
                    </Label>
                    <Input
                        id="neighborhood"
                        placeholder="Bairro"
                        {...form.register("neighborhood")}
                        className="h-12 rounded-xl"
                    />
                    {form.formState.errors.neighborhood && (
                        <p className="text-xs text-red-500">{form.formState.errors.neighborhood.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="city" className="text-sm font-semibold">
                            Cidade
                        </Label>
                        <Input
                            id="city"
                            placeholder="Cidade"
                            {...form.register("city")}
                            className="h-12 rounded-xl"
                        />
                        {form.formState.errors.city && (
                            <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-semibold">
                            UF
                        </Label>
                        <Input
                            id="state"
                            placeholder="SP"
                            maxLength={2}
                            {...form.register("state")}
                            className="h-12 rounded-xl"
                        />
                        {form.formState.errors.state && (
                            <p className="text-xs text-red-500">{form.formState.errors.state.message}</p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-semibold"
                >
                    {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </form>
        </div>
    );
}
