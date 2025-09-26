"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUiModals } from "@/stores/ui-modals";
import { apiFetch, apiPost, type PixCharge } from "@/lib/api";

const schema = z.object({
    amountBRL: z.coerce.number().min(1, "Mínimo R$ 1,00"),
    autoConvert: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

export default function PixModal() {
    const { open, closeModal } = useUiModals();
    const [creating, setCreating] = React.useState(false);
    const [charge, setCharge] = React.useState<PixCharge | null>(null);
    const [remaining, setRemaining] = React.useState<string>("");

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: { amountBRL: 100, autoConvert: false },
    });

    const isOpen = open.pix;

    // reset ao fechar
    const handleClose = () => {
        setCharge(null);
        setRemaining("");
        form.reset();
        closeModal("pix");
    };

    // cria cobrança via sua api demo
    async function onSubmit(values: FormValues) {
        try {
            setCreating(true);
            const created = await apiPost<PixCharge>("/pix/charges", {
                amountBrl: values.amountBRL,
                autoConvert: values.autoConvert,
            });
            setCharge(created);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erro ao gerar Pix");
        } finally {
            setCreating(false);
        }
    }

    // polling do status enquanto houver charge
    React.useEffect(() => {
        if (!charge?.id) return;
        let active = true;
        const tick = async () => {
            try {
                const r = await apiFetch(`/pix/charges/${charge.id}`);
                const data = (await r.json()) as PixCharge;
                if (active) setCharge(data);
            } catch { }
        };
        tick();
        const it = setInterval(tick, 1200);
        return () => {
            active = false;
            clearInterval(it);
        };
    }, [charge?.id]);

    // contador de validade
    React.useEffect(() => {
        if (!charge?.expiresAt) return;
        const id = setInterval(() => {
            const diff = +new Date(charge.expiresAt) - Date.now();
            if (diff <= 0) {
                setRemaining("expirado");
                clearInterval(id);
                return;
            }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(id);
    }, [charge?.expiresAt]);

    const copyCode = async () => {
        if (!charge?.copyPaste) return;
        await navigator.clipboard.writeText(charge.copyPaste);
    };

    const downloadQR = () => {
        if (!charge?.qrCode) return;
        const a = document.createElement("a");
        a.href = charge.qrCode;
        // fakeQR é SVG dataURL; se você trocar por PNG, ajuste a extensão.
        a.download = "pix-qrcode.svg";
        a.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => (!v ? handleClose() : null)}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adicionar via Pix</DialogTitle>
                </DialogHeader>

                {!charge && (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amountBRL">Valor (BRL)</Label>
                            <Input
                                id="amountBRL"
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                {...form.register("amountBRL")}
                            />
                            {form.formState.errors.amountBRL && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.amountBRL.message}
                                </p>
                            )}
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" {...form.register("autoConvert")} />
                            Converter automaticamente para USDT
                        </label>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? "Gerando..." : "Gerar Pix"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {charge && (
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="text-muted-foreground">
                                Status: <b>{charge.status}</b>
                                {charge.expiresAt ? ` · expira em ${remaining || "--"}` : null}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCharge(null)}>
                                    Gerar outro valor
                                </Button>
                                <Button size="sm" onClick={downloadQR}>
                                    Baixar QR
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <Tabs defaultValue="qr">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="qr">QR Code</TabsTrigger>
                                <TabsTrigger value="code">Copia e Cola</TabsTrigger>
                            </TabsList>

                            <TabsContent value="qr" className="pt-4">
                                <div className="flex items-center justify-center">
                                    <img
                                        src={charge.qrCode!}
                                        alt="QR Code Pix"
                                        className="rounded-xl border p-2"
                                        width={240}
                                        height={240}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="code" className="pt-4">
                                <div className="grid gap-2">
                                    <Label>Código Pix</Label>
                                    <textarea
                                        readOnly
                                        className="min-h-28 w-full rounded-md border bg-muted/30 p-3 font-mono text-xs"
                                        value={charge.copyPaste ?? ""}
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={copyCode}>Copiar código</Button>
                                        <Button onClick={downloadQR}>Baixar QR</Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Fechar
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
