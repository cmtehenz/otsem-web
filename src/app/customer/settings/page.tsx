"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Palette,
  Globe,
  Eye,
  EyeOff,
  Check,
  Sun,
  Moon,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

// ─── Animation variants ────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  },
};

// ─── Types ─────────────────────────────────────────────────
type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  type: "PF" | "PJ";
};

// ─── Section Header ───────────────────────────────────────────
function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6F00FF]/10">
        <Icon className="h-4 w-4 text-[#6F00FF]" />
      </div>
      <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function SettingsPage() {
  const { user: _user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [customer, setCustomer] = React.useState<CustomerData | null>(null);

  // Profile fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  // ── Load customer ────────────────────────────
  React.useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await http.get<{ data: CustomerData } | CustomerData>(
          "/customers/me",
        );
        const data =
          "data" in res.data && res.data.data
            ? res.data.data
            : (res.data as CustomerData);
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

  // ── Save profile ─────────────────────────────
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

  // ── Change password ──────────────────────────
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
      const message = isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  }

  // ── Loading state ────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-[14px]">Carregando...</div>
      </div>
    );
  }

  // ── CPF formatter ────────────────────────────
  const formattedCpf = customer?.cpf
    ? customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    : "";

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-5 pb-8"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ── Page Header ───────────────────────── */}
      <motion.div variants={fadeUp} className="px-1">
        <h1 className="text-[22px] font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Gerencie seu perfil e preferências
        </p>
      </motion.div>

      {/* ── Quick Links ─────────────────────────── */}
      <motion.div variants={fadeUp} className="premium-card !p-2">
        {[
          { href: "/customer/pix", icon: KeyRound, label: "Chaves PIX", sublabel: "Gerenciar suas chaves", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-500/20" },
          { href: "/customer/kyc", icon: ShieldCheck, label: "Verificação", sublabel: "Limites e documentos", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
          { href: "/customer/affiliates", icon: Users, label: "Indicações", sublabel: "Convide amigos e ganhe", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 dark:bg-purple-500/20" },
          { href: "/customer/support", icon: HelpCircle, label: "Suporte", sublabel: "Ajuda e contato", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 dark:bg-orange-500/20" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl active:bg-muted/50 transition-colors"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg} shrink-0`}>
              <item.icon className={`h-5 w-5 ${item.color}`} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground">{item.label}</p>
              <p className="text-[12px] text-muted-foreground">{item.sublabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          </Link>
        ))}

        <div className="mx-4 border-t border-border/50" />

        <Link
          href="/customer/logout"
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl active:bg-red-500/10 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20 shrink-0">
            <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] font-semibold text-red-600 dark:text-red-400">Sair</p>
        </Link>
      </motion.div>

      {/* ── Section 1: Profile ──────────────────── */}
      <motion.div variants={fadeUp} className="premium-card">
        <SectionTitle icon={User} title="Dados Pessoais" />

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[13px] text-muted-foreground"
            >
              Nome completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="border-border bg-background rounded-xl h-11 text-[14px]"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[13px] text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              value={customer?.email || ""}
              disabled
              className="border-border bg-muted/50 rounded-xl h-11 text-[14px] opacity-60"
            />
            <p className="text-[12px] text-muted-foreground/70">
              O email não pode ser alterado
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-[13px] text-muted-foreground"
            >
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="border-border bg-background rounded-xl h-11 text-[14px]"
            />
          </div>

          {/* CPF (readonly) */}
          {customer?.cpf && (
            <div className="space-y-1.5">
              <Label
                htmlFor="cpf"
                className="text-[13px] text-muted-foreground"
              >
                CPF
              </Label>
              <Input
                id="cpf"
                value={formattedCpf}
                disabled
                className="border-border bg-muted/50 rounded-xl h-11 text-[14px] opacity-60"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-6 bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white rounded-2xl h-12 w-full text-[14px] font-semibold active:scale-95 transition-transform"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </motion.div>

      {/* ── Section 2: Security ─────────────────── */}
      <motion.div variants={fadeUp} className="premium-card">
        <SectionTitle icon={Lock} title="Alterar Senha" />

        <div className="space-y-4">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="currentPassword"
              className="text-[13px] text-muted-foreground"
            >
              Senha atual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="border-border bg-background rounded-xl h-11 text-[14px] pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="newPassword"
              className="text-[13px] text-muted-foreground"
            >
              Nova senha
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="border-border bg-background rounded-xl h-11 text-[14px] pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-[13px] text-muted-foreground"
            >
              Confirmar nova senha
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="border-border bg-background rounded-xl h-11 text-[14px] pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="mt-6 bg-[#6F00FF] hover:bg-[#6F00FF]/90 text-white rounded-2xl h-12 w-full text-[14px] font-semibold active:scale-95 transition-transform"
        >
          {changingPassword ? "Alterando..." : "Alterar senha"}
        </Button>
      </motion.div>

      {/* ── Section 3: Preferences ──────────────── */}
      <motion.div variants={fadeUp} className="premium-card">
        <SectionTitle icon={Palette} title="Preferências" />

        {/* Theme toggle */}
        <div className="mb-5">
          <p className="text-[13px] text-muted-foreground mb-3">Aparência</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                theme === "light"
                  ? "border-[#6F00FF] bg-[#6F00FF]/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <span className="text-[13px] font-medium text-foreground">
                Claro
              </span>
              {theme === "light" && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6F00FF]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                theme === "dark"
                  ? "border-[#6F00FF] bg-[#6F00FF]/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Moon className="h-5 w-5 text-indigo-500" />
              </div>
              <span className="text-[13px] font-medium text-foreground">
                Escuro
              </span>
              {theme === "dark" && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6F00FF]">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Language placeholder */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Idioma</p>
              <p className="text-[12px] text-muted-foreground">
                Português (Brasil)
              </p>
            </div>
          </div>
          <span className="text-[12px] font-medium text-muted-foreground/60 bg-muted/80 px-2.5 py-1 rounded-full">
            Em breve
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
