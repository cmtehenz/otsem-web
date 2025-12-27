"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Mail,
  Hash,
  Percent,
  RefreshCw,
  CreditCard,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  updatedAt: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  kycStatus: string;
  totalVolume: number;
  createdAt: string;
};

type Commission = {
  id: string;
  amount: number;
  conversionId: string;
  conversionAmount: number;
  status: "PENDING" | "PAID";
  paidAt: string | null;
  createdAt: string;
  clientName: string;
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const affiliateId = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [affiliate, setAffiliate] = React.useState<Affiliate | null>(null);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [commissions, setCommissions] = React.useState<Commission[]>([]);
  const [loadingCommissions, setLoadingCommissions] = React.useState(false);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [paying, setPaying] = React.useState(false);

  const [editForm, setEditForm] = React.useState({
    name: "",
    email: "",
    spreadRate: "",
  });

  const loadAffiliate = React.useCallback(async () => {
    if (!affiliateId) return;
    try {
      setLoading(true);
      const response = await http.get<{
        affiliate: Affiliate;
        clients: Client[];
      }>(`/admin/affiliates/${affiliateId}`);
      setAffiliate(response.data.affiliate);
      setClients(response.data.clients || []);
      setEditForm({
        name: response.data.affiliate.name,
        email: response.data.affiliate.email,
        spreadRate: (response.data.affiliate.spreadRate * 100).toFixed(2),
      });
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar afiliado");
      router.push("/admin/affiliates");
    } finally {
      setLoading(false);
    }
  }, [affiliateId, router]);

  const loadCommissions = React.useCallback(async () => {
    if (!affiliateId) return;
    try {
      setLoadingCommissions(true);
      const response = await http.get<{ data: Commission[] }>(
        `/admin/affiliates/${affiliateId}/commissions`
      );
      setCommissions(response.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar comissões");
    } finally {
      setLoadingCommissions(false);
    }
  }, [affiliateId]);

  React.useEffect(() => {
    loadAffiliate();
    loadCommissions();
  }, [loadAffiliate, loadCommissions]);

  const handleToggleActive = async () => {
    if (!affiliate) return;
    try {
      setUpdating(true);
      await http.patch(`/admin/affiliates/${affiliate.id}/toggle-active`);
      setAffiliate({ ...affiliate, isActive: !affiliate.isActive });
      toast.success(
        affiliate.isActive ? "Afiliado desativado" : "Afiliado ativado"
      );
    } catch {
      toast.error("Falha ao atualizar afiliado");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdate = async () => {
    if (!affiliate) return;
    try {
      setUpdating(true);
      await http.patch(`/admin/affiliates/${affiliate.id}`, {
        name: editForm.name,
        email: editForm.email,
        spreadRate: parseFloat(editForm.spreadRate) / 100,
      });
      setAffiliate({
        ...affiliate,
        name: editForm.name,
        email: editForm.email,
        spreadRate: parseFloat(editForm.spreadRate) / 100,
      });
      setShowEditModal(false);
      toast.success("Afiliado atualizado!");
    } catch {
      toast.error("Falha ao atualizar afiliado");
    } finally {
      setUpdating(false);
    }
  };

  const handlePayCommissions = async () => {
    if (!affiliate) return;
    try {
      setPaying(true);
      await http.post(`/admin/affiliates/${affiliate.id}/pay-commissions`);
      setAffiliate({ ...affiliate, pendingCommission: 0 });
      loadCommissions();
      setShowPayModal(false);
      toast.success("Comissões marcadas como pagas!");
    } catch {
      toast.error("Falha ao pagar comissões");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Afiliado não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/admin/affiliates">Voltar</Link>
        </Button>
      </div>
    );
  }

  const pendingCommissionsCount = commissions.filter(
    (c) => c.status === "PENDING"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/affiliates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{affiliate.name}</h1>
          <p className="text-muted-foreground">{affiliate.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            Editar
          </Button>
          <Button
            variant={affiliate.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            disabled={updating}
          >
            {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {affiliate.isActive ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {affiliate.isActive ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge
              className={
                affiliate.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : ""
              }
              variant={affiliate.isActive ? "default" : "secondary"}
            >
              {affiliate.isActive ? "Ativo" : "Inativo"}
            </Badge>
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
            <div className="text-2xl font-bold">{affiliate.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comissão Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(affiliate.totalCommission)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Comissão Pendente
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {formatCurrency(affiliate.pendingCommission)}
            </div>
            {affiliate.pendingCommission > 0 && (
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setShowPayModal(true)}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Pagar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-mono font-medium">{affiliate.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Comissão</p>
                <p className="font-medium">
                  {formatPercent(affiliate.spreadRate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{affiliate.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(affiliate.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clients" onValueChange={(v) => v === "commissions" && loadCommissions()}>
        <TabsList>
          <TabsTrigger value="clients">
            Clientes ({clients.length})
          </TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Nenhum cliente indicado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Clientes cadastrados com o código {affiliate.code} aparecerão aqui
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead className="text-center">KYC</TableHead>
                      <TableHead className="text-right">Volume Total</TableHead>
                      <TableHead className="text-right">Data Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {client.cpfCnpj}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              client.kycStatus === "APPROVED"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              client.kycStatus === "APPROVED"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : ""
                            }
                          >
                            {client.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(client.totalVolume)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(client.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Comissões</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCommissions}
                  disabled={loadingCommissions}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      loadingCommissions ? "animate-spin" : ""
                    }`}
                  />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCommissions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Nenhuma comissão registrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comissões de conversões aparecerão aqui
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">
                        Valor Conversão
                      </TableHead>
                      <TableHead className="text-right">Comissão</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Pago em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {formatDateTime(commission.createdAt)}
                        </TableCell>
                        <TableCell>{commission.clientName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(commission.conversionAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(commission.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {commission.status === "PAID" ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Pago
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-amber-500 border-amber-500"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {commission.paidAt
                            ? formatDateTime(commission.paidAt)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Afiliado</DialogTitle>
            <DialogDescription>
              Atualize as informações do afiliado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-spreadRate">Taxa de Comissão (%)</Label>
              <Input
                id="edit-spreadRate"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editForm.spreadRate}
                onChange={(e) =>
                  setEditForm({ ...editForm, spreadRate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={updating}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPayModal} onOpenChange={setShowPayModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a marcar{" "}
              <strong>{formatCurrency(affiliate.pendingCommission)}</strong> em
              comissões como pagas para {affiliate.name}.
              <br />
              <br />
              Esta ação não pode ser desfeita. Certifique-se de ter realizado a
              transferência antes de confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={paying}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePayCommissions} disabled={paying}>
              {paying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
