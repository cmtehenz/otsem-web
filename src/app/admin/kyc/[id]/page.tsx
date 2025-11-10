"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

type KycCustomer = {
    id: string;
    type: "PF" | "PJ";
    accountStatus: "not_requested" | "in_review" | "approved" | "rejected";
    name?: string;
    socialName?: string;
    cpf?: string;
    cnpj?: string;
    email: string;
    phone: string;
    createdAt: string;
    address?: {
        zipCode: string;
        street: string;
        number?: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state?: string;
    };
    authUser?: {
        id: string;
        email: string;
    };
};

export default function AdminKycDetailPage(): React.JSX.Element {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [data, setData] = React.useState<KycCustomer | null>(null);
    const [loading, setLoading] = React.useState(true);

    console.log(id)

    React.useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await http.get<KycCustomer>(`/customers/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Falha ao carregar informações do cliente");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    function badgeClass(status: KycCustomer["accountStatus"]): string {
        switch (status) {
            case "approved": return "bg-green-100 text-green-700";
            case "in_review": return "bg-blue-100 text-blue-700";
            case "rejected": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando…</div>;
    if (!data) return <div className="p-8 text-center text-muted-foreground">Cliente não encontrado</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/admin/kyc")}>
                        <ArrowLeft className="size-4 mr-1" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-semibold">Detalhes do Cliente</h1>
                </div>
                <span className={`rounded px-2 py-1 text-sm font-medium ${badgeClass(data.accountStatus)}`}>
                    {data.accountStatus === "approved"
                        ? "✅ Aprovado"
                        : data.accountStatus === "in_review"
                            ? "⏳ Em análise"
                            : data.accountStatus === "rejected"
                                ? "❌ Rejeitado"
                                : "⏺️ Não iniciado"}
                </span>
            </div>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Dados Cadastrais</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <p><strong>Nome:</strong> {data.name ?? "—"}</p>
                        <p><strong>Email:</strong> {data.email}</p>
                        <p><strong>Telefone:</strong> {data.phone}</p>
                        <p><strong>CPF/CNPJ:</strong> {data.cpf ?? data.cnpj ?? "—"}</p>
                        <p><strong>Tipo:</strong> {data.type}</p>
                        <p><strong>Criado em:</strong> {new Date(data.createdAt).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                    {data.address ? (
                        <>
                            <p>{data.address.street}, {data.address.number ?? "s/n"}</p>
                            {data.address.complement && <p>Complemento: {data.address.complement}</p>}
                            <p>{data.address.neighborhood}</p>
                            <p>{data.address.city} - {data.address.state}</p>
                            <p>CEP: {data.address.zipCode}</p>
                        </>
                    ) : (
                        <p>Endereço não informado.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Ações do KYC</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        Solicitar Revisão
                    </Button>
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        Aprovar KYC
                    </Button>
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                        Rejeitar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
