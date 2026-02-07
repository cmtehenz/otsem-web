"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  User,
  Globe,
  Camera,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  Users,
  LogOut,
  ChevronRight,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import http from "@/lib/http";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Language config ──────────────────────────────────────────
const LOCALES = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", label: "Español", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "ru", label: "Русский", flag: "\u{1F1F7}\u{1F1FA}" },
] as const;

function getCurrentLocale(): string {
  try {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    return match?.[1] || "pt-BR";
  } catch {
    return "pt-BR";
  }
}

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
  username?: string | null;
  profilePhotoUrl?: string;
};

// ─── Profile photo localStorage helpers ───────────────────
const PHOTO_KEY = "otsem_profile_photo";

function getStoredPhoto(): string | null {
  try {
    return localStorage.getItem(PHOTO_KEY);
  } catch {
    return null;
  }
}

function setStoredPhoto(dataUrl: string) {
  try {
    localStorage.setItem(PHOTO_KEY, dataUrl);
  } catch {
    // localStorage full or unavailable
  }
}

function removeStoredPhoto() {
  try {
    localStorage.removeItem(PHOTO_KEY);
  } catch {
    // ignore
  }
}

function compressImage(file: File, maxSize: number = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, sx, sy, size, size, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3871F1]/15">
        <Icon className="h-4 w-4 text-[#3871F1]" />
      </div>
      <h2 className="text-[15px] font-semibold text-white">{title}</h2>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function SettingsPage() {
  const { user: _user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [customer, setCustomer] = React.useState<CustomerData | null>(null);
  const [currentLocale, setCurrentLocale] = React.useState("pt-BR");

  // Initialize locale from cookie on mount
  React.useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  // Profile fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [usernameField, setUsernameField] = React.useState("");
  const [savingUsername, setSavingUsername] = React.useState(false);
  const [hasUsername, setHasUsername] = React.useState(false);

  // Profile photo
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        setUsernameField(data.username || "");
        setHasUsername(!!data.username);

        // Load profile photo: prefer API URL, fallback to localStorage
        const storedPhoto = getStoredPhoto();
        if (data.profilePhotoUrl) {
          setProfilePhoto(data.profilePhotoUrl);
        } else if (storedPhoto) {
          setProfilePhoto(storedPhoto);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, []);

  // ── Handle photo upload ────────────────────
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      // Compress and store locally for immediate display
      const compressed = await compressImage(file);
      setStoredPhoto(compressed);
      setProfilePhoto(compressed);

      // Also try to upload to API
      const formData = new FormData();
      formData.append("profilePhoto", file);
      await http.patch("/customers/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Dispatch event so MobileHeader can update
      window.dispatchEvent(new Event("profile-photo-changed"));
      toast.success("Foto atualizada com sucesso!");
    } catch {
      // Even if API fails, local photo is saved
      window.dispatchEvent(new Event("profile-photo-changed"));
      toast.success("Foto atualizada!");
    } finally {
      setUploadingPhoto(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemovePhoto() {
    removeStoredPhoto();
    setProfilePhoto(null);
    window.dispatchEvent(new Event("profile-photo-changed"));
    toast.success("Foto removida");
  }

  // ── Switch language ────────────────────────────
  function switchLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;SameSite=Lax`;
    setCurrentLocale(code);
    router.refresh();
  }

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

  // ── Save username ─────────────────────────────
  async function handleSaveUsername() {
    const cleaned = usernameField.trim().toLowerCase().replace(/^@/, "");
    if (!cleaned) {
      toast.error("Digite um nome de usuário");
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
      toast.error("Username deve conter 3-30 caracteres (letras, números, _)");
      return;
    }

    setSavingUsername(true);
    try {
      await http.patch("/customers/me", { username: cleaned });
      setUsernameField(cleaned);
      setHasUsername(true);
      toast.success("Username definido com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar username:", err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erro ao definir username");
    } finally {
      setSavingUsername(false);
    }
  }

  // ── Loading state ────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-[14px]">Carregando...</div>
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
        <h1 className="text-[22px] font-bold text-white">
          Configurações
        </h1>
        <p className="text-[13px] text-white mt-0.5">
          Gerencie seu perfil e preferências
        </p>
      </motion.div>

      {/* ── Profile Photo ──────────────────────── */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5">
        <SectionTitle icon={Camera} title="Foto de Perfil" />
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
              {profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={() => {
                    // If API URL fails, fall back to localStorage
                    const stored = getStoredPhoto();
                    if (stored && stored !== profilePhoto) {
                      setProfilePhoto(stored);
                    } else {
                      setProfilePhoto(null);
                    }
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-white" strokeWidth={1.5} />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#3871F1] border-2 border-black/20 active:scale-95 transition-transform"
            >
              <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </button>
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[14px] font-medium text-white">
              {customer?.name || (profilePhoto ? "Alterar foto" : "Adicionar foto")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-[13px] font-medium text-[#3871F1] active:opacity-70 transition-opacity"
              >
                {uploadingPhoto ? "Enviando..." : "Escolher foto"}
              </button>
              {profilePhoto && (
                <button
                  onClick={handleRemovePhoto}
                  className="text-[13px] font-medium text-white active:opacity-70 transition-opacity"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </motion.div>

      {/* ── Quick Links ─────────────────────────── */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5 !p-2">
        {[
          { href: "/customer/pix", icon: KeyRound, label: "Chaves PIX", sublabel: "Gerenciar suas chaves" },
          { href: "/customer/kyc", icon: ShieldCheck, label: "Verificação", sublabel: "Limites e documentos" },
          { href: "/customer/affiliates", icon: Users, label: "Indicações", sublabel: "Convide amigos e ganhe" },
          { href: "/customer/support", icon: HelpCircle, label: "Suporte", sublabel: "Ajuda e contato" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl active:bg-white/10 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shrink-0">
              <item.icon className="h-5 w-5 text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white">{item.label}</p>
              <p className="text-[12px] text-white">{item.sublabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-white shrink-0" />
          </Link>
        ))}

        <div className="mx-4 border-t border-white/10" />

        <Link
          href="/customer/logout"
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl active:bg-red-500/10 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shrink-0">
            <LogOut className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] font-semibold text-white">Sair</p>
        </Link>
      </motion.div>

      {/* ── Section 1: Profile ──────────────────── */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5">
        <SectionTitle icon={User} title="Dados Pessoais" />

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-[13px] text-white"
            >
              Nome completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="border-white/15 bg-white/10 rounded-xl h-11 text-[14px] text-white placeholder:text-white/40"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-[13px] text-white"
            >
              Email
            </Label>
            <Input
              id="email"
              value={customer?.email || ""}
              disabled
              className="border-white/15 bg-white/10 rounded-xl h-11 text-[14px] text-white placeholder:text-white/40 disabled:opacity-100"
            />
            <p className="text-[12px] text-white">
              O email não pode ser alterado
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-[13px] text-white"
            >
              Telefone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="border-white/15 bg-white/10 rounded-xl h-11 text-[14px] text-white placeholder:text-white/40"
            />
          </div>

          {/* CPF (readonly) */}
          {customer?.cpf && (
            <div className="space-y-1.5">
              <Label
                htmlFor="cpf"
                className="text-[13px] text-white"
              >
                CPF
              </Label>
              <Input
                id="cpf"
                value={formattedCpf}
                disabled
                className="border-white/15 bg-white/10 rounded-xl h-11 text-[14px] text-white placeholder:text-white/40 disabled:opacity-100"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl h-12 w-full text-[14px] font-semibold active:scale-95 transition-transform"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </motion.div>

      {/* ── Section: Username ──────────────────── */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5">
        <SectionTitle icon={AtSign} title="Nome de Usuário" />

        {hasUsername ? (
          <div className="space-y-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-white font-semibold text-[15px]">
                @{usernameField}
              </p>
              <p className="text-[12px] text-white mt-1">
                Outros usuários podem te enviar transferências usando este nome.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-white">
              Defina um nome de usuário para receber transferências de outros
              usuários Otsem Pay.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[13px] text-white">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                  @
                </span>
                <Input
                  id="username"
                  value={usernameField}
                  onChange={(e) =>
                    setUsernameField(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  placeholder="meuusuario"
                  maxLength={30}
                  className="border-white/15 bg-white/10 rounded-xl h-11 text-[14px] text-white placeholder:text-white/40 pl-7"
                />
              </div>
              <p className="text-[11px] text-white">
                3-30 caracteres: letras, números e underline
              </p>
            </div>
            <Button
              onClick={handleSaveUsername}
              disabled={savingUsername || !usernameField.trim()}
              className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl h-12 w-full text-[14px] font-semibold active:scale-95 transition-transform"
            >
              {savingUsername ? "Salvando..." : "Definir username"}
            </Button>
          </div>
        )}
      </motion.div>

      {/* ── Section 2: Preferences ──────────────── */}
      <motion.div variants={fadeUp} className="fintech-glass-card rounded-[20px] p-5">
        <SectionTitle icon={Globe} title="Preferências" />

        <p className="text-[13px] text-white mb-3">Idioma</p>
        <div className="grid grid-cols-2 gap-2.5">
          {LOCALES.map((locale) => (
            <button
              key={locale.code}
              onClick={() => switchLocale(locale.code)}
              className={`relative flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                currentLocale === locale.code
                  ? "border-[#3871F1] bg-[#3871F1]/15"
                  : "border-white/15 hover:border-white/30"
              }`}
            >
              <span className="text-[18px]">{locale.flag}</span>
              <span className="text-[13px] font-medium text-white">
                {locale.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
