"use client";

import * as React from "react";
import { MapPin, Calendar, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCep, formatDate, parseDateBR } from "@/lib/formatters";
import { fetchAddressByCep } from "@/lib/viacep";
import http from "@/lib/http";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { CustomerAddress } from "@/types/customer";

interface PersonalDataStepProps {
    initialBirthday?: string;
    initialAddress?: CustomerAddress;
    onComplete: () => void;
}

export function PersonalDataStep({
    initialBirthday,
    initialAddress,
    onComplete,
}: PersonalDataStepProps) {
    const [birthday, setBirthday] = React.useState(() => {
        if (!initialBirthday) return "";
        const [y, m, d] = initialBirthday.split("-");
        return d && m && y ? `${d}/${m}/${y}` : "";
    });
    const [cep, setCep] = React.useState(initialAddress?.zipCode || "");
    const [street, setStreet] = React.useState(initialAddress?.street || "");
    const [number, setNumber] = React.useState(initialAddress?.number || "");
    const [complement, setComplement] = React.useState(initialAddress?.complement || "");
    const [neighborhood, setNeighborhood] = React.useState(initialAddress?.neighborhood || "");
    const [city, setCity] = React.useState(initialAddress?.city || "");
    const [state, setState] = React.useState(initialAddress?.state || "");
    const [cityIbgeCode, setCityIbgeCode] = React.useState(
        initialAddress?.cityIbgeCode?.toString() || ""
    );

    const [loadingCep, setLoadingCep] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    async function handleCepChange(value: string) {
        const formatted = formatCep(value);
        setCep(formatted);

        const clean = value.replace(/\D/g, "");
        if (clean.length === 8) {
            setLoadingCep(true);
            try {
                const data = await fetchAddressByCep(clean);
                if (data) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setState(data.uf);
                    setCityIbgeCode(data.ibge);
                } else {
                    toast.error("CEP nao encontrado");
                }
            } catch {
                toast.error("Erro ao buscar CEP");
            } finally {
                setLoadingCep(false);
            }
        }
    }

    function validate(): boolean {
        const errs: Record<string, string> = {};

        const isoDate = parseDateBR(birthday);
        if (!isoDate) {
            errs.birthday = "Data de nascimento invalida";
        } else {
            const date = new Date(isoDate);
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            if (age < 18) errs.birthday = "Voce precisa ter pelo menos 18 anos";
            if (age > 120) errs.birthday = "Data de nascimento invalida";
        }

        if (cep.replace(/\D/g, "").length !== 8) errs.cep = "CEP obrigatorio";
        if (!street.trim()) errs.street = "Logradouro obrigatorio";
        if (!number.trim()) errs.number = "Numero obrigatorio";
        if (!neighborhood.trim()) errs.neighborhood = "Bairro obrigatorio";
        if (!city.trim()) errs.city = "Cidade obrigatoria";
        if (!state.trim()) errs.state = "Estado obrigatorio";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit() {
        if (!validate()) return;

        const isoDate = parseDateBR(birthday)!;

        try {
            setSubmitting(true);
            await http.patch("/customers/me/onboarding", {
                birthday: isoDate,
                address: {
                    zipCode: cep.replace(/\D/g, ""),
                    street,
                    number,
                    complement: complement || undefined,
                    neighborhood,
                    city,
                    state,
                    cityIbgeCode: cityIbgeCode || "0",
                },
            });
            toast.success("Dados salvos!");
            onComplete();
        } catch {
            toast.error("Erro ao salvar dados. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F00FF]/10">
                    <MapPin className="h-7 w-7 text-[#6F00FF]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Dados pessoais
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Complete seu perfil com data de nascimento e endereco
                </p>
            </div>

            <div className="space-y-4">
                {/* Birthday */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">
                        Data de nascimento
                    </Label>
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            inputMode="numeric"
                            placeholder="DD/MM/AAAA"
                            value={birthday}
                            onChange={(e) => setBirthday(formatDate(e.target.value))}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 pl-10 text-base"
                        />
                    </div>
                    {errors.birthday && (
                        <p className="text-xs text-red-500 font-medium">{errors.birthday}</p>
                    )}
                </div>

                {/* CEP */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">
                        CEP
                    </Label>
                    <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            inputMode="numeric"
                            placeholder="00000-000"
                            value={cep}
                            onChange={(e) => handleCepChange(e.target.value)}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 pl-10 text-base"
                        />
                        {loadingCep && (
                            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                        )}
                    </div>
                    {errors.cep && (
                        <p className="text-xs text-red-500 font-medium">{errors.cep}</p>
                    )}
                </div>

                {/* Street + Number */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-sm font-bold text-slate-900 dark:text-white">
                            Logradouro
                        </Label>
                        <Input
                            placeholder="Rua, Avenida..."
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                        />
                        {errors.street && (
                            <p className="text-xs text-red-500 font-medium">{errors.street}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-slate-900 dark:text-white">
                            Numero
                        </Label>
                        <Input
                            placeholder="123"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                        />
                        {errors.number && (
                            <p className="text-xs text-red-500 font-medium">{errors.number}</p>
                        )}
                    </div>
                </div>

                {/* Complement */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">
                        Complemento <span className="text-slate-400 font-normal">(opcional)</span>
                    </Label>
                    <Input
                        placeholder="Apto, Bloco..."
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                    />
                </div>

                {/* Neighborhood */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-slate-900 dark:text-white">
                        Bairro
                    </Label>
                    <Input
                        placeholder="Bairro"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                    />
                    {errors.neighborhood && (
                        <p className="text-xs text-red-500 font-medium">{errors.neighborhood}</p>
                    )}
                </div>

                {/* City + State */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-sm font-bold text-slate-900 dark:text-white">
                            Cidade
                        </Label>
                        <Input
                            placeholder="Cidade"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                        />
                        {errors.city && (
                            <p className="text-xs text-red-500 font-medium">{errors.city}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-bold text-slate-900 dark:text-white">
                            UF
                        </Label>
                        <Input
                            placeholder="SP"
                            maxLength={2}
                            value={state}
                            onChange={(e) => setState(e.target.value.toUpperCase())}
                            className="h-12 rounded-2xl border-black/[0.05] dark:border-white/10 bg-white/60 dark:bg-white/5 text-base"
                        />
                        {errors.state && (
                            <p className="text-xs text-red-500 font-medium">{errors.state}</p>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-12 rounded-2xl bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white font-bold text-sm"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            Continuar
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
