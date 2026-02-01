"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, Eye, MoreHorizontal, UserCheck, UserX, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
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

    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [deleting, setDeleting] = React.useState(false);
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = React.useState(false);
    const [deleteBatchDialogOpen, setDeleteBatchDialogOpen] = React.useState(false);
    const [deleteSingleDialogUser, setDeleteSingleDialogUser] = React.useState<User | null>(null);

    const openEmailModal = (user: User) => {
        setSelectedUserForEmail(user);
        setEmailModalOpen(true);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(users.map((u) => u.id)));
        }
    };

    const handleDeleteSingle = async (userId: string) => {
        try {
            setDeleting(true);
            await http.delete(`/admin/users/${userId}`);
            toast.success("Usuário excluído com sucesso");
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            loadUsers(pagination.page);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao excluir usuário");
        } finally {
            setDeleting(false);
            setDeleteSingleDialogUser(null);
        }
    };

    const handleDeleteBatch = async () => {
        try {
            setDeleting(true);
            await http.post("/admin/users/delete-batch", { ids: Array.from(selectedIds) });
            toast.success(`${selectedIds.size} usuário(s) excluído(s) com sucesso`);
            setSelectedIds(new Set());
            loadUsers(pagination.page);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao excluir usuários selecionados");
        } finally {
            setDeleting(false);
            setDeleteBatchDialogOpen(false);
        }
    };

    const handleDeleteAll = async () => {
        try {
            setDeleting(true);
            await http.delete("/admin/users/all");
            toast.success("Todos os clientes foram excluídos");
            setSelectedIds(new Set());
            loadUsers(1);
        } catch (err) {
            console.error(err);
            toast.error("Falha ao excluir todos os clientes");
        } finally {
            setDeleting(false);
            setDeleteAllDialogOpen(false);
        }
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
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteAllDialogOpen(true)}
                    disabled={deleting || pagination.total === 0}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir todos
                </Button>
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
                            {selectedIds.size > 0 && (
                                <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                        {selectedIds.size} usuário(s) selecionado(s)
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedIds(new Set())}
                                        >
                                            Limpar seleção
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setDeleteBatchDialogOpen(true)}
                                            disabled={deleting}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir selecionados
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]">
                                                <Checkbox
                                                    checked={users.length > 0 && selectedIds.size === users.length}
                                                    onCheckedChange={toggleSelectAll}
                                                    aria-label="Selecionar todos"
                                                />
                                            </TableHead>
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
                                                        <Checkbox
                                                            checked={selectedIds.has(user.id)}
                                                            onCheckedChange={() => toggleSelect(user.id)}
                                                            aria-label={`Selecionar ${user.name || user.email}`}
                                                        />
                                                    </TableCell>
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
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => setDeleteSingleDialogUser(user)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Excluir usuário
                                                                </DropdownMenuItem>
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

            {/* Delete single user confirmation */}
            <AlertDialog open={!!deleteSingleDialogUser} onOpenChange={(open) => { if (!open) setDeleteSingleDialogUser(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{deleteSingleDialogUser?.name || deleteSingleDialogUser?.email}</strong>?
                            Todos os dados relacionados (contas, carteiras, transações, conversões, comissões) serão removidos permanentemente.
                            Essa ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteSingleDialogUser && handleDeleteSingle(deleteSingleDialogUser.id)}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete batch confirmation */}
            <AlertDialog open={deleteBatchDialogOpen} onOpenChange={setDeleteBatchDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuários selecionados?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{selectedIds.size}</strong> usuário(s)?
                            Todos os dados relacionados (contas, carteiras, transações, conversões, comissões) serão removidos permanentemente.
                            Essa ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteBatch}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Excluir {selectedIds.size} usuário(s)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete all confirmation */}
            <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir TODOS os clientes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>todos os {pagination.total} clientes</strong> do sistema?
                            Todos os dados relacionados (contas, carteiras, transações, conversões, comissões) serão removidos permanentemente.
                            Essa ação é irreversível e não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteAll}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Excluir todos
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
