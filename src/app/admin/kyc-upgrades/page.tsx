"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    ArrowUpCircle,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    User,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface UpgradeRequest {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    currentLevel: string;
    targetLevel: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    documents: Array<{ name: string; url: string }>;
    createdAt: string;
    updatedAt: string;
}

const LEVEL_NAMES: Record<string, string> = {
    LEVEL_1: "Nível 1 - Bronze",
    LEVEL_2: "Nível 2 - Prata",
    LEVEL_3: "Nível 3 - Ouro",
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pendente",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
    },
    APPROVED: {
        label: "Aprovado",
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejeitado",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
    },
};

export default function KycUpgradesPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [requests, setRequests] = React.useState<UpgradeRequest[]>([]);
    const [activeTab, setActiveTab] = React.useState<string>("PENDING");
    const [searchTerm, setSearchTerm] = React.useState("");

    async function loadRequests() {
        try {
            setLoading(true);
            const res = await http.get<{ data: UpgradeRequest[] }>(
                `/admin/kyc-upgrade-requests?status=${activeTab}`
            );
            setRequests(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar solicitações");
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        loadRequests();
    }, [activeTab]);

    const filteredRequests = requests.filter((req) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            req.customerName?.toLowerCase().includes(search) ||
            req.customerEmail?.toLowerCase().includes(search) ||
            req.id.toLowerCase().includes(search)
        );
    });

    const stats = {
        pending: requests.filter((r) => r.status === "PENDING").length,
        approved: requests.filter((r) => r.status === "APPROVED").length,
        rejected: requests.filter((r) => r.status === "REJECTED").length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Solicitações de Upgrade KYC
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie as solicitações de aumento de limite dos clientes
                    </p>
                </div>
                <Button
                    onClick={loadRequests}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="premium-card border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-100">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-amber-700">Pendentes</p>
                            <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card border-emerald-200 bg-emerald-50/50">
                    <CardContent className="pt-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-emerald-700">Aprovadas</p>
                            <p className="text-2xl font-bold text-emerald-800">{stats.approved}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card border-red-200 bg-red-50/50">
                    <CardContent className="pt-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-100">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-red-700">Rejeitadas</p>
                            <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                        <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                        <TabsTrigger value="APPROVED">Aprovadas</TabsTrigger>
                        <TabsTrigger value="REJECTED">Rejeitadas</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Requests List */}
            <Card className="premium-card">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ArrowUpCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">
                                Nenhuma solicitação {activeTab === "PENDING" ? "pendente" : activeTab === "APPROVED" ? "aprovada" : "rejeitada"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredRequests.map((request, index) => {
                                const statusConfig = STATUS_CONFIG[request.status];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => router.push(`/admin/kyc-upgrades/${request.id}`)}
                                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-foreground truncate">
                                                        {request.customerName || "Nome não informado"}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusConfig.color}
                                                    >
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {request.customerEmail}
                                                </p>
                                            </div>

                                            <div className="hidden sm:block text-right">
                                                <p className="text-sm font-medium text-foreground">
                                                    {LEVEL_NAMES[request.currentLevel] || request.currentLevel} → {LEVEL_NAMES[request.targetLevel] || request.targetLevel}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(parseISO(request.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-sm">{request.documents?.length || 0}</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
