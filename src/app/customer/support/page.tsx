"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Phone,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Send,
    ExternalLink,
    BookOpen,
    ArrowRight,
    Activity,
    ArrowDownLeft,
    ArrowRightLeft,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────
type FAQItem = {
    question: string;
    answer: string;
};

// ─── Data ────────────────────────────────────────────────
const faqItems: FAQItem[] = [
    {
        question: "Como fazer um depósito PIX?",
        answer: "No Dashboard, clique no botão 'Depositar'. Será gerado um QR Code PIX. Escaneie com o app do seu banco ou copie o código para fazer o pagamento. O valor será creditado automaticamente em sua conta.",
    },
    {
        question: "Como converter BRL para USDT?",
        answer: "No Dashboard, clique no botão 'Converter'. Digite o valor em BRL que deseja converter. A cotação será exibida em tempo real. Confirme a operação e o USDT será creditado em sua carteira.",
    },
    {
        question: "Quanto tempo leva uma transferência PIX?",
        answer: "Transferências PIX são processadas instantaneamente, 24 horas por dia, 7 dias por semana. Em casos raros, pode levar até alguns minutos para confirmação.",
    },
    {
        question: "Como verificar minha identidade (KYC)?",
        answer: "Acesse 'Verificar Identidade' no menu lateral. Clique em 'Iniciar Verificação' e você será redirecionado para nosso parceiro de verificação. Tenha em mãos um documento com foto (RG ou CNH) e prepare-se para tirar uma selfie.",
    },
    {
        question: "Quais são as taxas da OtsemPay?",
        answer: "Depósitos PIX são gratuitos. Para conversões BRL/USDT, aplicamos um spread de 5% sobre a cotação. Transferências PIX têm taxa fixa conforme seu plano.",
    },
    {
        question: "Como adicionar uma carteira USDT?",
        answer: "Acesse 'Carteiras' no menu lateral e clique em 'Adicionar Carteira'. Informe o endereço da sua carteira e selecione a rede (TRON ou Solana). Suas compras de USDT serão enviadas para essa carteira.",
    },
    {
        question: "Posso cancelar uma transação?",
        answer: "Transações PIX e conversões confirmadas não podem ser canceladas. Antes de confirmar qualquer operação, verifique atentamente todos os dados.",
    },
    {
        question: "O que fazer se minha transação falhar?",
        answer: "Se uma transação falhar, o valor será devolvido automaticamente ao seu saldo em até 24 horas. Caso não receba, entre em contato com nosso suporte.",
    },
];

const tutorials = [
    {
        title: "Primeiro Depósito",
        description: "Aprenda a fazer seu primeiro depósito via PIX",
        Icon: ArrowDownLeft,
    },
    {
        title: "Converter para USDT",
        description: "Como trocar seus reais por dólares digitais",
        Icon: ArrowRightLeft,
    },
    {
        title: "Verificar Identidade",
        description: "Complete seu KYC em poucos minutos",
        Icon: ShieldCheck,
    },
    {
        title: "Gerenciar Carteiras",
        description: "Adicione e gerencie suas carteiras crypto",
        Icon: Wallet,
    },
];

// ─── Animations ──────────────────────────────────────────
const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.06 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } },
};

// ─── FAQ Accordion ───────────────────────────────────────
function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <motion.div
                        key={index}
                        variants={fadeUp}
                        className="fintech-glass-card !rounded-2xl !p-0 overflow-hidden"
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left active:scale-[0.98] transition-transform"
                        >
                            <span className="text-[14px] sm:text-[15px] font-medium text-white leading-snug flex-1">
                                {item.question}
                            </span>
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                            >
                                <ChevronDown className="w-4 h-4 text-white/80" />
                            </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                                        <div className="h-px bg-white/10 mb-3" />
                                        <p className="text-[13px] sm:text-[14px] text-white/90 leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────
export default function SupportPage() {
    const [ticketSubject, setTicketSubject] = React.useState("");
    const [ticketCategory, setTicketCategory] = React.useState("");
    const [ticketMessage, setTicketMessage] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);

    async function handleSubmitTicket(e: React.FormEvent) {
        e.preventDefault();

        if (!ticketSubject.trim() || !ticketCategory || !ticketMessage.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }

        setSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Chamado enviado com sucesso! Responderemos em até 24h.");
        setTicketSubject("");
        setTicketCategory("");
        setTicketMessage("");
        setSubmitting(false);
    }

    return (
        <motion.div
            className="space-y-6 pb-8"
            variants={stagger}
            initial="hidden"
            animate="show"
        >
            {/* ── Header ──────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <h1 className="text-[22px] font-bold text-white">Ajuda</h1>
                <p className="text-[13px] text-white mt-0.5">
                    Encontre respostas ou fale conosco
                </p>
            </motion.div>

            {/* ── System Status ────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="fintech-glass-card !rounded-2xl !p-5 bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black/30 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[16px] font-semibold text-white">
                                Sistema Operacional
                            </p>
                            <p className="text-[13px] text-white/80 mt-0.5">
                                Todos os serviços funcionando normalmente
                            </p>
                        </div>
                        <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[12px] font-medium text-emerald-400">Online</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Contact Methods ─────────────────────────── */}
            <motion.div variants={fadeUp}>
                <p className="text-[15px] font-semibold text-white mb-3 px-0.5">
                    Fale conosco
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/5511999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fintech-glass-card !rounded-2xl !p-0 min-w-[170px] flex-1 snap-start active:scale-[0.96] transition-transform group"
                    >
                        <div className="p-4 sm:p-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-3">
                                <MessageCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[15px] font-semibold text-white">
                                    WhatsApp
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover:text-white/80 transition-colors" />
                            </div>
                            <p className="text-[13px] text-white/80 leading-snug">
                                Atendimento rápido
                            </p>
                            <p className="text-[12px] text-white mt-2">
                                Seg-Sex 9h-18h
                            </p>
                        </div>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:suporte@otsempay.com"
                        className="fintech-glass-card !rounded-2xl !p-0 min-w-[170px] flex-1 snap-start active:scale-[0.96] transition-transform group"
                    >
                        <div className="p-4 sm:p-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[15px] font-semibold text-white">
                                    Email
                                </span>
                                <ExternalLink className="w-3.5 h-3.5 text-white/90 group-hover:text-white/80 transition-colors" />
                            </div>
                            <p className="text-[13px] text-white/80 leading-snug">
                                suporte@otsempay.com
                            </p>
                            <p className="text-[12px] text-white mt-2">
                                Resposta em até 24h
                            </p>
                        </div>
                    </a>

                    {/* Phone */}
                    <div className="fintech-glass-card !rounded-2xl !p-0 min-w-[170px] flex-1 snap-start">
                        <div className="p-4 sm:p-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[15px] font-semibold text-white block mb-1.5">
                                Telefone
                            </span>
                            <p className="text-[13px] text-white/80 leading-snug">
                                (11) 3000-0000
                            </p>
                            <p className="text-[12px] text-white mt-2">
                                Seg-Sex 9h-18h
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Tutorials ───────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                    <BookOpen className="w-[18px] h-[18px] text-primary" />
                    <p className="text-[15px] font-semibold text-white">
                        Tutoriais Rápidos
                    </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                    {tutorials.map((tutorial, index) => (
                        <motion.button
                            key={index}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            onClick={() => toast.info("Tutorial em desenvolvimento")}
                            className="fintech-glass-card !rounded-2xl !p-0 min-w-[155px] flex-1 text-left snap-start group"
                        >
                            <div className="p-4 sm:p-5">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                                    <tutorial.Icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-[13px] font-semibold text-white mb-1 leading-snug">
                                    {tutorial.title}
                                </h3>
                                <p className="text-[11px] text-white leading-snug">
                                    {tutorial.description}
                                </p>
                                <div className="flex items-center gap-1 text-primary text-[11px] font-medium mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                                    Ver tutorial
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* ── FAQ ─────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                    <HelpCircle className="w-[18px] h-[18px] text-primary" />
                    <p className="text-[15px] font-semibold text-white">
                        Perguntas Frequentes
                    </p>
                </div>
                <FAQAccordion items={faqItems} />
            </motion.div>

            {/* ── Support Ticket Form ─────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="fintech-glass-card !rounded-2xl !p-5 sm:!p-6">
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                            <AlertCircle className="w-[18px] h-[18px] text-primary" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-semibold text-white">
                                Abrir Chamado
                            </h2>
                        </div>
                    </div>
                    <p className="text-[13px] text-white/80 mb-5 ml-12">
                        Não encontrou o que procurava? Envie sua dúvida ou reporte um problema.
                    </p>

                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="subject"
                                    className="text-[13px] font-medium text-white/90"
                                >
                                    Assunto
                                </Label>
                                <Input
                                    id="subject"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    placeholder="Ex: Problema com depósito"
                                    className="h-12 rounded-xl bg-white/8 border-white/10 text-[14px] text-white placeholder:text-white/90 focus:border-primary/50 focus:ring-primary/20 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="category"
                                    className="text-[13px] font-medium text-white/90"
                                >
                                    Categoria
                                </Label>
                                <Select value={ticketCategory} onValueChange={setTicketCategory}>
                                    <SelectTrigger className="h-12 rounded-xl bg-white/8 border-white/10 text-[14px] focus:border-primary/50 focus:ring-primary/20 transition-colors">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deposit">Depósito</SelectItem>
                                        <SelectItem value="withdraw">Transferência</SelectItem>
                                        <SelectItem value="conversion">Conversão USDT</SelectItem>
                                        <SelectItem value="kyc">Verificação (KYC)</SelectItem>
                                        <SelectItem value="account">Minha Conta</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="message"
                                className="text-[13px] font-medium text-white/90"
                            >
                                Mensagem
                            </Label>
                            <Textarea
                                id="message"
                                value={ticketMessage}
                                onChange={(e) => setTicketMessage(e.target.value)}
                                placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível..."
                                rows={5}
                                className="rounded-xl bg-white/8 border-white/10 text-[14px] text-white placeholder:text-white/90 resize-none focus:border-primary/50 focus:ring-primary/20 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#FFD54F] to-[#FFB300] hover:from-[#FFC107] hover:to-[#FF8F00] text-black text-[14px] font-semibold gap-2.5 active:scale-[0.96] transition-transform shadow-lg shadow-[#FFB300]/25 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2.5">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                        >
                                            <Send className="w-4 h-4" />
                                        </motion.div>
                                        Enviando...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Enviar Chamado
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}
