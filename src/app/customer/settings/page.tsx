"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { User, Lock, Bell, Palette, ChevronRight, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";

type CustomerData = {
    id: string;
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    type: "PF" | "PJ";
};

export default function SettingsPage() {
    const { user: _user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [customer, setCustomer] = React.useState<CustomerData | null>(null);

    const [name, setName] = React.useState("");
    const [phone, setPhone] = React.useState("");

    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [changingPassword, setChangingPassword] = React.useState(false);

    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [pushNotifications, setPushNotifications] = React.useState(true);
    const [transactionAlerts, setTransactionAlerts] = React.useState(true);
    const [marketingEmails, setMarketingEmails] = React.useState(false);

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                const res = await http.get<{ data: CustomerData } | CustomerData>("/customers/me");
                const data = "data" in res.data && res.data.data ? res.data.data : res.data as CustomerData;
                setCustomer(data);
                setName(data.name || "");
                setPhone(data.phone || "");
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                toast.error("Erro ao carregar dados do perfil");
            } finally {
                setLoading(false);
            }
        }
        loadCustomer();
    }, []);

    async function handleSaveProfile() {
        if (!name.trim()) {
            toast.error("Nome é obrigatório");
            return;
        }

        setSaving(true);
        try {
            await http.patch("/customers/me", { name, phone });
            toast.success("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar:", err);
            toast.error("Erro ao atualizar perfil");
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Preencha todos os campos");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("A nova senha deve ter pelo menos 6 caracteres");
            return;
        }

        setChangingPassword(true);
        try {
            await http.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            toast.success("Senha alterada com sucesso!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            console.error("Erro ao alterar senha:", err);
            const message = isAxiosError(err) ? err.response?.data?.message : undefined;
            toast.error(message || "Erro ao alterar senha");
        } finally {
            setChangingPassword(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gerencie seu perfil e preferências
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-card border border-border">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="w-4 h-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Lock className="w-4 h-4" />
                        Segurança
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="w-4 h-4" />
                        Notificações
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Palette className="w-4 h-4" />
                        Preferências
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Dados Pessoais</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="bg-background"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={customer?.email || ""}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    O email não pode ser alterado
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="bg-background"
                                />
                            </div>

                            {customer?.cpf && (
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input
                                        id="cpf"
                                        value={customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF]"
                            >
                                {saving ? "Salvando..." : "Salvar alterações"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Alterar Senha</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Senha atual</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Digite sua senha atual"
                                        className="bg-background pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nova senha</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Digite a nova senha"
                                        className="bg-background pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirme a nova senha"
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF]"
                            >
                                {changingPassword ? "Alterando..." : "Alterar senha"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Autenticação em 2 Fatores</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Adicione uma camada extra de segurança à sua conta
                                </p>
                            </div>
                            <Button variant="outline" disabled className="gap-2">
                                <Lock className="w-4 h-4" />
                                Em breve
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificações</h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Notificações por Email</p>
                                    <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Notificações Push</p>
                                    <p className="text-sm text-muted-foreground">Receba alertas no seu dispositivo</p>
                                </div>
                                <Switch
                                    checked={pushNotifications}
                                    onCheckedChange={setPushNotifications}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Alertas de Transações</p>
                                    <p className="text-sm text-muted-foreground">Seja notificado sobre depósitos e transferências</p>
                                </div>
                                <Switch
                                    checked={transactionAlerts}
                                    onCheckedChange={setTransactionAlerts}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Emails de Marketing</p>
                                    <p className="text-sm text-muted-foreground">Novidades e promoções da OtsemPay</p>
                                </div>
                                <Switch
                                    checked={marketingEmails}
                                    onCheckedChange={setMarketingEmails}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => toast.success("Preferências salvas!")}
                                className="bg-linear-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF]"
                            >
                                Salvar preferências
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Aparência</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setTheme("light")}
                                className={`relative p-4 rounded-xl border-2 transition-all ${theme === "light"
                                    ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/10"
                                    : "border-border hover:border-muted-foreground"
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                        <div className="w-8 h-1.5 bg-gray-300 rounded-full" />
                                    </div>
                                    <span className="font-medium text-foreground">Claro</span>
                                </div>
                                {theme === "light" && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#6F00FF]/50 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>

                            <button
                                onClick={() => setTheme("dark")}
                                className={`relative p-4 rounded-xl border-2 transition-all ${theme === "dark"
                                    ? "border-[#6F00FF]/50 bg-[#6F00FF]/50/10"
                                    : "border-border hover:border-muted-foreground"
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-12 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center">
                                        <div className="w-8 h-1.5 bg-gray-600 rounded-full" />
                                    </div>
                                    <span className="font-medium text-foreground">Escuro</span>
                                </div>
                                {theme === "dark" && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#6F00FF]/50 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Idioma</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Português (Brasil)
                                </p>
                            </div>
                            <Button variant="outline" disabled className="gap-2">
                                <ChevronRight className="w-4 h-4" />
                                Em breve
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
