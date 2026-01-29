"use client";

import * as React from "react";
import { Copy, Users, DollarSign, Clock, Check, Share2, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import http from "@/lib/http";

type Referral = {
    id: string;
    name: string;
    email: string;
    registeredAt: string;
    totalVolume: number;
    commissionEarned: number;
    status: "active" | "inactive";
};

type AffiliateStats = {
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    commissionRate: number;
};

type Commission = {
    id: string;
    referralId: string;
    referralName: string;
    amount: number;
    transactionAmount: number;
    status: "pending" | "paid";
    createdAt: string;
    paidAt?: string;
};

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function AffiliatesPage() {
    const [loading, setLoading] = React.useState(true);
    const [activating, setActivating] = React.useState(false);
    const [stats, setStats] = React.useState<AffiliateStats | null>(null);
    const [referrals, setReferrals] = React.useState<Referral[]>([]);
    const [commissions, setCommissions] = React.useState<Commission[]>([]);
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"referrals" | "commissions">("referrals");

    const loadAffiliateData = React.useCallback(async () => {
        try {
            const [statsRes, referralsRes, commissionsRes] = await Promise.all([
                http.get<{ data: AffiliateStats }>("/customers/me/affiliate"),
                http.get<{ data: Referral[] }>("/customers/me/affiliate/referrals"),
                http.get<{ data: Commission[] }>("/customers/me/affiliate/commissions"),
            ]);

            setStats(statsRes.data.data);
            setReferrals(referralsRes.data.data || []);
            setCommissions(commissionsRes.data.data || []);
            return true;
        } catch {
            return false;
        }
    }, []);

    const activateAffiliate = React.useCallback(async () => {
        setActivating(true);
        try {
            await http.post("/customers/me/affiliate/activate");
            await loadAffiliateData();
            toast.success("Programa de indicações ativado!");
        } catch (err) {
            console.error("Erro ao ativar afiliado:", err);
            toast.error("Erro ao ativar programa de indicações");
        } finally {
            setActivating(false);
        }
    }, [loadAffiliateData]);

    React.useEffect(() => {
        async function loadData() {
            const success = await loadAffiliateData();
            if (!success) {
                await activateAffiliate();
            }
            setLoading(false);
        }

        loadData();
    }, [loadAffiliateData, activateAffiliate]);

    const referralLink = stats?.referralCode
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${stats.referralCode}`
        : "";

    const copyLink = async () => {
        if (referralLink) {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            toast.success("Link copiado!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyCode = async () => {
        if (stats?.referralCode) {
            await navigator.clipboard.writeText(stats.referralCode);
            toast.success("Código copiado!");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Programa de Indicações</h1>
                    <p className="text-muted-foreground mt-1">Indique amigos e ganhe comissões</p>
                </div>

                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        {activating ? (
                            <>
                                <Loader2 className="h-16 w-16 text-[#6F00FF] mb-4 animate-spin" />
                                <h3 className="text-lg font-semibold mb-2">Ativando seu programa de indicações...</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Aguarde enquanto criamos seu código de indicação.
                                </p>
                            </>
                        ) : (
                            <>
                                <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Erro ao carregar indicações</h3>
                                <p className="text-muted-foreground text-center max-w-md mb-4">
                                    Não foi possível ativar seu programa de indicações. Tente novamente.
                                </p>
                                <Button 
                                    className="bg-gradient-to-r from-[#6F00FF] to-[#6F00FF]"
                                    onClick={activateAffiliate}
                                    disabled={activating}
                                >
                                    Tentar novamente
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Programa de Afiliados</h1>
                <p className="text-muted-foreground mt-1">Indique amigos e ganhe comissões em cada transação</p>
            </div>

            <Card className="bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] text-white border-0">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-white/80 text-sm mb-1">Seu link de indicação</p>
                            <div className="flex items-center gap-2">
                                <code className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-mono truncate max-w-[300px]">
                                    {referralLink}
                                </code>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={copyLink}
                                    className="shrink-0"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <p className="text-white/80 text-xs">Seu código</p>
                                <button
                                    onClick={copyCode}
                                    className="text-xl font-bold hover:underline cursor-pointer"
                                >
                                    {stats.referralCode}
                                </button>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="gap-2"
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "OtsemPay",
                                            text: "Use meu código de indicação e ganhe benefícios!",
                                            url: referralLink,
                                        });
                                    } else {
                                        copyLink();
                                    }
                                }}
                            >
                                <Share2 className="h-4 w-4" />
                                Compartilhar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Indicados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeReferrals} ativos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats.totalEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Comissão de {stats.commissionRate}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {formatCurrency(stats.pendingEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando pagamento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Já Recebido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#6F00FF]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#6F00FF]">
                            {formatCurrency(stats.paidEarnings)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total pago
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Suas Indicações</CardTitle>
                            <CardDescription>Acompanhe seus indicados e comissões</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === "referrals" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("referrals")}
                            >
                                Indicados
                            </Button>
                            <Button
                                variant={activeTab === "commissions" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTab("commissions")}
                            >
                                Comissões
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === "referrals" ? (
                        referrals.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-muted-foreground">
                                    Você ainda não tem indicados. Compartilhe seu link!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {referrals.map((referral) => (
                                    <div
                                        key={referral.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-[#6F00FF]/10 dark:bg-[#330080]/30 flex items-center justify-center">
                                                <span className="text-[#6F00FF] font-semibold">
                                                    {referral.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{referral.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Desde {formatDate(referral.registeredAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(referral.commissionEarned)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Volume: {formatCurrency(referral.totalVolume)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                Nenhuma comissão registrada ainda.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {commissions.map((commission) => (
                                <div
                                    key={commission.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div>
                                        <p className="font-medium">{commission.referralName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Transação de {formatCurrency(commission.transactionAmount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(commission.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <Badge
                                            variant={commission.status === "paid" ? "default" : "secondary"}
                                            className={
                                                commission.status === "paid"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            }
                                        >
                                            {commission.status === "paid" ? "Pago" : "Pendente"}
                                        </Badge>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(commission.amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
