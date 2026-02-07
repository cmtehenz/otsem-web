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
import { fetchCep, isValidCep, onlyDigits } from "@/lib/cep";

const schema = z.object({
  identifier: z.string().min(1, "Identificador obrigatório"),
  companyName: z.string().min(3, "Razão social obrigatória"),
  tradingName: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"),
  foundingDate: z.string().min(10, "Data de abertura obrigatória"),
  phone: z.string().min(10, "Telefone obrigatório"),
  email: z.string().email("E-mail inválido"),
  zipCode: z.string().min(8, "CEP obrigatório"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  cityIbgeCode: z.string().min(7, "Código IBGE obrigatório"),
});

type FormValues = z.infer<typeof schema>;

export default function NewCustomerPJPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: "",
      companyName: "",
      tradingName: "",
      cnpj: "",
      foundingDate: "",
      phone: "",
      email: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      cityIbgeCode: "",
    },
  });

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

      const phoneDigits = onlyDigits(values.phone);
      const phoneE164 = phoneDigits
        ? `+${phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`}`
        : undefined;

      const payload = {
        type: "PJ",
        name: values.companyName,
        email: values.email,
        phone: phoneE164,
        cnpj: onlyDigits(values.cnpj),
        companyName: values.companyName,
        tradingName: values.tradingName || undefined,
        foundingDate: values.foundingDate,
        address: {
          zipCode: onlyDigits(values.zipCode),
          street: values.street,
          number: values.number || undefined,
          complement: values.complement || undefined,
          neighborhood: values.neighborhood,
          cityIbgeCode: Number(values.cityIbgeCode),
        },
        metadata: {
          legacyIdentifier: values.identifier,
        },
      };

      await http.post("/customers", payload);
      toast.success("Cliente PJ criado com sucesso!");
      router.push("/admin/kyc");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao criar cliente PJ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/kyc")}>
          <ArrowLeft className="mr-1 size-4" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar Pessoa Jurídica</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Identificador *</Label>
              <Input {...form.register("identifier")} placeholder="ex: PJ_12345" />
            </div>
            <div>
              <Label>Razão social *</Label>
              <Input {...form.register("companyName")} />
            </div>
            <div>
              <Label>Nome fantasia</Label>
              <Input {...form.register("tradingName")} />
            </div>
            <div>
              <Label>CNPJ *</Label>
              <Input {...form.register("cnpj")} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>Data de abertura *</Label>
              <Input type="date" {...form.register("foundingDate")} />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input {...form.register("phone")} placeholder="(00) 00000-0000" />
            </div>
            <div className="md:col-span-2">
              <Label>E-mail *</Label>
              <Input type="email" {...form.register("email")} />
            </div>
          </CardContent>
        </Card>

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

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="min-w-[180px]">
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Criar cliente PJ
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
