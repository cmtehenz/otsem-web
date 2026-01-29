"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Shield, Wallet, ArrowUpDown, BadgeCheck, UserX, UserCheck, Edit, RefreshCw, Percent, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type UserDetail = {
    id: string;
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    role: "CUSTOMER" | "ADMIN";
    kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_STARTED";
    kycLevel?: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
    customerType?: "PF" | "PJ";
    accountStatus: "ACTIVE" | "BLOCKED" | "SUSPENDED";
    balanceBRL: number;
    spreadPercent?: number;
    address: {
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
    kycDetails: {
        submittedAt: string | null;
        reviewedAt: string | null;
        reviewedBy: string | null;
        rejectReason: string | null;
        documentType: string | null;
    } | null;
};

type UserLimits = {
    kycLevel: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
    customerType: "PF" | "PJ";
    monthlyLimit: number;
    usedThisMonth: number;
    remainingLimit: number;
    resetDate: string;
};

const KYC_LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; limits: { PF: string; PJ: string } }> = {
    LEVEL_1: { 
        label: "Nível 1", 
        color: "text-amber-600", 
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        limits: { PF: "R$ 30.000/mês", PJ: "R$ 50.000/mês" }
    },
    LEVEL_2: { 
        label: "Nível 2", 
        color: "text-blue-600", 
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        limits: { PF: "R$ 100.000/mês", PJ: "R$ 200.000/mês" }
    },
    LEVEL_3: { 
        label: "Nível 3", 
        color: "text-emerald-600", 
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        limits: { PF: "Ilimitado", PJ: "Ilimitado" }
    },
};

type Transaction = {
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
};

type UserTransactionsResponse = {
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
};

const kycStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
    APPROVED: { label: "Aprovado", variant: "default", color: "text-green-600" },
    PENDING: { label: "Pendente", variant: "secondary", color: "text-amber-600" },
    REJECTED: { label: "Rejeitado", variant: "destructive", color: "text-red-600" },
    NOT_STARTED: { label: "Não iniciado", variant: "outline", color: "text-slate-500" },
};

const accountStatusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Ativo", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    BLOCKED: { label: "Bloqueado", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    SUSPENDED: { label: "Suspenso", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatCpfCnpj(value: string): string {
    if (!value) return "—";
    if (value.length === 11) {
        return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (value.length === 14) {
        return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return value;
}

function formatPhone(value: string): string {
    if (!value) return "—";
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
}

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<UserDetail | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [loadingTxs, setLoadingTxs] = React.useState(false);
    const [actionLoading, setActionLoading] = React.useState(false);
    const [spreadModalOpen, setSpreadModalOpen] = React.useState(false);
    const [spreadValue, setSpreadValue] = React.useState("");
    const [savingSpread, setSavingSpread] = React.useState(false);
    const [kycLevelModalOpen, setKycLevelModalOpen] = React.useState(false);
    const [selectedKycLevel, setSelectedKycLevel] = React.useState<"LEVEL_1" | "LEVEL_2" | "LEVEL_3">("LEVEL_1");
    const [savingKycLevel, setSavingKycLevel] = React.useState(false);
    const [userLimits, setUserLimits] = React.useState<UserLimits | null>(null);
    const [loadingLimits, setLoadingLimits] = React.useState(false);

    const loadUser = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await http.get<UserDetail>(`/admin/users/${userId}`);
            setUser(response.data);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar usuário");
            router.push("/admin/users");
        } finally {
            setLoading(false);
        }
    }, [userId, router]);

    const loadTransactions = React.useCallback(async () => {
        try {
            setLoadingTxs(true);
            const response = await http.get<UserTransactionsResponse>(`/admin/users/${userId}/transactions?limit=10`);
            setTransactions(response.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTxs(false);
        }
    }, [userId]);

    React.useEffect(() => {
        loadUser();
        loadTransactions();
    }, [loadUser, loadTransactions]);

    const handleBlockUser = async () => {
        try {
            setActionLoading(true);
            await http.post(`/admin/users/${userId}/block`);
            toast.success("Usuário bloqueado");
            loadUser();
        } catch (err) {
            toast.error("Falha ao bloquear usuário");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblockUser = async () => {
        try {
            setActionLoading(true);
            await http.post(`/admin/users/${userId}/unblock`);
            toast.success("Usuário desbloqueado");
            loadUser();
        } catch (err) {
            toast.error("Falha ao desbloquear usuário");
        } finally {
            setActionLoading(false);
        }
    };

    const openSpreadModal = () => {
        setSpreadValue(user?.spreadPercent?.toString() ?? "0.95");
        setSpreadModalOpen(true);
    };

    const handleSaveSpread = async () => {
        const spreadNum = parseFloat(spreadValue);
        if (isNaN(spreadNum) || spreadNum < 0 || spreadNum > 100) {
            toast.error("Spread deve ser um valor entre 0 e 100");
            return;
        }

        try {
            setSavingSpread(true);
            const response = await http.patch(`/admin/users/${userId}/spread`, {
                spreadPercent: spreadNum,
            });

            // Atualiza o estado local com o novo spread
            if (user) {
                setUser({
                    ...user,
                    spreadPercent: response.data?.spreadPercent ?? spreadNum,
                });
            }
            
            toast.success(`Spread atualizado para ${spreadNum}%`);
            setSpreadModalOpen(false);
        } catch (err: any) {
            console.error("Spread update error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || "Falha ao atualizar spread";
            toast.error(errorMsg);
        } finally {
            setSavingSpread(false);
        }
    };

    const loadUserLimits = React.useCallback(async () => {
        try {
            setLoadingLimits(true);
            const response = await http.get<UserLimits>(`/admin/users/${userId}/limits`);
            setUserLimits(response.data);
        } catch (err) {
            console.error("Failed to load user limits:", err);
        } finally {
            setLoadingLimits(false);
        }
    }, [userId]);

    React.useEffect(() => {
        if (user) {
            loadUserLimits();
        }
    }, [user, loadUserLimits]);

    const openKycLevelModal = () => {
        setSelectedKycLevel(user?.kycLevel || "LEVEL_1");
        setKycLevelModalOpen(true);
    };

    const handleSaveKycLevel = async () => {
        try {
            setSavingKycLevel(true);
            await http.patch(`/admin/users/${userId}/kyc-level`, {
                kycLevel: selectedKycLevel,
            });
            
            if (user) {
                setUser({
                    ...user,
                    kycLevel: selectedKycLevel,
                });
            }
            
            loadUserLimits();
            toast.success(`Nível KYC atualizado para ${KYC_LEVEL_CONFIG[selectedKycLevel]?.label || selectedKycLevel}`);
            setKycLevelModalOpen(false);
        } catch (err: any) {
            console.error("KYC level update error:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || "Falha ao atualizar nível KYC";
            toast.error(errorMsg);
        } finally {
            setSavingKycLevel(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-96 flex-col items-center justify-center">
                <p className="text-muted-foreground">Usuário não encontrado</p>
                <Button variant="link" asChild>
                    <Link href="/admin/users">Voltar para lista</Link>
                </Button>
            </div>
        );
    }

    const kycInfo = kycStatusConfig[user.kycStatus] || kycStatusConfig.NOT_STARTED;
    const statusInfo = accountStatusConfig[user.accountStatus] || accountStatusConfig.ACTIVE;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/users">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{user.name || "Usuário sem nome"}</h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadUser}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar
                    </Button>
                    {user.accountStatus === "ACTIVE" ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={actionLoading}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Bloquear
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Bloquear usuário?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        O usuário não poderá acessar a conta ou realizar transações até ser desbloqueado.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">
                                        Bloquear
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button variant="default" size="sm" onClick={handleUnblockUser} disabled={actionLoading}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Desbloquear
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Nome Completo</p>
                                <p className="font-medium">{user.name || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                                <p className="font-mono font-medium">{formatCpfCnpj(user.cpfCnpj)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> Email
                                </p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Telefone
                                </p>
                                <p className="font-medium">{formatPhone(user.phone)}</p>
                            </div>
                            {user.address && (
                                <div className="space-y-1 sm:col-span-2">
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> Endereço
                                    </p>
                                    <p className="font-medium">
                                        {user.address.street}, {user.address.number}
                                        {user.address.complement ? ` - ${user.address.complement}` : ""}
                                        <br />
                                        {user.address.neighborhood}, {user.address.city} - {user.address.state}
                                        <br />
                                        CEP: {user.address.zipCode}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verificação KYC</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                    user.kycStatus === "APPROVED" ? "bg-green-100 dark:bg-green-900/30" :
                                    user.kycStatus === "PENDING" ? "bg-amber-100 dark:bg-amber-900/30" :
                                    user.kycStatus === "REJECTED" ? "bg-red-100 dark:bg-red-900/30" :
                                    "bg-slate-100 dark:bg-slate-800"
                                }`}>
                                    <BadgeCheck className={`h-6 w-6 ${kycInfo.color}`} />
                                </div>
                                <div>
                                    <Badge variant={kycInfo.variant}>{kycInfo.label}</Badge>
                                    {user.kycDetails?.rejectReason && (
                                        <p className="mt-1 text-sm text-red-600">{user.kycDetails.rejectReason}</p>
                                    )}
                                </div>
                            </div>

                            {user.kycDetails && (
                                <div className="mt-4 grid gap-3 text-sm">
                                    {user.kycDetails.documentType && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tipo de documento</span>
                                            <span>{user.kycDetails.documentType}</span>
                                        </div>
                                    )}
                                    {user.kycDetails.submittedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Enviado em</span>
                                            <span>{formatDate(user.kycDetails.submittedAt)}</span>
                                        </div>
                                    )}
                                    {user.kycDetails.reviewedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Revisado em</span>
                                            <span>{formatDate(user.kycDetails.reviewedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Nível KYC e Limites
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={openKycLevelModal}>
                                <Edit className="mr-2 h-4 w-4" />
                                Alterar Nível
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loadingLimits ? (
                                <div className="flex h-24 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Nível atual</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${KYC_LEVEL_CONFIG[user.kycLevel || "LEVEL_1"]?.bgColor} ${KYC_LEVEL_CONFIG[user.kycLevel || "LEVEL_1"]?.color}`}>
                                            {KYC_LEVEL_CONFIG[user.kycLevel || "LEVEL_1"]?.label || "Nível 1"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Tipo</span>
                                        <span className="font-medium">{user.customerType === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}</span>
                                    </div>
                                    <Separator />
                                    {userLimits && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Limite mensal</span>
                                                <span className="font-bold">
                                                    {userLimits.kycLevel === "LEVEL_3" 
                                                        ? "Ilimitado" 
                                                        : formatBRL(userLimits.monthlyLimit)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Utilizado este mês</span>
                                                <span className="font-medium">{formatBRL(userLimits.usedThisMonth)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Disponível</span>
                                                <span className="font-medium text-green-600">
                                                    {userLimits.kycLevel === "LEVEL_3" 
                                                        ? "Ilimitado" 
                                                        : formatBRL(userLimits.remainingLimit)}
                                                </span>
                                            </div>
                                            {userLimits.kycLevel !== "LEVEL_3" && (
                                                <div className="mt-2">
                                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all ${
                                                                (userLimits.usedThisMonth / userLimits.monthlyLimit) >= 0.8 
                                                                    ? "bg-amber-500" 
                                                                    : "bg-primary"
                                                            }`}
                                                            style={{ width: `${Math.min((userLimits.usedThisMonth / userLimits.monthlyLimit) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {((userLimits.usedThisMonth / userLimits.monthlyLimit) * 100).toFixed(1)}% utilizado
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Transações Recentes</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/transactions?userId=${userId}`}>Ver todas</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loadingTxs ? (
                                <div className="flex h-32 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Nenhuma transação encontrada
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {tx.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {tx.description || "—"}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold tabular-nums">
                                                    {formatBRL(tx.amount)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(tx.createdAt)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Saldo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{formatBRL(user.balanceBRL)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Percent className="h-5 w-5" />
                                Spread
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={openSpreadModal}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-[#6F00FF]">
                                {user.spreadPercent?.toFixed(2) ?? "0.95"}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Taxa aplicada nas conversões BRL → USDT
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Status da Conta
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.className}`}>
                                {statusInfo.label}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Datas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cadastro</span>
                                <span>{formatDate(user.createdAt)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Último login</span>
                                <span>{formatDate(user.lastLoginAt)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Última atualização</span>
                                <span>{formatDate(user.updatedAt)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={spreadModalOpen} onOpenChange={setSpreadModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajustar Spread do Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="spread">Spread (%)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="spread"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={spreadValue}
                                    onChange={(e) => setSpreadValue(e.target.value)}
                                    placeholder="Ex: 0.95"
                                />
                                <span className="text-muted-foreground">%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                O spread é a taxa cobrada sobre o valor da conversão BRL → USDT.
                                <br />
                                Exemplos: 0.95% (padrão), 1%, 2.5%, 5%
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSpreadModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveSpread} disabled={savingSpread}>
                            {savingSpread ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={kycLevelModalOpen} onOpenChange={setKycLevelModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Alterar Nível KYC</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Selecione o novo nível KYC para este cliente. O limite mensal será ajustado automaticamente.
                        </p>
                        <div className="space-y-3">
                            {(["LEVEL_1", "LEVEL_2", "LEVEL_3"] as const).map((level) => {
                                const config = KYC_LEVEL_CONFIG[level];
                                const customerType = user?.customerType || "PF";
                                return (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setSelectedKycLevel(level)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                            selectedKycLevel === level
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${selectedKycLevel === level ? "bg-primary" : "bg-slate-200"}`} />
                                                <span className={`font-bold ${config.color}`}>{config.label}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {config.limits[customerType]}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setKycLevelModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveKycLevel} disabled={savingKycLevel}>
                            {savingKycLevel ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
