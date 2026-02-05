"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
    Receipt,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    RefreshCw,
    Copy,
    AlertTriangle,
} from "lucide-react";
import http from "@/lib/http";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useUiModals } from "@/stores/ui-modals";

type BoletoPayment = {
    id: string;
    barcode: string;
    boletoAmount: number;
    serviceFee: number;
    totalBrl: number;
    cryptoCurrency: string;
    cryptoAmount: number;
    exchangeRate: number;
    status: string;
    description?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
};

type BoletoStatus =
    | "PENDING_APPROVAL"
    | "ADMIN_PAYING"
    | "PAID"
    | "REJECTED"
    | "CANCELLED"
    | "REFUNDED";

function getStatusConfig(status: string): { label: string; color: string; icon: React.ReactNode } {
    switch (status) {
        case "PENDING_APPROVAL":
            return {
                label: "Aguardando Aprovação",
                color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                icon: <Clock className="w-4 h-4" />,
            };
        case "ADMIN_PAYING":
            return {
                label: "Em Processamento",
                color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                icon: <Loader2 className="w-4 h-4 animate-spin" />,
            };
        case "PAID":
            return {
                label: "Pago",
                color: "bg-green-500/20 text-green-400 border-green-500/30",
                icon: <CheckCircle2 className="w-4 h-4" />,
            };
        case "REJECTED":
            return {
                label: "Rejeitado",
                color: "bg-red-500/20 text-red-400 border-red-500/30",
                icon: <XCircle className="w-4 h-4" />,
            };
        case "CANCELLED":
            return {
                label: "Cancelado",
                color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                icon: <XCircle className="w-4 h-4" />,
            };
        case "REFUNDED":
            return {
                label: "Reembolsado",
                color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                icon: <RefreshCw className="w-4 h-4" />,
            };
        default:
            return {
                label: status,
                color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                icon: <Clock className="w-4 h-4" />,
            };
    }
}

function formatBRL(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}

function formatCrypto(value: number, currency: string): string {
    const decimals = currency === "USDT" ? 2 : 4;
    return `${value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function CustomerBoletoPage() {
    const { openModal } = useUiModals();
    const [loading, setLoading] = React.useState(true);
    const [payments, setPayments] = React.useState<BoletoPayment[]>([]);
    const [filter, setFilter] = React.useState<string>("all");
    const [selectedPayment, setSelectedPayment] = React.useState<BoletoPayment | null>(null);
    const [cancelling, setCancelling] = React.useState(false);

    async function loadPayments() {
        setLoading(true);
        try {
            const params = filter !== "all" ? { status: filter } : {};
            const res = await http.get<BoletoPayment[] | { data: BoletoPayment[] }>("/boleto-payments", { params });
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setPayments(data);
        } catch (err) {
            console.error("Erro ao carregar pagamentos:", err);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id: string) {
        setCancelling(true);
        try {
            await http.post(`/boleto-payments/${id}/cancel`);
            toast.success("Pagamento cancelado. Crypto será devolvido.");
            setSelectedPayment(null);
            loadPayments();
        } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao cancelar pagamento");
        } finally {
            setCancelling(false);
        }
    }

    React.useEffect(() => {
        loadPayments();
    }, [filter]);

    const filters: { key: string; label: string }[] = [
        { key: "all", label: "Todos" },
        { key: "PENDING_APPROVAL", label: "Pendentes" },
        { key: "PAID", label: "Pagos" },
    ];

    return (
        <div className="pb-32 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-white tracking-tight">
                        Meus Boletos
                    </h1>
                    <p className="text-white/70 text-sm mt-0.5">
                        Pagamentos de boleto com crypto
                    </p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openModal("payBoleto")}
                    className="px-4 py-2 rounded-full bg-[#6F00FF] text-white text-sm font-semibold"
                >
                    + Novo
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                            filter === f.key
                                ? "bg-[#6F00FF]/20 text-[#6F00FF] border border-[#6F00FF]/50"
                                : "bg-white/5 text-white/70 border border-white/10 hover:border-white/20"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                </div>
            ) : payments.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                    <Receipt className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/50 text-sm">Nenhum pagamento encontrado</p>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openModal("payBoleto")}
                        className="mt-4 px-6 py-3 rounded-full bg-[#6F00FF] text-white text-sm font-semibold"
                    >
                        Pagar Boleto
                    </motion.button>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment, index) => {
                        const statusConfig = getStatusConfig(payment.status);
                        return (
                            <motion.button
                                key={payment.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, type: "spring", stiffness: 500, damping: 25 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPayment(payment)}
                                className="w-full ios-glass rounded-2xl p-4 text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                                            <Receipt className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-[15px] truncate">
                                                {payment.description || "Pagamento de Boleto"}
                                            </p>
                                            <p className="text-white/50 text-xs mt-0.5">
                                                {formatDate(payment.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-3 flex-shrink-0">
                                        <p className="text-white font-bold text-[15px]">
                                            {formatBRL(payment.boletoAmount)}
                                        </p>
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/30 ml-2 flex-shrink-0" />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Detail overlay */}
            {selectedPayment && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[60] bg-black/60"
                        style={{ WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPayment(null)}
                    />
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[61]"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
                    >
                        <div className="relative rounded-t-[24px] overflow-hidden pwa-sheet-safe-bottom bg-background/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.5)]">
                            <div className="relative px-5 pt-3 pb-4">
                                <div className="flex justify-center mb-3">
                                    <div className="w-9 h-1 rounded-full bg-foreground/20" />
                                </div>

                                <h3 className="text-[17px] font-bold text-foreground mb-4">
                                    Detalhes do Pagamento
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusConfig(selectedPayment.status).color}`}>
                                            {getStatusConfig(selectedPayment.status).icon}
                                            {getStatusConfig(selectedPayment.status).label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Valor do boleto</span>
                                        <span className="text-foreground font-medium">
                                            {formatBRL(selectedPayment.boletoAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Taxa de serviço</span>
                                        <span className="text-foreground">
                                            {formatBRL(selectedPayment.serviceFee)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total em BRL</span>
                                        <span className="text-foreground font-medium">
                                            {formatBRL(selectedPayment.totalBrl)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Crypto debitado</span>
                                        <span className="text-white font-medium">
                                            {formatCrypto(selectedPayment.cryptoAmount, selectedPayment.cryptoCurrency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Cotação</span>
                                        <span className="text-foreground">
                                            1 {selectedPayment.cryptoCurrency} = {formatBRL(selectedPayment.exchangeRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Código de barras</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedPayment.barcode);
                                                toast.success("Código copiado!");
                                            }}
                                            className="text-[#6F00FF] text-xs font-mono flex items-center gap-1 hover:underline"
                                        >
                                            {selectedPayment.barcode.slice(0, 12)}...
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Data</span>
                                        <span className="text-foreground">
                                            {formatDate(selectedPayment.createdAt)}
                                        </span>
                                    </div>

                                    {selectedPayment.rejectionReason && (
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-red-400 text-sm">
                                                {selectedPayment.rejectionReason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-5">
                                    {selectedPayment.status === "PENDING_APPROVAL" && (
                                        <button
                                            onClick={() => handleCancel(selectedPayment.id)}
                                            disabled={cancelling}
                                            className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition disabled:opacity-50"
                                        >
                                            {cancelling ? (
                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                            ) : (
                                                "Cancelar Pagamento"
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedPayment(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
