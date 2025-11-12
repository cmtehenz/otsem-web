import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Balance = {
    accountHolderId: string;
    availableBalance: number;
    blockedBalance: number;
    totalBalance: number;
    currency: string;
    updatedAt: string;
};

type Props = {
    balance: Balance | null;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export default function AccountBalance({ balance }: Props): React.JSX.Element {
    if (!balance) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Saldo da Conta</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Nenhum saldo disponível</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border-2 border-[#b852ff]/20 bg-linear-to-br from-[#b852ff]/5 to-[#faffff] shadow-lg">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(balance.availableBalance)}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Bloqueado</p>
                        <p className="text-lg font-semibold text-orange-600">
                            {formatCurrency(balance.blockedBalance)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Total</p>
                        <p className="text-lg font-semibold">
                            {formatCurrency(balance.totalBalance)}
                        </p>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Atualizado em: {new Date(balance.updatedAt).toLocaleString("pt-BR")}
                </p>
            </CardContent>
        </Card>
    );
}