import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type AccountBalanceProps = {
    balance: {
        accountHolderId: string;
        availableBalance: number;
        blockedBalance: number;
        totalBalance: number;
        currency: string;
        updatedAt: string;
    } | null;
};

export default function AccountBalance({ balance }: AccountBalanceProps) {
    if (!balance) return null;

    return (
        <Card className="rounded-2xl border-2 border-[#b852ff]/20 bg-linear-to-br from-[#b852ff]/5 to-[#faffff] shadow-lg">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo da Conta</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Saldo Total</p>
                        <p className="text-4xl font-bold">{balance.totalBalance.toFixed(2)} {balance.currency}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white/50 p-3">
                            <p className="text-xs text-muted-foreground">Disponível</p>
                            <p className="text-lg font-semibold text-green-700">
                                {balance.availableBalance.toFixed(2)} {balance.currency}
                            </p>
                        </div>
                        <div className="rounded-lg bg-white/50 p-3">
                            <p className="text-xs text-muted-foreground">Bloqueado</p>
                            <p className="text-lg font-semibold text-orange-600">
                                {balance.blockedBalance.toFixed(2)} {balance.currency}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}