"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, Eye, MoreHorizontal, UserCheck, UserX, Mail } from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDebounce } from "use-debounce";
import { SendEmailModal } from "@/components/modals/send-email-modal";

type User = {
    id: string;
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    role: "CUSTOMER" | "ADMIN";
    kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_STARTED";
    accountStatus: "ACTIVE" | "BLOCKED" | "SUSPENDED";
    balanceBRL: number;
    createdAt: string;
    lastLoginAt: string | null;
};

type UsersResponse = {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

const kycStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    APPROVED: { label: "Aprovado", variant: "default" },
    PENDING: { label: "Pendente", variant: "secondary" },
    REJECTED: { label: "Rejeitado", variant: "destructive" },
    NOT_STARTED: { label: "Não iniciado", variant: "outline" },
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
        month: "short",
        year: "numeric",
    });
}

function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function maskCpfCnpj(value: string): string {
    if (!value) return "—";
    if (value.length === 11) {
        return `***.***.${value.slice(6, 9)}-**`;
    }
    if (value.length === 14) {
        return `**.***.${value.slice(5, 8)}/****-**`;
    }
    return value;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = React.useState(true);
    const [users, setUsers] = React.useState<User[]>([]);
    const [pagination, setPagination] = React.useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });

    const [search, setSearch] = React.useState(searchParams?.get("search") || "");
    const [debouncedSearch] = useDebounce(search, 500);
    const [kycFilter, setKycFilter] = React.useState(searchParams?.get("kyc") || "all");
    const [statusFilter, setStatusFilter] = React.useState(searchParams?.get("status") || "all");

    const [emailModalOpen, setEmailModalOpen] = React.useState(false);
    const [selectedUserForEmail, setSelectedUserForEmail] = React.useState<User | null>(null);

    const openEmailModal = (user: User) => {
        setSelectedUserForEmail(user);
        setEmailModalOpen(true);
    };

    const loadUsers = React.useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (kycFilter !== "all") params.set("kycStatus", kycFilter);
            if (statusFilter !== "all") params.set("accountStatus", statusFilter);

            const response = await http.get<UsersResponse>(`/admin/users?${params.toString()}`);
            setUsers(response.data.data);
            setPagination({
                total: response.data.total,
                page: response.data.page,
                limit: response.data.limit,
                totalPages: response.data.totalPages,
                hasNext: response.data.hasNext,
                hasPrev: response.data.hasPrev,
            });
        } catch (err) {
            console.error(err);
            toast.error("Falha ao carregar usuários");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, kycFilter, statusFilter]);

    React.useEffect(() => {
        loadUsers(1);
    }, [loadUsers]);

    const handlePageChange = (newPage: number) => {
        loadUsers(newPage);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
                    <p className="text-sm text-muted-foreground">
                        {pagination.total} usuários cadastrados
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={kycFilter} onValueChange={setKycFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status KYC" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos KYC</SelectItem>
                                    <SelectItem value="APPROVED">Aprovado</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                                    <SelectItem value="NOT_STARTED">Não iniciado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                                    <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                                    <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                            {(search || kycFilter !== "all" || statusFilter !== "all") && (
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSearch("");
                                        setKycFilter("all");
                                        setStatusFilter("all");
                                    }}
                                >
                                    Limpar filtros
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>CPF/CNPJ</TableHead>
                                            <TableHead>KYC</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Saldo</TableHead>
                                            <TableHead>Cadastro</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => {
                                            const kycInfo = kycStatusConfig[user.kycStatus] || kycStatusConfig.NOT_STARTED;
                                            const statusInfo = accountStatusConfig[user.accountStatus] || accountStatusConfig.ACTIVE;

                                            return (
                                                <TableRow key={user.id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{user.name || "—"}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">{maskCpfCnpj(user.cpfCnpj)}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={kycInfo.variant} className="text-xs">
                                                            {kycInfo.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-semibold tabular-nums">
                                                            {formatBRL(user.balanceBRL)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDate(user.createdAt)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/users/${user.id}`}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Ver detalhes
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEmailModal(user)}>
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Enviar email
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {user.accountStatus === "ACTIVE" ? (
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        Bloquear usuário
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem className="text-green-600">
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Desbloquear usuário
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrev}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <span className="text-sm">
                                        Página {pagination.page} de {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNext}
                                    >
                                        Próxima
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {selectedUserForEmail && (
                <SendEmailModal
                    open={emailModalOpen}
                    onOpenChange={setEmailModalOpen}
                    userId={selectedUserForEmail.id}
                    userName={selectedUserForEmail.name}
                    userEmail={selectedUserForEmail.email}
                />
            )}
        </div>
    );
}
