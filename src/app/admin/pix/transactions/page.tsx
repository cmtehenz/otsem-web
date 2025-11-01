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
    Search,
    Send,
} from "lucide-react";
import { toast } from "sonner";

import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
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

export interface Transaction {
    id: string;
    endToEndId?: string;
    direction: TxDirection; // out = enviado, in = recebido
    amount: number; // em reais (decimal)
    key?: string;
    keyType?: string;
    description?: string | null;
    status: TxStatus;
    createdAt: string; // ISO
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

export interface PrecheckData {
    Name: string;
    TaxNumber: string;
    Key: string;
    KeyType: string;
    KeyTypeId: number;
    BankData?: PrecheckBankData | null;
    EndToEnd: string;
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

export interface ReceivePixResponse {
    ok: boolean;
    message?: string;
    qrCodeBase64?: string;   // imagem em base64 (PNG)
    copyPaste?: string;      // código copia-e-cola
    txId?: string;           // id/tx/charge
}

/* -------------------------------------------
   SCHEMAS
------------------------------------------- */

// 1) Schema — tire o .default(true)
const sendSchema = z.object({
    pixKey: z.string().min(3, "Informe a chave Pix"),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (use 10.00)"),
    description: z.string().optional(),
    runPrecheck: z.boolean(),           // <— sem default aqui
});

const receiveSchema = z.object({
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (use 10.00)"),
    description: z.string().optional(),
});

/* -------------------------------------------
   URL HELPERS
------------------------------------------- */

const HISTORY_URL = (id: string, params?: URLSearchParams): string => {
    const base = `/pix/transactions/account-holders/${encodeURIComponent(id)}`;
    return params ? `${base}?${params.toString()}` : base;
};

const SEND_URL = (id: string): string =>
    `/pix/transactions/account-holders/${encodeURIComponent(id)}/send`;

const RECEIVE_URL = (id: string): string =>
    `/pix/transactions/account-holders/${encodeURIComponent(id)}/receive`;

const PRECHECK_URL = (id: string, key: string, value: string): string =>
    `/pix/transactions/account-holders/${encodeURIComponent(id)}/precheck?pixKey=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;

/* -------------------------------------------
   COMPONENTE
------------------------------------------- */

export default function AdminPixTransactionsPage(): React.JSX.Element {
    const [loadingHistory, setLoadingHistory] = React.useState(false);
    const [history, setHistory] = React.useState<Transaction[]>([]);
    const [total, setTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [pageSize] = React.useState(10);
    const [statusFilter, setStatusFilter] = React.useState<string>("");

    const [precheck, setPrecheck] = React.useState<PrecheckData | null>(null);
    const [sending, setSending] = React.useState(false);
    const [receiving, setReceiving] = React.useState(false);
    const [receiveResult, setReceiveResult] = React.useState<ReceivePixResponse | null>(null);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [pendingPix, setPendingPix] = React.useState<{
        pixKey: string;
        amount: string;
        description?: string;
        precheck?: PrecheckResponse;
    } | null>(null);

    async function handlePrecheckAndConfirm(): Promise<void> {
        const { pixKey, amount, description } = sendForm.getValues();

        try {
            setSending(true);
            const pre = await http.get<PrecheckResponse>(
                PRECHECK_URL(ACCOUNT_HOLDER_ID, pixKey.trim(), amount.trim())
            );

            if (!pre.endToEndPixKey) {
                toast.error("Não foi possível validar a chave Pix.");
                return;
            }

            setPendingPix({ pixKey, amount, description, precheck: pre });
            setConfirmDialogOpen(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao validar chave Pix";
            toast.error(msg);
        } finally {
            setSending(false);
        }
    }

    async function handleConfirmSend(): Promise<void> {
        if (!pendingPix) return;
        const { pixKey, amount, description } = pendingPix;

        try {
            setSending(true);
            const payload = { pixKey: pixKey.trim(), amount: amount.trim(), description: (description ?? "").trim() };
            const res = await http.post<SendPixResponse>(SEND_URL(ACCOUNT_HOLDER_ID), payload);

            if (res.ok) {
                toast.success(res.message ?? "PIX enviado com sucesso!");
                await loadHistory();
                sendForm.reset({ pixKey: "", amount: "0.01", description: "", runPrecheck: true });
                setConfirmDialogOpen(false);
                setPendingPix(null);
                setPrecheck(null);
            } else {
                toast.error(res.message ?? "Falha ao enviar PIX");
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao enviar PIX";
            toast.error(msg);
        } finally {
            setSending(false);
        }
    }

    const sendForm = useForm<z.infer<typeof sendSchema>>({
        resolver: zodResolver(sendSchema),
        defaultValues: { pixKey: "", amount: "0.01", description: "", runPrecheck: true },
    });

    const receiveForm = useForm<z.infer<typeof receiveSchema>>({
        resolver: zodResolver(receiveSchema),
        defaultValues: { amount: "0.01", description: "" },
    });

    /* -------------------------------------------
       CARREGAR HISTÓRICO (auto ao montar)
    ------------------------------------------- */
    React.useEffect(() => {
        void loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter]);

    async function loadHistory(): Promise<void> {
        try {
            setLoadingHistory(true);
            const qs = new URLSearchParams();
            qs.set("page", String(page));
            qs.set("pageSize", String(pageSize));
            if (statusFilter) qs.set("status", statusFilter);

            const res = await http.get<HistoryResponse>(HISTORY_URL(ACCOUNT_HOLDER_ID, qs));
            setHistory(res.items);
            setTotal(res.total);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao carregar histórico";
            toast.error(msg);
        } finally {
            setLoadingHistory(false);
        }
    }

    /* -------------------------------------------
       PRÉ-CONSULTA (opcional) + ENVIAR PIX
    ------------------------------------------- */
    async function handleSend(): Promise<void> {
        const { pixKey, amount, description, runPrecheck } = sendForm.getValues();

        try {
            setSending(true);
            setPrecheck(null);

            let endToEnd: string | undefined;

            if (runPrecheck) {
                const pre = await http.get<PrecheckResponse>(
                    PRECHECK_URL(ACCOUNT_HOLDER_ID, pixKey.trim(), amount.trim())
                );
                if (!pre.endToEndPixKey) {
                    toast.error("Pré-consulta falhou.");
                    return;
                }
                // só pra exibir no card:
                setPrecheck({
                    Name: pre.name ?? "",
                    TaxNumber: pre.taxNumber ?? "",
                    Key: pixKey.trim(),
                    KeyType: "", KeyTypeId: 0,
                    BankData: pre.bankData,
                    EndToEnd: pre.endToEndPixKey,
                });
                endToEnd = pre.endToEndPixKey;
            }


            const payload = { pixKey: pixKey.trim(), amount: amount.trim(), description: (description ?? "").trim(), endToEnd };
            const res = await http.post<SendPixResponse>(SEND_URL(ACCOUNT_HOLDER_ID), payload);

            if (res.ok) {
                toast.success(res.message ?? "PIX enviado com sucesso!");
                await loadHistory();
                sendForm.reset({ pixKey, amount: "0.01", description: "", runPrecheck });
            } else {
                toast.error(res.message ?? "Falha ao enviar PIX");
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao enviar PIX";
            toast.error(msg);
        } finally {
            setSending(false);
        }
    }

    /* -------------------------------------------
       GERAR QR/COPIA-E-COLA (RECEBER)
    ------------------------------------------- */
    async function handleReceive(): Promise<void> {
        const { amount, description } = receiveForm.getValues();

        try {
            setReceiving(true);
            setReceiveResult(null);

            const payload = { amount: amount.trim(), description: (description ?? "").trim() };
            const res = await http.post<ReceivePixResponse>(RECEIVE_URL(ACCOUNT_HOLDER_ID), payload);

            if (res.ok) {
                setReceiveResult(res);
                toast.success(res.message ?? "QR Code gerado!");
                await loadHistory();
            } else {
                toast.error(res.message ?? "Falha ao gerar QR Code");
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao gerar QR Code";
            toast.error(msg);
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
                    <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
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
                        <ArrowUpRight className="size-5" />
                        Enviar Pix
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-2xl">
                    <div className="grid gap-2">
                        <Label htmlFor="sendKey">Chave Pix</Label>
                        <Input id="sendKey" placeholder="email/cpf/cnpj/telefone/aleatória" {...sendForm.register("pixKey")} />
                        {sendForm.formState.errors.pixKey && (
                            <p className="text-sm text-destructive">{sendForm.formState.errors.pixKey.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sendAmount">Valor (R$)</Label>
                            <Input id="sendAmount" placeholder="10.00" {...sendForm.register("amount")} />
                            {sendForm.formState.errors.amount && (
                                <p className="text-sm text-destructive">{sendForm.formState.errors.amount.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sendDesc">Descrição (opcional)</Label>
                            <Input id="sendDesc" placeholder="Ex.: pagamento de serviço" {...sendForm.register("description")} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="runPrecheck"
                            type="checkbox"
                            className="size-4 accent-foreground"
                            {...sendForm.register("runPrecheck")}
                        />
                        <Label htmlFor="runPrecheck" className="text-sm">Fazer pré-consulta antes de enviar</Label>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" title="Como funciona a pré-consulta?">
                                    <Search className="size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Pré-consulta</DialogTitle>
                                    <DialogDescription>
                                        Valida a chave e retorna dados do destinatário; também pode gerar o EndToEnd para a transferência.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Button onClick={handlePrecheckAndConfirm} disabled={sending}>
                        <Send className="size-4 mr-2" />
                        {sending ? "Validando…" : "Enviar Pix"}
                    </Button>

                    {/* Dialog de confirmação */}
                    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar envio do Pix</DialogTitle>
                                <DialogDescription>
                                    Confira os dados abaixo antes de confirmar a transação:
                                </DialogDescription>
                            </DialogHeader>

                            {pendingPix?.precheck && (
                                <div className="mt-2 text-sm grid gap-1 border rounded-md p-3 bg-muted/30">
                                    <div><span className="text-muted-foreground">Favorecido:</span> {pendingPix.precheck.name ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Documento:</span> {pendingPix.precheck.taxNumber ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Banco:</span> {pendingPix.precheck.bankData?.Name ?? "—"}</div>
                                    <div><span className="text-muted-foreground">Ag/Conta:</span> {pendingPix.precheck.bankData?.Branch}/{pendingPix.precheck.bankData?.Account}</div>
                                    <div><span className="text-muted-foreground">Valor:</span> R$ {Number(pendingPix.amount).toFixed(2)}</div>
                                </div>
                            )}

                            <DialogFooter className="mt-4 flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleConfirmSend} disabled={sending}>
                                    {sending ? "Enviando…" : "Confirmar envio"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


                    {precheck && (
                        <>
                            <Separator />
                            <div className="text-sm grid gap-1">
                                <div><span className="text-muted-foreground">Favorecido:</span> {precheck.Name}</div>
                                <div><span className="text-muted-foreground">Documento:</span> {precheck.TaxNumber}</div>
                                <div><span className="text-muted-foreground">Banco:</span> {precheck.BankData?.Name}</div>
                                <div><span className="text-muted-foreground">Ag/Conta:</span> {precheck.BankData?.Branch}/{precheck.BankData?.Account}</div>
                                <div><span className="text-muted-foreground">EndToEnd:</span> <code className="font-mono">{precheck.EndToEnd}</code></div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* RECEBER PIX */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownLeft className="size-5" />
                        Receber Pix (QR / Copia-e-Cola)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-2xl">
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="recvAmount">Valor (R$)</Label>
                            <Input id="recvAmount" placeholder="10.00" {...receiveForm.register("amount")} />
                            {receiveForm.formState.errors.amount && (
                                <p className="text-sm text-destructive">{receiveForm.formState.errors.amount.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="recvDesc">Descrição (opcional)</Label>
                            <Input id="recvDesc" placeholder="Ex.: recebimento de cliente" {...receiveForm.register("description")} />
                        </div>
                    </div>

                    <Button onClick={handleReceive} disabled={receiving}>
                        <QrCode className="size-4 mr-2" />
                        {receiving ? "Gerando…" : "Gerar QR / Copia-e-Cola"}
                    </Button>

                    {receiveResult?.ok && (
                        <>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>QR Code</Label>
                                    {receiveResult.qrCodeBase64 ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={`data:image/png;base64,${receiveResult.qrCodeBase64}`}
                                            alt="QR Code Pix"
                                            className="w-[220px] h-[220px] rounded-lg border"
                                        />
                                    ) : (
                                        <div className="w-[220px] h-[220px] rounded-lg border grid place-items-center text-sm text-muted-foreground">
                                            Sem imagem
                                        </div>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Copia-e-Cola</Label>
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
                                                toast.success("Copia-e-cola copiado!");
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
                <CardContent className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Status:</Label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 rounded-md border bg-background px-2 text-sm"
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
                                <TableHead>Quando</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Chave</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Detalhes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length ? history.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-sm">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {tx.direction === "out" ? "Enviado" : "Recebido"}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        R$ {tx.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {tx.key ?? "—"}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {tx.status}
                                    </TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">Ver</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Detalhes da transação</DialogTitle>
                                                    <DialogDescription>{tx.description || "—"}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-2 text-sm">
                                                    <div><span className="text-muted-foreground">ID:</span> <code className="font-mono">{tx.id}</code></div>
                                                    {tx.endToEndId && (
                                                        <div><span className="text-muted-foreground">EndToEnd:</span> <code className="font-mono">{tx.endToEndId}</code></div>
                                                    )}
                                                    <div><span className="text-muted-foreground">Direção:</span> {tx.direction}</div>
                                                    <div><span className="text-muted-foreground">Valor:</span> R$ {tx.amount.toFixed(2)}</div>
                                                    <div><span className="text-muted-foreground">Chave:</span> {tx.key ?? "—"} ({tx.keyType ?? "—"})</div>
                                                    <div><span className="text-muted-foreground">Status:</span> {tx.status}</div>
                                                    <div><span className="text-muted-foreground">Criada em:</span> {new Date(tx.createdAt).toLocaleString()}</div>
                                                    <div><span className="text-muted-foreground">Liquidada em:</span> {tx.settledAt ? new Date(tx.settledAt).toLocaleString() : "—"}</div>
                                                    <Separator />
                                                    <div><span className="text-muted-foreground">Favorecido/Contra-parte:</span> {tx.counterpartyName ?? "—"}</div>
                                                    <div><span className="text-muted-foreground">Documento:</span> {tx.counterpartyTaxNumber ?? "—"}</div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="secondary">Fechar</Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                                        Nenhuma transação encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Paginação simples */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {totalPages} • {total} registros
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
