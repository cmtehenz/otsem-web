"use client";

import * as React from "react";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetHeader,
    BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import { Loader2, XCircle, Download, Share2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import type { TransactionReceipt } from "@/types/transaction";

function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function truncateId(id: string): string {
    if (id.length <= 20) return id;
    return `${id.slice(0, 10)}...${id.slice(-8)}`;
}

type Props = {
    transactionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

async function captureReceiptImage(element: HTMLElement): Promise<Blob> {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
    });
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to create image"));
            },
            "image/png",
            1.0
        );
    });
}

export function ReceiptSheet({ transactionId, open, onOpenChange }: Props) {
    const [receipt, setReceipt] = React.useState<TransactionReceipt | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [exporting, setExporting] = React.useState(false);
    const receiptCardRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open || !transactionId) {
            setReceipt(null);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        http.get<TransactionReceipt>(`/transactions/${transactionId}/receipt`)
            .then((res) => {
                if (!cancelled) setReceipt(res.data);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Error fetching receipt:", err);
                    setError("Não foi possível carregar o comprovante.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, transactionId]);

    async function handleDownload() {
        if (!receipt || !receiptCardRef.current) return;
        setExporting(true);
        try {
            const blob = await captureReceiptImage(receiptCardRef.current);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `comprovante-${receipt.transactionId.slice(0, 8)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Comprovante salvo!");
        } catch {
            toast.error("Erro ao salvar comprovante.");
        } finally {
            setExporting(false);
        }
    }

    async function handleShare() {
        if (!receipt || !receiptCardRef.current) return;
        setExporting(true);
        try {
            const blob = await captureReceiptImage(receiptCardRef.current);
            const file = new File([blob], `comprovante-${receipt.transactionId.slice(0, 8)}.png`, {
                type: "image/png",
            });

            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: receipt.title,
                    files: [file],
                });
            } else if (navigator.share) {
                // Fallback: share without file
                const url = URL.createObjectURL(blob);
                await navigator.share({
                    title: receipt.title,
                    text: `${receipt.title}\nValor: ${formatCurrency(receipt.amount)}\nData: ${formatDateTime(receipt.date)}`,
                    url,
                });
                URL.revokeObjectURL(url);
            } else {
                // Desktop fallback: download
                await handleDownload();
            }
        } catch (err) {
            // User cancelled share — not an error
            if (err instanceof Error && err.name !== "AbortError") {
                toast.error("Erro ao compartilhar.");
            }
        } finally {
            setExporting(false);
        }
    }

    return (
        <BottomSheet open={open} onOpenChange={onOpenChange}>
            <BottomSheetContent className="dark:bg-[#1a1025]/98">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#3871F1]" />
                        <p className="text-[13px] text-muted-foreground mt-4">
                            Carregando comprovante...
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <XCircle className="h-8 w-8 text-red-400" />
                        <p className="text-[13px] text-muted-foreground mt-4">{error}</p>
                    </div>
                )}

                {receipt && !loading && (
                    <>
                        <BottomSheetHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <BottomSheetTitle>Comprovante</BottomSheetTitle>
                            </div>
                        </BottomSheetHeader>

                        {/* ── Professional Receipt Card (captured as image) ── */}
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            <div
                                ref={receiptCardRef}
                                style={{
                                    background: "#ffffff",
                                    padding: "32px 24px 28px",
                                    fontFamily:
                                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                {/* Logo + Brand */}
                                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/images/logo-128.png"
                                        alt="Otsem Pay"
                                        style={{
                                            height: "36px",
                                            objectFit: "contain",
                                            margin: "0 auto 8px",
                                            display: "block",
                                        }}
                                    />
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: "#9ca3af",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            fontWeight: 500,
                                            margin: 0,
                                        }}
                                    >
                                        Comprovante de Transação
                                    </p>
                                </div>

                                {/* Status badge */}
                                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "4px 14px",
                                            borderRadius: "999px",
                                            background: "#ecfdf5",
                                            color: "#059669",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: "6px",
                                                height: "6px",
                                                borderRadius: "50%",
                                                background: "#10b981",
                                                display: "inline-block",
                                            }}
                                        />
                                        Transação concluída
                                    </span>
                                </div>

                                {/* Title */}
                                <p
                                    style={{
                                        textAlign: "center",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#374151",
                                        margin: "0 0 4px",
                                    }}
                                >
                                    {receipt.title}
                                </p>

                                {/* Amount */}
                                <p
                                    style={{
                                        textAlign: "center",
                                        fontSize: "32px",
                                        fontWeight: 700,
                                        color: "#111827",
                                        margin: "0 0 4px",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {formatCurrency(receipt.amount)}
                                </p>

                                {/* Date */}
                                <p
                                    style={{
                                        textAlign: "center",
                                        fontSize: "12px",
                                        color: "#9ca3af",
                                        margin: "0 0 24px",
                                    }}
                                >
                                    {formatDateTime(receipt.date)}
                                </p>

                                {/* Divider */}
                                <div
                                    style={{
                                        height: "1px",
                                        background:
                                            "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                                        margin: "0 0 20px",
                                    }}
                                />

                                {/* Payer */}
                                <ReceiptCardSection title="Pagador">
                                    <ReceiptCardRow label="Nome" value={receipt.payer.name} />
                                    <ReceiptCardRow
                                        label="CPF/CNPJ"
                                        value={receipt.payer.maskedTaxNumber}
                                    />
                                    {receipt.payer.pixKey && (
                                        <ReceiptCardRow
                                            label="Chave PIX"
                                            value={receipt.payer.pixKey}
                                        />
                                    )}
                                    {receipt.payer.bankCode && (
                                        <ReceiptCardRow
                                            label="Banco"
                                            value={receipt.payer.bankCode}
                                        />
                                    )}
                                </ReceiptCardSection>

                                {/* Receiver */}
                                <ReceiptCardSection title="Recebedor">
                                    <ReceiptCardRow label="Nome" value={receipt.receiver.name} />
                                    <ReceiptCardRow
                                        label="CPF/CNPJ"
                                        value={receipt.receiver.maskedTaxNumber}
                                    />
                                    {receipt.receiver.pixKey && (
                                        <ReceiptCardRow
                                            label="Chave PIX"
                                            value={receipt.receiver.pixKey}
                                        />
                                    )}
                                    {receipt.receiver.bankCode && (
                                        <ReceiptCardRow
                                            label="Banco"
                                            value={receipt.receiver.bankCode}
                                        />
                                    )}
                                </ReceiptCardSection>

                                {/* IDs */}
                                <ReceiptCardSection title="Identificação">
                                    <ReceiptCardRow
                                        label="ID"
                                        value={truncateId(receipt.transactionId)}
                                    />
                                    {receipt.endToEndId && (
                                        <ReceiptCardRow
                                            label="End-to-End"
                                            value={truncateId(receipt.endToEndId)}
                                        />
                                    )}
                                    {receipt.txid && (
                                        <ReceiptCardRow
                                            label="TxID"
                                            value={truncateId(receipt.txid)}
                                        />
                                    )}
                                    {receipt.bankProvider && (
                                        <ReceiptCardRow
                                            label="Provedor"
                                            value={receipt.bankProvider}
                                        />
                                    )}
                                </ReceiptCardSection>

                                {/* Completion date */}
                                {receipt.completionDate &&
                                    receipt.completionDate !== receipt.date && (
                                        <ReceiptCardSection title="Conclusão">
                                            <ReceiptCardRow
                                                label="Data"
                                                value={formatDateTime(receipt.completionDate)}
                                            />
                                        </ReceiptCardSection>
                                    )}

                                {/* Payer message */}
                                {receipt.payerMessage && (
                                    <ReceiptCardSection title="Mensagem">
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#374151",
                                                margin: 0,
                                            }}
                                        >
                                            {receipt.payerMessage}
                                        </p>
                                    </ReceiptCardSection>
                                )}

                                {/* Footer */}
                                <div
                                    style={{
                                        marginTop: "24px",
                                        paddingTop: "16px",
                                        borderTop: "1px solid #f3f4f6",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            color: "#d1d5db",
                                            margin: "0 0 2px",
                                            letterSpacing: "0.05em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Processado por
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "#3871F1",
                                            margin: 0,
                                        }}
                                    >
                                        Otsem Pay
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-5 mb-2">
                            <button
                                onClick={handleShare}
                                disabled={exporting}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border/50 bg-card/30 text-foreground font-semibold text-[14px] active:bg-card/60 transition-colors disabled:opacity-50"
                            >
                                {exporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Share2 className="w-4 h-4" />
                                )}
                                Compartilhar
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={exporting}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3871F1] text-white font-semibold text-[14px] active:bg-[#234FB3] transition-colors disabled:opacity-50"
                            >
                                {exporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Salvar
                            </button>
                        </div>
                    </>
                )}
            </BottomSheetContent>
        </BottomSheet>
    );
}

// ─── Receipt card sub-components (inline styles for html2canvas) ──────

function ReceiptCardSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <p
                style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "0 0 8px",
                }}
            >
                {title}
            </p>
            <div
                style={{
                    background: "#f9fafb",
                    borderRadius: "12px",
                    padding: "12px 14px",
                }}
            >
                {children}
            </div>
        </div>
    );
}

function ReceiptCardRow({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 0",
            }}
        >
            <span
                style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: 400,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: "12px",
                    color: "#111827",
                    fontWeight: 600,
                    textAlign: "right",
                    maxWidth: "60%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {value}
            </span>
        </div>
    );
}
