"use client";

import * as React from "react";
import { isAxiosError } from "axios";
import http from "@/lib/http";
import { pixPost } from "@/lib/pix";
import { motion } from "framer-motion";
import {
  Loader2,
  KeyRound,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  XCircle,
  MoreVertical,
  Mail,
  Smartphone,
  Hash,
  Shuffle,
  CreditCard,
} from "lucide-react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottom-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

/* --- Types --- */

type PixKey = {
  id: string;
  keyType: string;
  keyValue: string;
  status: string;
  validated?: boolean;
  validatedAt?: string | null;
  validationAttempted?: boolean;
  validationError?: string | null;
  createdAt: string;
};

/* --- Animation variants --- */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/* --- Helpers --- */

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) return err.response?.data?.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

function getKeyTypeLabel(type: string) {
  switch (type) {
    case "RANDOM":
      return "Aleatória";
    case "CPF":
      return "CPF";
    case "CNPJ":
      return "CNPJ";
    case "EMAIL":
      return "E-mail";
    case "PHONE":
      return "Telefone";
    default:
      return type;
  }
}

function KeyTypeIconComponent({ type, size = "md" }: { type: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";
  switch (type) {
    case "CPF":
      return <CreditCard className={cls} />;
    case "CNPJ":
      return <Hash className={cls} />;
    case "EMAIL":
      return <Mail className={cls} />;
    case "PHONE":
      return <Smartphone className={cls} />;
    case "RANDOM":
      return <Shuffle className={cls} />;
    default:
      return <KeyRound className={cls} />;
  }
}

function getKeyIconColor(_type: string) {
  return "bg-white/10 text-white";
}

const KEY_TYPES = [
  { value: "CPF", label: "CPF" },
  { value: "CNPJ", label: "CNPJ" },
  { value: "EMAIL", label: "E-mail" },
  { value: "PHONE", label: "Telefone" },
  { value: "RANDOM", label: "Aleatória" },
];

/* --- Status Badge --- */

function StatusBadge({ pix }: { pix: PixKey }) {
  if (pix.validated) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-white/10 text-white border border-white/15">
        <CheckCircle2 className="w-3 h-3" />
        Validada
      </span>
    );
  }
  if (pix.validationAttempted && pix.validationError) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-white/10 text-white border border-white/15">
        <XCircle className="w-3 h-3" />
        Falhou
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-white/10 text-white border border-white/15">
      <Clock className="w-3 h-3" />
      Pendente
    </span>
  );
}

/* --- Main Component --- */

export default function CustomerPixPage() {
  const { user } = useAuth();
  const customerId = user?.customerId;
  const [loading, setLoading] = React.useState(true);
  const [pixKeys, setPixKeys] = React.useState<PixKey[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [keyToDelete, setKeyToDelete] = React.useState<PixKey | null>(null);
  const [newType, setNewType] = React.useState("CPF");
  const [newValue, setNewValue] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [validating, setValidating] = React.useState<string | null>(null);

  async function loadPixKeys() {
    if (!customerId) return;
    try {
      setLoading(true);
      const res = await http.get<PixKey[]>("/pix-keys");
      setPixKeys(res.data || []);
    } catch {
      setPixKeys([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadPixKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) return;
    setSubmitting(true);
    try {
      await http.post("/pix-keys", {
        keyType: newType,
        keyValue: newType === "RANDOM" ? crypto.randomUUID() : newValue,
      });
      toast.success("Chave Pix cadastrada com sucesso!");
      setShowModal(false);
      setNewType("CPF");
      setNewValue("");
      loadPixKeys();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao cadastrar chave Pix"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!keyToDelete) return;
    setDeleting(true);
    try {
      await http.delete("/pix-keys/" + keyToDelete.id);
      toast.success("Chave Pix removida com sucesso!");
      setShowDeleteModal(false);
      setKeyToDelete(null);
      loadPixKeys();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao remover chave Pix"));
    } finally {
      setDeleting(false);
    }
  }

  async function onCopy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Chave copiada!");
  }

  async function handleValidate(pixKeyId: string) {
    setValidating(pixKeyId);
    try {
      await pixPost("validar-chave/" + pixKeyId);
      toast.success("Chave validada com sucesso!");
      loadPixKeys();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao validar chave"));
    } finally {
      setValidating(null);
    }
  }

  function openDeleteModal(key: PixKey) {
    setKeyToDelete(key);
    setShowDeleteModal(true);
  }

  /* --- Loading State --- */

  if (loading) {
    return (
      <div className="flex h-[80dvh] flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#FFB300]/20 blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08]">
            <Loader2 className="h-7 w-7 animate-spin text-[#6F00FF]" />
          </div>
        </div>
        <p className="text-[13px] text-white">
          Carregando chaves Pix...
        </p>
      </div>
    );
  }

  /* --- Empty State --- */

  if (pixKeys.length === 0) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="pt-2 pb-8 max-w-lg mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-[22px] font-bold text-white leading-tight">
              Chaves PIX
            </h1>
            <p className="text-[13px] text-white mt-0.5">
              Gerencie suas chaves Pix
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="fintech-glass-card rounded-[20px] p-5 flex flex-col items-center text-center py-14 px-6"
        >
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-[#6F00FF]/15 blur-2xl scale-150" />
            <div className="relative w-16 h-16 rounded-full bg-[#FFB300]/10 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-[#6F00FF]" />
            </div>
          </div>

          <h2 className="text-[17px] font-bold text-white mb-1.5">
            Nenhuma chave Pix
          </h2>
          <p className="text-[13px] text-white max-w-[260px] leading-relaxed mb-7">
            Cadastre sua primeira chave Pix para come&ccedil;ar a receber pagamentos
            instant&acirc;neos.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6F00FF] hover:bg-[#8B2FFF] text-white text-[15px] font-semibold active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Chave Pix
          </button>
        </motion.div>

        <AddKeyModal
          open={showModal}
          onOpenChange={setShowModal}
          newType={newType}
          setNewType={setNewType}
          newValue={newValue}
          setNewValue={setNewValue}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </motion.div>
    );
  }

  /* --- Key List --- */

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="pt-2 pb-8 max-w-lg mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-[22px] font-bold text-white leading-tight">
            Chaves PIX
          </h1>
          <p className="text-[13px] text-white mt-0.5">
            {pixKeys.length} chave{pixKeys.length !== 1 ? "s" : ""} cadastrada
            {pixKeys.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 rounded-full bg-[#6F00FF] hover:bg-[#8B2FFF] text-white flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#FFB300]/25"
        >
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Info banner */}
      <motion.div
        variants={fadeUp}
        className="fintech-glass-card rounded-[20px] p-5 !p-3.5 mb-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-[#FFB300]/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#6F00FF]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white leading-tight">
            Valida&ccedil;&atilde;o de Chaves
          </p>
          <p className="text-[12px] text-white mt-0.5 leading-relaxed">
            Chaves CPF, CNPJ, E-mail e Telefone s&atilde;o validadas automaticamente.
            Para chaves aleat&oacute;rias, clique em &quot;Validar&quot; (R$ 0,01).
          </p>
        </div>
      </motion.div>

      {/* Keys */}
      <div className="space-y-3">
        {pixKeys.map((pix) => (
          <motion.div
            key={pix.id}
            variants={fadeUp}
            className="fintech-glass-card rounded-[20px] p-5 !p-4"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={"w-10 h-10 rounded-full flex items-center justify-center shrink-0 " + getKeyIconColor(pix.keyType)}
              >
                <KeyTypeIconComponent type={pix.keyType} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-semibold text-white">
                    {getKeyTypeLabel(pix.keyType)}
                  </span>
                  <StatusBadge pix={pix} />
                </div>

                {/* Copyable value */}
                <button
                  onClick={() => onCopy(pix.keyValue)}
                  className="group flex items-center gap-1.5 mb-1.5 active:scale-95 transition-transform"
                >
                  <code className="text-[13px] text-white font-mono truncate max-w-[200px] sm:max-w-none">
                    {pix.keyValue}
                  </code>
                  <Copy className="w-3 h-3 text-white group-hover:text-[#6F00FF] transition-colors shrink-0" />
                </button>

                {/* Date & error info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-white">
                    Criada em {formatDate(pix.createdAt)}
                  </span>
                  {pix.validated && pix.validatedAt && (
                    <span className="text-[11px] text-white">
                      &middot; Validada {formatDate(pix.validatedAt)}
                    </span>
                  )}
                  {pix.validationAttempted && pix.validationError && (
                    <span className="text-[11px] text-white">
                      &middot; {pix.validationError}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.08] flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/[0.08] active:scale-95 transition-transform shrink-0">
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl bg-white/90 dark:bg-[#1a1025]/95 backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => onCopy(pix.keyValue)}
                    className="gap-2 text-[13px] rounded-lg cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar chave
                  </DropdownMenuItem>
                  {!pix.validated && !pix.validationAttempted && (
                    <DropdownMenuItem
                      onClick={() => handleValidate(pix.id)}
                      disabled={validating === pix.id}
                      className="gap-2 text-[13px] rounded-lg cursor-pointer text-[#6F00FF]"
                    >
                      {validating === pix.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      Validar (R$ 0,01)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => openDeleteModal(pix)}
                    className="gap-2 text-[13px] rounded-lg cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover chave
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AddKeyModal
        open={showModal}
        onOpenChange={setShowModal}
        newType={newType}
        setNewType={setNewType}
        newValue={newValue}
        setNewValue={setNewValue}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <DeleteKeyModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        keyToDelete={keyToDelete}
        deleting={deleting}
        onDelete={handleDelete}
      />
    </motion.div>
  );
}

/* --- Add Key Modal --- */

function AddKeyModal({
  open,
  onOpenChange,
  newType,
  setNewType,
  newValue,
  setNewValue,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newType: string;
  setNewType: (v: string) => void;
  newValue: string;
  setNewValue: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader className="p-5 pb-0">
          <BottomSheetTitle className="text-[18px] font-bold text-foreground">
            Nova Chave Pix
          </BottomSheetTitle>
        </BottomSheetHeader>

        <form onSubmit={onSubmit} className="p-5 pt-4 space-y-5">
          {/* Key type grid */}
          <div>
            <label className="block text-[12px] font-semibold text-foreground uppercase tracking-wider mb-2.5">
              Tipo de chave
            </label>
            <div className="grid grid-cols-3 gap-2">
              {KEY_TYPES.map((kt) => (
                <button
                  key={kt.value}
                  type="button"
                  onClick={() => setNewType(kt.value)}
                  className={
                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-[12px] font-medium active:scale-95 transition-all " +
                    (newType === kt.value
                      ? "bg-[#FFB300]/10 text-[#6F00FF] border-2 border-[#6F00FF]/40 shadow-sm"
                      : "bg-muted/50 border border-border text-foreground hover:border-[#6F00FF]/20")
                  }
                >
                  <KeyTypeIconComponent type={kt.value} size="sm" />
                  {kt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key value input */}
          {newType !== "RANDOM" && (
            <div>
              <label className="block text-[12px] font-semibold text-foreground uppercase tracking-wider mb-2">
                Valor da chave
              </label>
              <Input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  newType === "CPF"
                    ? "000.000.000-00"
                    : newType === "CNPJ"
                      ? "000.000.000/0000-00"
                      : newType === "EMAIL"
                        ? "seu@email.com"
                        : "+55 11 99999-9999"
                }
                required
                className="h-11 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground text-[14px]"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Se corresponder aos seus dados, ser&aacute; validada automaticamente.
              </p>
            </div>
          )}

          {/* Random key notice */}
          {newType === "RANDOM" && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/50 border border-border">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">
                  Chave Aleat&oacute;ria
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                  Ser&aacute; gerada automaticamente. Requer valida&ccedil;&atilde;o manual via
                  micro-transfer&ecirc;ncia.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-2xl text-[14px] font-semibold text-foreground bg-muted border border-border hover:bg-muted/80 active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || (newType !== "RANDOM" && !newValue)}
              className="flex-1 h-11 rounded-2xl text-[14px] font-semibold text-white bg-[#6F00FF] hover:bg-[#8B2FFF] disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          </div>
        </form>
      </BottomSheetContent>
    </BottomSheet>
  );
}

/* --- Delete Key Modal --- */

function DeleteKeyModal({
  open,
  onOpenChange,
  keyToDelete,
  deleting,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  keyToDelete: PixKey | null;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader className="p-5 pb-0">
          <BottomSheetTitle className="text-[18px] font-bold text-foreground">
            Remover Chave Pix
          </BottomSheetTitle>
        </BottomSheetHeader>

        <div className="p-5 pt-3 space-y-4">
          <p className="text-[14px] text-foreground">
            Tem certeza que deseja remover esta chave?
          </p>

          {keyToDelete && (
            <div className={"flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border"}>
              <div
                className={"w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-muted text-foreground"}
              >
                <KeyTypeIconComponent type={keyToDelete.keyType} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">
                  {getKeyTypeLabel(keyToDelete.keyType)}
                </p>
                <code className="text-[12px] text-muted-foreground font-mono truncate block">
                  {keyToDelete.keyValue}
                </code>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-2xl text-[14px] font-semibold text-foreground bg-muted border border-border hover:bg-muted/80 active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="flex-1 h-11 rounded-2xl text-[14px] font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Remover
                </>
              )}
            </button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
