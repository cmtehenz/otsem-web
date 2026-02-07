"use client";

import * as React from "react";
import {
    BottomSheet,
    BottomSheetContent,
    BottomSheetHeader,
    BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import {
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Copy,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import type { TransactionDetails } from "@/types/transaction";
import { ReceiptSheet } from "./receipt-sheet";

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

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; Icon: typeof CheckCircle2 }
> = {
    COMPLETED: { label: "Concluído", color: "text-emerald-400", Icon: CheckCircle2 },
    PENDING: { label: "Pendente", color: "text-amber-400", Icon: Clock },
    PROCESSING: { label: "Processando", color: "text-amber-400", Icon: Clock },
    FAILED: { label: "Falhou", color: "text-red-400", Icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
    PIX_IN: "Depósito PIX",
    PIX_OUT: "Transferência PIX",
    CONVERSION: "Conversão",
    TRANSFER: "Transferência",
};

type Props = {
    transactionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TransactionDetailSheet({ transactionId, open, onOpenChange }: Props) {
    const [details, setDetails] = React.useState<TransactionDetails | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [receiptOpen, setReceiptOpen] = React.useState(false);
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open || !transactionId) {
            setDetails(null);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        http.get<TransactionDetails>(`/transactions/${transactionId}/details`)
            .then((res) => {
                if (!cancelled) setDetails(res.data);
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error("Error fetching transaction details:", err);
                    setError("Não foi possível carregar os detalhes.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, transactionId]);

    function copyToClipboard(text: string, fieldName: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldName);
            toast.success("Copiado!");
            setTimeout(() => setCopiedField(null), 2000);
        });
    }

    function getTypeIcon() {
        if (!details) return null;
        const size = "w-5 h-5";
        if (details.type === "CONVERSION") return <ArrowRightLeft className={`${size} text-white`} />;
        if (details.type === "PIX_IN") return <ArrowDownLeft className={`${size} text-white`} />;
        return <ArrowUpRight className={`${size} text-white`} />;
    }

    const statusCfg = details ? STATUS_CONFIG[details.status] || STATUS_CONFIG.PENDING : STATUS_CONFIG.PENDING;

    return (
        <>
            <BottomSheet open={open} onOpenChange={onOpenChange}>
                <BottomSheetContent className="dark:bg-[#1a1025]/98">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-[#3871F1]" />
                            <p className="text-[13px] text-muted-foreground mt-4">
                                Carregando detalhes...
                            </p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <XCircle className="h-8 w-8 text-red-400" />
                            <p className="text-[13px] text-muted-foreground mt-4">{error}</p>
                        </div>
                    )}

                    {details && !loading && (
                        <>
                            <BottomSheetHeader>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#3871F1]/20 flex items-center justify-center">
                                        {getTypeIcon()}
                                    </div>
                                    <div>
                                        <BottomSheetTitle>
                                            {TYPE_LABELS[details.type] || details.type}
                                        </BottomSheetTitle>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <statusCfg.Icon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
                                            <span className={`text-[12px] font-medium ${statusCfg.color}`}>
                                                {statusCfg.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </BottomSheetHeader>

                            {/* Amount */}
                            <div className="text-center py-4 border-y border-border/50">
                                <p className="text-[32px] font-bold text-foreground leading-none">
                                    {details.type === "PIX_IN" ? "+" : "-"}
                                    {formatCurrency(Math.abs(details.amount))}
                                </p>
                                <p className="text-[13px] text-muted-foreground mt-1">
                                    {formatDateTime(details.createdAt)}
                                </p>
                            </div>

                            {/* Details rows */}
                            <div className="space-y-0 mt-4">
                                {/* Payer */}
                                {details.payer && (
                                    <DetailSection title="Pagador">
                                        <DetailRow label="Nome" value={details.payer.name} />
                                        <DetailRow label="CPF/CNPJ" value={details.payer.maskedTaxNumber} />
                                        {details.payer.pixKey && (
                                            <DetailRow label="Chave PIX" value={details.payer.pixKey} />
                                        )}
                                        {details.payer.bankCode && (
                                            <DetailRow label="Banco" value={details.payer.bankCode} />
                                        )}
                                    </DetailSection>
                                )}

                                {/* Receiver */}
                                {details.receiver && (
                                    <DetailSection title="Recebedor">
                                        <DetailRow label="Nome" value={details.receiver.name} />
                                        <DetailRow label="CPF/CNPJ" value={details.receiver.maskedTaxNumber} />
                                        {details.receiver.pixKey && (
                                            <DetailRow label="Chave PIX" value={details.receiver.pixKey} />
                                        )}
                                        {details.receiver.bankCode && (
                                            <DetailRow label="Banco" value={details.receiver.bankCode} />
                                        )}
                                    </DetailSection>
                                )}

                                {/* IDs */}
                                <DetailSection title="Identificação">
                                    <DetailRowCopyable
                                        label="ID da transação"
                                        value={details.transactionId}
                                        onCopy={() => copyToClipboard(details.transactionId, "txId")}
                                        copied={copiedField === "txId"}
                                    />
                                    {details.endToEnd && (
                                        <DetailRowCopyable
                                            label="End-to-End"
                                            value={details.endToEnd}
                                            onCopy={() => copyToClipboard(details.endToEnd!, "e2e")}
                                            copied={copiedField === "e2e"}
                                        />
                                    )}
                                    {details.txid && (
                                        <DetailRowCopyable
                                            label="TxID"
                                            value={details.txid}
                                            onCopy={() => copyToClipboard(details.txid!, "txid")}
                                            copied={copiedField === "txid"}
                                        />
                                    )}
                                    {details.bankProvider && (
                                        <DetailRow label="Provedor" value={details.bankProvider} />
                                    )}
                                </DetailSection>

                                {/* Completion date */}
                                {details.completedAt && (
                                    <DetailSection title="Conclusão">
                                        <DetailRow
                                            label="Data de conclusão"
                                            value={formatDateTime(details.completedAt)}
                                        />
                                    </DetailSection>
                                )}
                            </div>

                            {/* Receipt button */}
                            {details.hasReceipt && (
                                <button
                                    onClick={() => setReceiptOpen(true)}
                                    className="w-full mt-6 mb-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3871F1] text-white font-semibold text-[15px] active:bg-[#234FB3] transition-colors"
                                >
                                    <FileText className="w-4.5 h-4.5" />
                                    Ver comprovante
                                </button>
                            )}
                        </>
                    )}
                </BottomSheetContent>
            </BottomSheet>

            {/* Receipt sub-sheet */}
            {details?.hasReceipt && transactionId && (
                <ReceiptSheet
                    transactionId={transactionId}
                    open={receiptOpen}
                    onOpenChange={setReceiptOpen}
                />
            )}
        </>
    );
}

// ─── Sub-components ──────────────────────────────────────

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-border/30 last:border-b-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {title}
            </p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">{label}</span>
            <span className="text-[13px] font-medium text-foreground text-right max-w-[60%] truncate">
                {value}
            </span>
        </div>
    );
}

function DetailRowCopyable({
    label,
    value,
    onCopy,
    copied,
}: {
    label: string;
    value: string;
    onCopy: () => void;
    copied: boolean;
}) {
    const truncated = value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-8)}` : value;

    return (
        <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">{label}</span>
            <button
                onClick={onCopy}
                className="flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:text-[#3871F1] transition-colors"
            >
                <span className="truncate max-w-[140px]">{truncated}</span>
                {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
            </button>
        </div>
    );
}
