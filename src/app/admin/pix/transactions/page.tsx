"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowDownLeft,
    ArrowUpRight,
    QrCode,
    RefreshCw,
    Send,
} from "lucide-react";
import { toast } from "sonner";

import http from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/* -------------------------------------------
   CONSTANTES
------------------------------------------- */

const ACCOUNT_HOLDER_ID = "d78ae5b9-252c-44e8-ba68-71474d8d382e";

/* -------------------------------------------
   TYPES
------------------------------------------- */

type TxDirection = "out" | "in";
type TxStatus = "created" | "pending" | "confirmed" | "failed" | "refunded";
export type QrCodeFormat = "copy-paste" | "image" | "both";

export interface Transaction {
    id: string;
    endToEndId?: string;
    direction: TxDirection;
    amount: number;
    key?: string;
    keyType?: string;
    description?: string | null;
    status: TxStatus;
    createdAt: string;
    settledAt?: string | null;
    counterpartyName?: string | null;
    counterpartyTaxNumber?: string | null;
}

export interface HistoryResponse {
    items: Transaction[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PrecheckBankData {
    Ispb: string;
    Name: string;
    BankCode: string;
    Branch: string;
    Account: string;
    AccountType: string;
    AccountTypeId: number;
}

export interface PrecheckResponse {
    endToEndPixKey: string | null;
    name: string | null;
    taxNumber: string | null;
    bankData?: PrecheckBankData | null;
}

export interface SendPixResponse {
    ok: boolean;
    message?: string;
    endToEndId?: string;
}

export interface GenerateStaticQrResponse {
    ok: boolean;
    message?: string;
    data?: {
        identifier: string;
        pixKey: string;
        value: number | null;
        message: string | null;
        format: QrCodeFormat;
        copyPaste?: string | null;
        imageBase64?: string | null;
    };
}

/* -------------------------------------------
   SCHEMAS
------------------------------------------- */

const sendSchema = z.object({
    pixKey: z.string().min(3, "Informe a chave Pix"),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (use 10.00)"),
    description: z.string().optional(),
    runPrecheck: z.boolean(),
});

const receiveSchema = z.object({
    pixKey: z.string().min(3, 'Informe sua chave Pix para receber'),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido (use 10.00)').optional(),
    description: z.string().optional(),
    format: z.enum(['copy-paste', 'image', 'both']),
});

/* -------------------------------------------
   URL HELPERS
------------------------------------------- */

const HISTORY_URL = (id: string, params?: URLSearchParams) => {
    const base = `/pix/transactions/account-holders/${id}`;
    return params ? `${base}?${params.toString()}` : base;
};
const SEND_URL = (id: string) =>
    `/pix/transactions/account-holders/${id}/send`;
const PRECHECK_URL = (id: string, key: string, value: string) =>
    `/pix/transactions/account-holders/${id}/precheck?pixKey=${encodeURIComponent(
        key
    )}&value=${encodeURIComponent(value)}`;
const STATIC_QR_URL = (id: string) =>
    `/pix/transactions/account-holders/${id}/qr/static`;

/* -------------------------------------------
   COMPONENTE
------------------------------------------- */

export default function AdminPixTransactionsPage(): React.JSX.Element {
    const [history, setHistory] = React.useState<Transaction[]>([]);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(10);
    const [statusFilter, setStatusFilter] = React.useState("");
    const [loadingHistory, setLoadingHistory] = React.useState(false);

    const [sending, setSending] = React.useState(false);
    const [receiving, setReceiving] = React.useState(false);
    const [receiveResult, setReceiveResult] =
        React.useState<GenerateStaticQrResponse["data"] | null>(null);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [pendingPix, setPendingPix] = React.useState<{
        pixKey: string;
        amount: string;
        description?: string;
        precheck?: PrecheckResponse;
    } | null>(null);

    const sendForm = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: {
            pixKey: "",
            amount: "0.01",
            description: "",
            runPrecheck: true,
        },
    });

    const receiveForm = useForm<z.infer<typeof receiveSchema>>({
        resolver: zodResolver(receiveSchema),
        defaultValues: {
            pixKey: "",
            amount: "0.00",
            description: "",
            format: "both",
        },
    });

    /* -------------------------------------------
       CARREGAR HISTÓRICO
    ------------------------------------------- */

    async function loadHistory(): Promise<void> {
        try {
            setLoadingHistory(true);
            const qs = new URLSearchParams();
            qs.set("page", String(page));
            qs.set("pageSize", String(pageSize));
            if (statusFilter) qs.set("status", statusFilter);
            const res = await http.get<HistoryResponse>(HISTORY_URL(ACCOUNT_HOLDER_ID, qs));
            setHistory(res.data.items);
            setTotal(res.data.total);
        } catch (e) {
            toast.error("Falha ao carregar histórico");
        } finally {
            setLoadingHistory(false);
        }
    }

    React.useEffect(() => {
        void loadHistory();
    }, [page, statusFilter]);

    /* -------------------------------------------
       PRÉ-CONSULTA + CONFIRMAÇÃO
    ------------------------------------------- */

    async function handlePrecheckAndConfirm(): Promise<void> {
        const { pixKey, amount, description } = sendForm.getValues();
        try {
            setSending(true);
            const pre = await http.get<PrecheckResponse>(
                PRECHECK_URL(ACCOUNT_HOLDER_ID, pixKey.trim(), amount.trim())
            );
            if (!pre.data.endToEndPixKey) {
                toast.error("Não foi possível validar a chave Pix.");
                return;
            }
            setPendingPix({ pixKey, amount, description, precheck: pre.data });
            setConfirmDialogOpen(true);
        } catch {
            toast.error("Erro ao validar chave Pix");
        } finally {
            setSending(false);
        }
    }

    async function handleConfirmSend(): Promise<void> {
        if (!pendingPix) return;
        const { pixKey, amount, description } = pendingPix;

        try {
            setSending(true);
            const payload = { pixKey, amount, description };
            const res = await http.post<SendPixResponse>(SEND_URL(ACCOUNT_HOLDER_ID), payload);
            if (res.data.ok) {
                toast.success(res.data.message ?? "PIX enviado com sucesso!");
                await loadHistory();
                sendForm.reset();
                setConfirmDialogOpen(false);
                setPendingPix(null);
            } else {
                toast.error(res.data.message ?? "Falha ao enviar PIX");
            }
        } catch {
            toast.error("Erro ao enviar PIX");
        } finally {
            setSending(false);
        }
    }

    /* -------------------------------------------
       GERAR QR CODE ESTÁTICO
    ------------------------------------------- */

    async function handleGenerateQr(): Promise<void> {
        const { pixKey, amount, description, format } = receiveForm.getValues();
        try {
            setReceiving(true);
            setReceiveResult(null);

            const payload = {
                pixKey: pixKey.trim(),
                value: amount ? Number(amount) : undefined,
                message: description?.trim() || undefined,
                format,
            };

            const res = await http.post<GenerateStaticQrResponse>(
                STATIC_QR_URL(ACCOUNT_HOLDER_ID),
                payload
            );

            if (res.data.ok && res.data.data) {
                setReceiveResult(res.data.data);
                toast.success("QR Code gerado!");
            } else {
                toast.error(res.data.message ?? "Falha ao gerar QR Code");
            }
        } catch {
            toast.error("Erro ao gerar QR Code");
        } finally {
            setReceiving(false);
        }
    }

    /* -------------------------------------------
       RENDER
    ------------------------------------------- */

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <ArrowUpRight className="size-5" />
                        Transações Pix
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Envie, receba e acompanhe o histórico de transações Pix.
                    </p>
                </div>
                <Button variant="ghost" onClick={loadHistory} disabled={loadingHistory}>
                    <RefreshCw className="size-4 mr-2" />
                    {loadingHistory ? "Atualizando…" : "Atualizar"}
                </Button>
            </div>

            {/* ENVIAR PIX */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowUpRight className="size-5" /> Enviar Pix
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-2xl">
                    <Label>Chave Pix</Label>
                    <Input {...sendForm.register("pixKey")} placeholder="email, CPF..." />

                    <div className="grid md:grid-cols-2 gap-2">
                        <div>
                            <Label>Valor</Label>
                            <Input {...sendForm.register("amount")} placeholder="10.00" />
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Input {...sendForm.register("description")} placeholder="Ex: pagamento" />
                        </div>
                    </div>

                    <Button onClick={handlePrecheckAndConfirm} disabled={sending}>
                        <Send className="size-4 mr-2" />
                        {sending ? "Validando…" : "Enviar Pix"}
                    </Button>

                    {/* Dialog de confirmação */}
                    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar envio</DialogTitle>
                            </DialogHeader>
                            {pendingPix?.precheck && (
                                <div className="text-sm grid gap-1">
                                    <div>Favorecido: {pendingPix.precheck.name ?? "—"}</div>
                                    <div>Documento: {pendingPix.precheck.taxNumber ?? "—"}</div>
                                    <div>Banco: {pendingPix.precheck.bankData?.Name ?? "—"}</div>
                                    <div>
                                        Ag/Conta: {pendingPix.precheck.bankData?.Branch}/
                                        {pendingPix.precheck.bankData?.Account}
                                    </div>
                                    <div>Valor: R$ {Number(pendingPix.amount).toFixed(2)}</div>
                                </div>
                            )}
                            <DialogFooter className="mt-3">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleConfirmSend} disabled={sending}>
                                    {sending ? "Enviando…" : "Confirmar"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* RECEBER PIX */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownLeft className="size-5" /> Gerar QR Code
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-2xl">
                    <Label>Chave Pix do recebedor</Label>
                    <Input {...receiveForm.register("pixKey")} placeholder="Sua chave Pix" />

                    <div className="grid md:grid-cols-2 gap-2">
                        <div>
                            <Label>Valor (opcional)</Label>
                            <Input {...receiveForm.register("amount")} placeholder="0.00" />
                        </div>
                        <div>
                            <Label>Formato</Label>
                            <select
                                {...receiveForm.register("format")}
                                className="h-9 border rounded-md px-2"
                            >
                                <option value="both">Copy e imagem</option>
                                <option value="copy-paste">Somente Copy</option>
                                <option value="image">Somente Imagem</option>
                            </select>
                        </div>
                    </div>

                    <Button onClick={handleGenerateQr} disabled={receiving}>
                        <QrCode className="size-4 mr-2" />
                        {receiving ? "Gerando…" : "Gerar QR Code"}
                    </Button>

                    {receiveResult && (
                        <>
                            <Separator />
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>QR Code</Label>
                                    {receiveResult.imageBase64 ? (
                                        <img
                                            src={`data:image/png;base64,${receiveResult.imageBase64}`}
                                            alt="QR"
                                            className="border rounded-lg w-[220px] h-[220px]"
                                        />
                                    ) : (
                                        <div className="border rounded-lg w-[220px] h-[220px] grid place-items-center text-sm text-muted-foreground">
                                            Sem imagem
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label>Copy & Paste</Label>
                                    <Textarea
                                        readOnly
                                        value={receiveResult.copyPaste ?? ""}
                                        className="min-h-[220px] font-mono text-xs"
                                    />
                                    {receiveResult.copyPaste && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                navigator.clipboard.writeText(receiveResult.copyPaste!);
                                                toast.success("Copiado!");
                                            }}
                                        >
                                            Copiar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* HISTÓRICO */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                        <Label>Status:</Label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 border rounded-md px-2"
                        >
                            <option value="">Todos</option>
                            <option value="created">Criado</option>
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="failed">Falhou</option>
                            <option value="refunded">Estornado</option>
                        </select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Chave</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length ? (
                                history.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {tx.direction === "out" ? "Enviado" : "Recebido"}
                                        </TableCell>
                                        <TableCell>R$ {tx.amount.toFixed(2)}</TableCell>
                                        <TableCell>{tx.key ?? "—"}</TableCell>
                                        <TableCell>{tx.status}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                        Nenhuma transação encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between mt-3">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
