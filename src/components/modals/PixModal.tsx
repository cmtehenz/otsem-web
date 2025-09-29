"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useUiModals } from "@/stores/ui-modals";
import { JSX } from "react";

const schema = z.object({
    amountBRL: z.number().min(1, "Mínimo R$ 1,00"),
});

type FormValues = z.infer<typeof schema>;

export default function PixModal(): JSX.Element {
    const { open, closeModal } = useUiModals();
    const [qrCode, setQrCode] = React.useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { amountBRL: 100 },
    });

    async function onSubmit(values: FormValues): Promise<void> {
        try {
            // 🔹 Chame sua API de Pix que retorna o QR Code (ex.: string base64 ou data URL)
            // const res = await fetch("/api/pix/deposit", { method: "POST", body: JSON.stringify(values) });
            // const data = await res.json();
            // setQrCode(data.qrCode);

            // ⚡ Exemplo mockado: QR como SVG inline
            const fakeQr = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>
        <rect width='256' height='256' fill='white'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20'>PIX ${values.amountBRL}</text>
      </svg>`;
            setQrCode(fakeQr);
        } catch (err) {
            console.error("Erro ao gerar PIX:", err);
        }
    }

    return (
        <Dialog open={open.pix} onOpenChange={(v) => (!v ? closeModal("pix") : null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar via Pix</DialogTitle>
                </DialogHeader>

                {!qrCode ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amountBRL">Valor (BRL)</Label>
                            <Input
                                id="amountBRL"
                                type="number"
                                step="0.01"
                                {...form.register("amountBRL", { valueAsNumber: true })}
                            />
                            {form.formState.errors.amountBRL && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.amountBRL.message}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={() => closeModal("pix")}>
                                Cancelar
                            </Button>
                            <Button type="submit">Gerar Pix</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-center text-sm">Escaneie o QR Code abaixo para concluir o pagamento:</p>
                        <Image
                            src={qrCode}
                            alt="QR Code do Pix"
                            width={256}
                            height={256}
                            unoptimized
                            className="mx-auto h-48 w-48 rounded-lg"
                        />
                        <Button variant="outline" onClick={() => setQrCode(null)}>
                            Gerar outro
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
