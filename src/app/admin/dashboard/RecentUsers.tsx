import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

type RecentUsersProps = {
    users: {
        id: string;
        name?: string;
        email: string;
        createdAt: string;
        accountStatus?: string;
    }[];
};

export default function RecentUsers({ users }: RecentUsersProps) {
    if (users.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário recente</p>;

    return (
        <Card className="rounded-2xl border-[#000000]/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#000000]/5 pb-4">
                <CardTitle className="text-base font-semibold">Novos Usuários</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <th className="text-xs">Nome</th>
                                <th className="text-xs">Email</th>
                                <th className="text-xs">Status</th>
                                <th className="text-right text-xs">Criado</th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-[#faffff]/50">
                                    <TableCell className="text-sm font-medium">{user.name || "—"}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`badge ${user.accountStatus === "approved" ? "bg-green-500" : "bg-yellow-500"}`}>
                                            {user.accountStatus || "pending"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}