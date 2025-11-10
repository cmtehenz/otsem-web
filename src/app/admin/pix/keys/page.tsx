"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RefreshCw, KeyRound, Plus, Search, Trash2, Loader2 } from "lucide-react";

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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ---------------------------------------------------------
   📘 TYPES
--------------------------------------------------------- */

interface BankInfo {
    name?: string;
    ispb?: string;
    code?: string | null;
}

interface PixKey {
    key: string;
    keyType: string;
    keyTypeId: number;
    createdAt?: string;
    account?: {
        branch?: string;
        number?: string;
        type?: string;
    };
}

interface ListKeysResponse {
    bank?: BankInfo;
    keys: PixKey[];
    message?: string;
}

interface CreateKeyResponse {
    statusCode: number;
    extensions?: {
        message?: string;
        data?: {
            key?: string;
            keyType?: string;
            keyTypeId?: number;
        };
    };
}

interface PrecheckBankData {
    Ispb: string;
    Name: string;
    BankCode: string;
    Branch: string;
    Account: string;
    AccountType: string;
    AccountTypeId: number;
}

interface PrecheckData {
    Name: string;
    TaxNumber: string;
    Key: string;
    KeyType: string;
    KeyTypeId: number;
    BankData: PrecheckBankData;
    EndToEnd: string;
}

interface PrecheckResponse {
    StatusCode?: number;
    Title?: string;
    Extensions?: {
        Data?: PrecheckData;
        Message?: string;
    };
}

/* ---------------------------------------------------------
   ✅ CONSTANTES FIXAS
--------------------------------------------------------- */

const ACCOUNT_HOLDER_ID = "d78ae5b9-252c-44e8-ba68-71474d8d382e";

const LIST_URL = `/pix/keys/account-holders/${ACCOUNT_HOLDER_ID}`;
const CREATE_URL = `/pix/keys/account-holders/${ACCOUNT_HOLDER_ID}`;
const DELETE_URL = (key: string) =>
    `/pix/keys/account-holders/${ACCOUNT_HOLDER_ID}/key/${encodeURIComponent(key)}`;
const PRECHECK_URL = (key: string, value: string): string =>
    `/pix/keys/account-holders/${ACCOUNT_HOLDER_ID}/key/${encodeURIComponent(
        key
    )}?value=${encodeURIComponent(value)}`;

/* ---------------------------------------------------------
   ⚙️ SCHEMAS
--------------------------------------------------------- */

const createSchema = z.object({
    type: z.enum(["cpf", "cnpj", "phone", "email", "random"]),
    value: z.string().optional(),
});

const precheckSchema = z.object({
    pixKey: z.string().min(1, "Informe a chave Pix"),
    amount: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Use ponto decimal, ex.: 10.00"),
});

/* ---------------------------------------------------------
   🧩 COMPONENTE PRINCIPAL
--------------------------------------------------------- */

export default function AdminPixKeysPage(): React.JSX.Element {
    const [loadingList, setLoadingList] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [checking, setChecking] = React.useState(false);
    const [keys, setKeys] = React.useState<PixKey[]>([]);
    const [bankName, setBankName] = React.useState<string>();
    const [precheck, setPrecheck] = React.useState<PrecheckData | null>(null);
    const [deletingKey, setDeletingKey] = React.useState<string | null>(null); // key em exclusão

    const createForm = useForm<z.infer<typeof createSchema>>({
        resolver: zodResolver(createSchema),
        defaultValues: { type: "random", value: "" },
    });

    const precheckForm = useForm<z.infer<typeof precheckSchema>>({
        resolver: zodResolver(precheckSchema),
        defaultValues: { pixKey: "", amount: "0.01" },
    });

    /* ---------------------------------------------------------
       🔁 Carregar chaves ao abrir a página
    --------------------------------------------------------- */
    React.useEffect(() => {
        void loadKeys();
    }, []);

    async function loadKeys(): Promise<void> {
        try {
            setLoadingList(true);
            const res = await http.get<ListKeysResponse>(LIST_URL);

            setKeys(res.data.keys ?? []);
            setBankName(res.data.bank?.name);
            toast.success(res.data.message || "Chaves carregadas com sucesso");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao carregar chaves";
            toast.error(msg);
        } finally {
            setLoadingList(false);
        }
    }

    /* ---------------------------------------------------------
       ➕ Criar nova chave
    --------------------------------------------------------- */
    async function createKey(): Promise<void> {
        const { type, value } = createForm.getValues();

        try {
            setCreating(true);

            const payload =
                type === "random"
                    ? { keyType: "random" }
                    : { keyType: type, pixKey: (value ?? "").trim() };

            if (payload.keyType !== "random" && !payload.pixKey) {
                createForm.setError("value", { message: "Informe o valor da chave" });
                setCreating(false);
                return;
            }

            const res = await http.post<CreateKeyResponse>(CREATE_URL, payload);
            const message = res?.data?.extensions?.message ?? "Chave criada com sucesso!";
            toast.success(message);
            await loadKeys();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao criar chave";
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    }

    /* ---------------------------------------------------------
       🗑️ Excluir chave (com confirmação)
    --------------------------------------------------------- */
    async function deleteKey(key: string): Promise<void> {
        try {
            setDeletingKey(key);
            await http.delete<{ ok: true; message?: string }>(DELETE_URL(key));
            toast.success("Chave removida com sucesso");
            await loadKeys();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao remover chave";
            toast.error(msg);
        } finally {
            setDeletingKey(null);
        }
    }

    /* ---------------------------------------------------------
       🔍 Pré-consulta de chave Pix
    --------------------------------------------------------- */
    async function doPrecheck(): Promise<void> {
        const { pixKey, amount } = precheckForm.getValues();

        try {
            setChecking(true);
            const res = await http.get<PrecheckResponse>(
                PRECHECK_URL(pixKey.trim(), amount.trim())
            );
            const data = res?.data?.Extensions?.Data ?? null;
            setPrecheck(data);
            if (data?.EndToEnd) toast.success("Pré-consulta concluída!");
            else toast.message("Consulta OK (sem EndToEnd)");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha na pré-consulta";
            toast.error(msg);
            setPrecheck(null);
        } finally {
            setChecking(false);
        }
    }

    /* ---------------------------------------------------------
       💅 INTERFACE
    --------------------------------------------------------- */

    return (
        <div className="flex flex-col gap-6">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <KeyRound className="size-5" />
                        Operações de Chaves Pix
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie chaves Pix vinculadas à conta BRX
                    </p>
                </div>
                <Button variant="ghost" onClick={loadKeys} disabled={loadingList}>
                    <RefreshCw className="size-4 mr-2" />
                    {loadingList ? "Carregando…" : "Recarregar"}
                </Button>
            </div>

            {/* Lista de chaves */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>
                        Chaves cadastradas {bankName && `– ${bankName}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Chave</TableHead>
                                <TableHead>Ag/Conta</TableHead>
                                <TableHead>Tipo Conta</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.length ? (
                                keys.map((k) => (
                                    <TableRow key={k.key}>
                                        <TableCell className="capitalize">{k.keyType}</TableCell>
                                        <TableCell className="font-mono">{k.key}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {k.account
                                                ? `${k.account.branch}/${k.account.number}`
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {k.account?.type ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="gap-2"
                                                        disabled={deletingKey === k.key}
                                                    >
                                                        {deletingKey === k.key ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-4" />
                                                        )}
                                                        Excluir
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir chave Pix?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Essa ação não pode ser desfeita. A chave{" "}
                                                            <span className="font-mono">{k.key}</span> será removida
                                                            permanentemente da sua conta BRX.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => void deleteKey(k.key)}
                                                        >
                                                            Confirmar exclusão
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-sm text-muted-foreground"
                                    >
                                        Nenhuma chave encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Criar nova chave */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Criar nova chave</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-xl">
                    <Label>Tipo de chave</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {(["cpf", "cnpj", "phone", "email", "random"] as const).map(
                            (type) => (
                                <Button
                                    key={type}
                                    variant={
                                        createForm.watch("type") === type ? "default" : "outline"
                                    }
                                    onClick={() => createForm.setValue("type", type)}
                                >
                                    {type.toUpperCase()}
                                </Button>
                            )
                        )}
                    </div>

                    {createForm.watch("type") !== "random" && (
                        <div className="grid gap-2">
                            <Label htmlFor="pixValue">Valor da chave</Label>
                            <Input
                                id="pixValue"
                                placeholder="CPF, CNPJ, e-mail, telefone..."
                                {...createForm.register("value")}
                            />
                            {createForm.formState.errors.value && (
                                <p className="text-sm text-destructive">
                                    {createForm.formState.errors.value.message}
                                </p>
                            )}
                        </div>
                    )}

                    <Button onClick={createKey} disabled={creating}>
                        {creating ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Criando…
                            </>
                        ) : (
                            <>
                                <Plus className="size-4 mr-2" />
                                Criar chave
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Pré-consulta */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Pré-consulta de chave</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 max-w-xl">
                    <div className="grid gap-2">
                        <Label htmlFor="preKey">Chave Pix</Label>
                        <Input id="preKey" {...precheckForm.register("pixKey")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="preVal">Valor (R$)</Label>
                        <Input id="preVal" {...precheckForm.register("amount")} />
                    </div>
                    <Button onClick={doPrecheck} disabled={checking}>
                        {checking ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Consultando…
                            </>
                        ) : (
                            <>
                                <Search className="size-4 mr-2" />
                                Consultar
                            </>
                        )}
                    </Button>

                    {precheck && (
                        <>
                            <Separator />
                            <div className="text-sm grid gap-1">
                                <div>
                                    <span className="text-muted-foreground">Nome:</span>{" "}
                                    {precheck.Name}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Documento:</span>{" "}
                                    {precheck.TaxNumber}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Banco:</span>{" "}
                                    {precheck.BankData?.Name}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Ag/Conta:</span>{" "}
                                    {precheck.BankData?.Branch}/{precheck.BankData?.Account}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">EndToEnd:</span>{" "}
                                    <code className="font-mono">{precheck.EndToEnd}</code>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
