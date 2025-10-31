"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RefreshCw, KeyRound, Plus, Search } from "lucide-react";

import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";

/* ---------------------------------------------------------
   🧾 TYPES
--------------------------------------------------------- */

interface BankInfo {
    name?: string;
    ispb?: string;
    code?: string | null;
}

export interface PixKey {
    key: string;
    keyType: string;
    keyTypeId: number;
    createdAt?: string;
}

export interface ListKeysResponse {
    statusCode: number;
    extensions?: {
        data?: {
            bank?: BankInfo;
            keys?: PixKey[];
        };
        message?: string;
    };
}

export interface CreateKeyResponse {
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
    BankData: PrecheckBankData;
    EndToEnd: string;
}

export interface PrecheckResponse {
    StatusCode?: number;
    Title?: string;
    Extensions?: {
        Data?: PrecheckData;
        Message?: string;
    };
}

/* ---------------------------------------------------------
   🧮 HELPERS / VALIDATION
--------------------------------------------------------- */

function mapKeyTypeToApi(t: string): "1" | "2" | "3" | "4" | "5" {
    const lower = t.toLowerCase();
    switch (lower) {
        case "1":
        case "cpf":
            return "1";
        case "2":
        case "cnpj":
            return "2";
        case "3":
        case "phone":
            return "3";
        case "4":
        case "email":
            return "4";
        case "5":
        case "random":
            return "5";
        default:
            throw new Error("Tipo de chave inválido");
    }
}

/* ---------------------------------------------------------
   🧠 SCHEMAS
--------------------------------------------------------- */

const accountSchema = z.object({
    accountHolderId: z.string().min(1, "Informe o Account Holder ID"),
});

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
   🌐 API URLS
--------------------------------------------------------- */

const LIST_URL = (id: string): string =>
    `/pix/keys/account-holders/${encodeURIComponent(id)}`;

const CREATE_URL = (id: string): string =>
    `/pix/keys/account-holders/${encodeURIComponent(id)}`;

const PRECHECK_URL = (id: string, key: string, value: string): string =>
    `/pix/keys/account-holders/${encodeURIComponent(id)}/key/${encodeURIComponent(
        key,
    )}?value=${encodeURIComponent(value)}`;

/* ---------------------------------------------------------
   🧩 COMPONENT
--------------------------------------------------------- */

export default function AdminPixKeysPage(): React.JSX.Element {
    const [loadingList, setLoadingList] = React.useState(false);
    const [creating, setCreating] = React.useState(false);
    const [checking, setChecking] = React.useState(false);
    const [keys, setKeys] = React.useState<PixKey[]>([]);
    const [bankName, setBankName] = React.useState<string | undefined>(undefined);
    const [precheck, setPrecheck] = React.useState<PrecheckData | null>(null);

    const accountForm = useForm<z.infer<typeof accountSchema>>({
        resolver: zodResolver(accountSchema),
        defaultValues: { accountHolderId: "" },
    });

    const createForm = useForm<z.infer<typeof createSchema>>({
        resolver: zodResolver(createSchema),
        defaultValues: { type: "random", value: "" },
    });

    const precheckForm = useForm<z.infer<typeof precheckSchema>>({
        resolver: zodResolver(precheckSchema),
        defaultValues: { pixKey: "", amount: "0.01" },
    });

    /* ---------------------------------------------------------
       🔄 FUNÇÕES
    --------------------------------------------------------- */

    async function loadKeys(): Promise<void> {
        const { accountHolderId } = accountForm.getValues();
        if (!accountHolderId) {
            accountForm.setError("accountHolderId", {
                message: "Informe o Account Holder ID",
            });
            return;
        }

        try {
            setLoadingList(true);
            const res = await http.get<ListKeysResponse>(LIST_URL(accountHolderId));
            const list = res?.extensions?.data?.keys ?? [];
            setKeys(list);
            setBankName(res?.extensions?.data?.bank?.name);
            toast.success("Chaves carregadas com sucesso");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro ao carregar chaves";
            toast.error(msg);
        } finally {
            setLoadingList(false);
        }
    }

    async function createKey(): Promise<void> {
        const { accountHolderId } = accountForm.getValues();
        const { type, value } = createForm.getValues();

        if (!accountHolderId) {
            accountForm.setError("accountHolderId", {
                message: "Informe o Account Holder ID",
            });
            return;
        }

        try {
            setCreating(true);
            const KeyType = mapKeyTypeToApi(type);

            const body =
                KeyType === "5"
                    ? { KeyType }
                    : { KeyType, PixKey: value?.trim() ?? "" };

            if (KeyType !== "5" && !body.PixKey) {
                createForm.setError("value", { message: "Informe o valor da chave" });
                setCreating(false);
                return;
            }

            const res = await http.post<CreateKeyResponse>(CREATE_URL(accountHolderId), body);
            const message = res?.extensions?.message ?? "Chave criada";
            toast.success(message);
            await loadKeys();
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao criar chave";
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    }

    async function doPrecheck(): Promise<void> {
        const { accountHolderId } = accountForm.getValues();
        const { pixKey, amount } = precheckForm.getValues();

        if (!accountHolderId) {
            accountForm.setError("accountHolderId", {
                message: "Informe o Account Holder ID",
            });
            return;
        }

        try {
            setChecking(true);
            const res = await http.get<PrecheckResponse>(
                PRECHECK_URL(accountHolderId, pixKey.trim(), amount.trim()),
            );
            const data = res?.Extensions?.Data ?? null;
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
       💅 UI
    --------------------------------------------------------- */

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
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

            {/* Account Holder */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Conta BRX</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                    <Label htmlFor="ah">Account Holder ID</Label>
                    <div className="flex gap-2">
                        <Input
                            id="ah"
                            placeholder="d78ae5b9-..."
                            {...accountForm.register("accountHolderId")}
                        />
                        <Button onClick={loadKeys} disabled={loadingList}>
                            {loadingList ? "..." : "Carregar"}
                        </Button>
                    </div>
                    {accountForm.formState.errors.accountHolderId && (
                        <p className="text-sm text-destructive">
                            {accountForm.formState.errors.accountHolderId.message}
                        </p>
                    )}
                    {bankName && (
                        <p className="text-xs text-muted-foreground">Banco: {bankName}</p>
                    )}
                </CardContent>
            </Card>

            {/* Lista de chaves */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Chaves cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Chave</TableHead>
                                <TableHead>Criada em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.length ? (
                                keys.map((k) => (
                                    <TableRow key={k.key}>
                                        <TableCell className="capitalize">{k.keyType}</TableCell>
                                        <TableCell className="font-mono">{k.key}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {k.createdAt
                                                ? new Date(k.createdAt).toLocaleString()
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
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
                            ),
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
                        <Plus className="size-4 mr-2" />
                        {creating ? "Criando…" : "Criar chave"}
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
                        <Search className="size-4 mr-2" />
                        {checking ? "Consultando…" : "Consultar"}
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
