"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Banknote, KeyRound, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DashboardKPIProps = {
    totalUsers: number;
    activeToday: number;
    volumeBRL: number;
    pixKeys: number;
    cardTxs: number;
    chargebacks: number;
};

export default function DashboardKPI({
    totalUsers,
    activeToday,
    volumeBRL,
    pixKeys,
    cardTxs,
    chargebacks,
}: DashboardKPIProps) {
    const activePercentage = totalUsers > 0 ? (activeToday / totalUsers) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total de usuários */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total de Usuários
                    </CardTitle>
                    <Users className="size-5 text-[#b852ff]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{totalUsers}</div>
                    <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <span>{activeToday} ativos hoje</span>
                        </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {activePercentage.toFixed(1)}% de taxa de ativação
                    </p>
                </CardContent>
            </Card>

            {/* Volume BRL */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Volume (24h)
                    </CardTitle>
                    <Banknote className="size-5 text-[#f8bc07]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{volumeBRL}</div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Média: {volumeBRL / Math.max(totalUsers, 1)}/usuário
                    </p>
                </CardContent>
            </Card>

            {/* Chaves Pix */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Chaves Pix
                    </CardTitle>
                    <KeyRound className="size-5 text-[#00d9ff]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{pixKeys}</div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Gerenciadas na plataforma
                    </p>
                </CardContent>
            </Card>

            {/* Transações de Cartão */}
            <Card className="rounded-2xl border-[#000000]/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Transações Cartão
                    </CardTitle>
                    <CreditCard className="size-5 text-[#6F00FF]" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{cardTxs}</div>
                    <div className="mt-2 flex items-center gap-2">
                        {chargebacks > 0 ? (
                            <Badge variant="destructive" className="gap-1">
                                {chargebacks} chargebacks
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                0 chargebacks
                            </Badge>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Taxa de chargeback: {((chargebacks / Math.max(cardTxs, 1)) * 100).toFixed(2)}%
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}