"use client";

import * as React from "react";
import Link from "next/link";
import {
  Loader2,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Search,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Affiliate = {
  id: string;
  code: string;
  name: string;
  email: string;
  spreadRate: number;
  isActive: boolean;
  totalClients: number;
  totalCommission: number;
  pendingCommission: number;
  createdAt: string;
};

type AffiliatesResponse = {
  data: Affiliate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export default function AdminAffiliatesPage() {
  const [loading, setLoading] = React.useState(true);
  const [affiliates, setAffiliates] = React.useState<Affiliate[]>([]);
  const [search, setSearch] = React.useState("");
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newAffiliate, setNewAffiliate] = React.useState({
    name: "",
    email: "",
    code: "",
    spreadRate: "0.35",
  });

  const [stats, setStats] = React.useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalClients: 0,
    totalCommission: 0,
    pendingCommission: 0,
  });

  const loadAffiliates = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await http.get<AffiliatesResponse>("/admin/affiliates", {
        params: { search, limit: 50 },
      });
      setAffiliates(response.data.data);

      const total = response.data.data.reduce(
        (acc, a) => ({
          totalAffiliates: acc.totalAffiliates + 1,
          activeAffiliates: acc.activeAffiliates + (a.isActive ? 1 : 0),
          totalClients: acc.totalClients + a.totalClients,
          totalCommission: acc.totalCommission + a.totalCommission,
          pendingCommission: acc.pendingCommission + a.pendingCommission,
        }),
        {
          totalAffiliates: 0,
          activeAffiliates: 0,
          totalClients: 0,
          totalCommission: 0,
          pendingCommission: 0,
        }
      );
      setStats(total);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar afiliados");
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    loadAffiliates();
  }, [loadAffiliates]);

  const handleToggleActive = async (affiliate: Affiliate) => {
    try {
      setUpdating(affiliate.id);
      await http.patch(`/admin/affiliates/${affiliate.id}/toggle-active`);
      setAffiliates((prev) =>
        prev.map((a) =>
          a.id === affiliate.id ? { ...a, isActive: !a.isActive } : a
        )
      );
      setStats((prev) => ({
        ...prev,
        activeAffiliates: affiliate.isActive
          ? prev.activeAffiliates - 1
          : prev.activeAffiliates + 1,
      }));
      toast.success(
        affiliate.isActive ? "Afiliado desativado" : "Afiliado ativado"
      );
    } catch {
      toast.error("Falha ao atualizar afiliado");
    } finally {
      setUpdating(null);
    }
  };

  const handleCreate = async () => {
    if (!newAffiliate.name || !newAffiliate.email || !newAffiliate.code) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setCreating(true);
      await http.post("/admin/affiliates", {
        name: newAffiliate.name,
        email: newAffiliate.email,
        code: newAffiliate.code.toUpperCase(),
        spreadRate: parseFloat(newAffiliate.spreadRate) / 100,
      });
      toast.success("Afiliado criado com sucesso!");
      setShowCreateModal(false);
      setNewAffiliate({ name: "", email: "", code: "", spreadRate: "0.35" });
      loadAffiliates();
    } catch (err) {
      console.error(err);
      toast.error("Falha ao criar afiliado");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Afiliados</h1>
          <p className="text-muted-foreground">
            Gerencie o programa de afiliados e comissões
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadAffiliates}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Afiliado
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Afiliados
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAffiliates} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Indicados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">via afiliados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comissões Pagas
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalCommission)}
            </div>
            <p className="text-xs text-muted-foreground">total histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comissões Pendentes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(stats.pendingCommission)}
            </div>
            <p className="text-xs text-muted-foreground">a pagar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Afiliados</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : affiliates.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">
                Nenhum afiliado encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Crie o primeiro afiliado para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-right">Comissão Total</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{affiliate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {affiliate.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatPercent(affiliate.spreadRate)}
                    </TableCell>
                    <TableCell className="text-center">
                      {affiliate.totalClients}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(affiliate.totalCommission)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          affiliate.pendingCommission > 0
                            ? "text-amber-500 font-medium"
                            : ""
                        }
                      >
                        {formatCurrency(affiliate.pendingCommission)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {affiliate.isActive ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={updating === affiliate.id}
                          >
                            {updating === affiliate.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/affiliates/${affiliate.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(affiliate)}
                          >
                            {affiliate.isActive ? (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Afiliado</DialogTitle>
            <DialogDescription>
              Crie um novo afiliado para o programa de indicações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome do afiliado"
                value={newAffiliate.name}
                onChange={(e) =>
                  setNewAffiliate({ ...newAffiliate, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newAffiliate.email}
                onChange={(e) =>
                  setNewAffiliate({ ...newAffiliate, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código de Indicação *</Label>
              <Input
                id="code"
                placeholder="CODIGO123"
                value={newAffiliate.code}
                onChange={(e) =>
                  setNewAffiliate({
                    ...newAffiliate,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Código único que os clientes usarão no cadastro
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spreadRate">Taxa de Comissão (%)</Label>
              <Input
                id="spreadRate"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="0.35"
                value={newAffiliate.spreadRate}
                onChange={(e) =>
                  setNewAffiliate({
                    ...newAffiliate,
                    spreadRate: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Porcentagem do spread que será comissão do afiliado
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Afiliado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
