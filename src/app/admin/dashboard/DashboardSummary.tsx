import * as React from "react";
import { Banknote, Users, KeyRound, CreditCard } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type DashboardSummaryProps = {
    summary: {
        totalUsers: number;
        activeToday: number;
        volumeBRL: number;
        pixKeys: number;
        cardTxs: number;
        chargebacks: number;
    } | null;
};

export default function DashboardSummary({ summary }: DashboardSummaryProps) {
    if (!summary) return null;

    const avgVolumePerUser = summary.totalUsers > 0 ? summary.volumeBRL / summary.totalUsers : 0;
    const activePercentage = summary.totalUsers > 0 ? (summary.activeToday / summary.totalUsers) * 100 : 0;
    const chargebackRate = summary.cardTxs > 0 ? (summary.chargebacks / summary.cardTxs) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total de usuários */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
                    <Users className="size-5 text-[#b852ff]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{summary.totalUsers}</div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{summary.activeToday} ativos hoje</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {activePercentage.toFixed(1)}% de taxa de ativação
                    </p>
                </CardContent>
            </Card>

            {/* Volume BRL */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Volume (24h)</CardTitle>
                    <Banknote className="size-5 text-[#f8bc07]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{summary.volumeBRL.toFixed(2)} BRL</div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Média: {(avgVolumePerUser).toFixed(2)} BRL/usuário
                    </p>
                </CardContent>
            </Card>

            {/* Chaves Pix */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Chaves Pix</CardTitle>
                    <KeyRound className="size-5 text-[#00d9ff]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{summary.pixKeys}</div>
                    <p className="mt-2 text-xs text-muted-foreground">Gerenciadas na plataforma</p>
                </CardContent>
            </Card>

            {/* Transações de Cartão */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transações Cartão</CardTitle>
                    <CreditCard className="size-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{summary.cardTxs}</div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Taxa de chargeback: {chargebackRate.toFixed(2)}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}