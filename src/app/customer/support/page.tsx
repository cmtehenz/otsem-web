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
        icon: "💰",
    },
    {
        title: "Converter para USDT",
        description: "Como trocar seus reais por dólares digitais",
        icon: "🔄",
    },
    {
        title: "Verificar Identidade",
        description: "Complete seu KYC em poucos minutos",
        icon: "🪪",
    },
    {
        title: "Gerenciar Carteiras",
        description: "Adicione e gerencie suas carteiras crypto",
        icon: "👛",
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
        <div className="space-y-2">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    variants={fadeUp}
                    className="fintech-glass-card rounded-[20px] p-5 !rounded-[18px] !p-0 overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left active:scale-[0.98] transition-transform"
                    >
                        <span className="text-[14px] font-medium text-white pr-4 leading-snug">
                            {item.question}
                        </span>
                        <motion.div
                            animate={{ rotate: openIndex === index ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                            className="flex-shrink-0"
                        >
                            <ChevronDown className="w-[18px] h-[18px] text-white/60" />
                        </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 pb-4 text-[13px] text-white/60 leading-relaxed">
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
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
                <p className="text-[13px] text-white/60 mt-0.5">
                    Encontre respostas ou fale conosco
                </p>
            </motion.div>

            {/* ── System Status ────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="fintech-glass-card rounded-[20px] p-5 !rounded-[20px] !p-4 bg-gradient-to-br from-[#6F00FF]/10 to-[#6F00FF]/5 dark:from-[#6F00FF]/20 dark:to-[#6F00FF]/5">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-white">
                                Sistema Operacional
                            </p>
                            <p className="text-[12px] text-white/60">
                                Todos os serviços funcionando normalmente
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Contact Methods (horizontal scroll on mobile) ── */}
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
                        className="fintech-glass-card rounded-[20px] p-5 !rounded-[20px] !p-4 min-w-[160px] flex-1 snap-start active:scale-95 transition-transform group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mb-3">
                            <MessageCircle className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[14px] font-semibold text-white">
                                WhatsApp
                            </span>
                            <ExternalLink className="w-3 h-3 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[12px] text-white/60 leading-snug">
                            Atendimento rápido
                        </p>
                        <p className="text-[11px] text-white/40 mt-1.5">
                            Seg-Sex 9h-18h
                        </p>
                    </a>

                    {/* Email */}
                    <a
                        href="mailto:suporte@otsempay.com"
                        className="fintech-glass-card rounded-[20px] p-5 !rounded-[20px] !p-4 min-w-[160px] flex-1 snap-start active:scale-95 transition-transform group"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#6F00FF]/12 flex items-center justify-center mb-3">
                            <Mail className="w-5 h-5 text-[#6F00FF]" />
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[14px] font-semibold text-white">
                                Email
                            </span>
                            <ExternalLink className="w-3 h-3 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[12px] text-white/60 leading-snug">
                            suporte@otsempay.com
                        </p>
                        <p className="text-[11px] text-white/40 mt-1.5">
                            Resposta em até 24h
                        </p>
                    </a>

                    {/* Phone */}
                    <div className="fintech-glass-card rounded-[20px] p-5 !rounded-[20px] !p-4 min-w-[160px] flex-1 snap-start">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/12 flex items-center justify-center mb-3">
                            <Phone className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-[14px] font-semibold text-white block mb-1">
                            Telefone
                        </span>
                        <p className="text-[12px] text-white/60 leading-snug">
                            (11) 3000-0000
                        </p>
                        <p className="text-[11px] text-white/40 mt-1.5">
                            Seg-Sex 9h-18h
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Tutorials ───────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                    <BookOpen className="w-[18px] h-[18px] text-[#6F00FF]" />
                    <p className="text-[15px] font-semibold text-white">
                        Tutoriais Rápidos
                    </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                    {tutorials.map((tutorial, index) => (
                        <button
                            key={index}
                            onClick={() => toast.info("Tutorial em desenvolvimento")}
                            className="fintech-glass-card rounded-[20px] p-5 !rounded-[20px] !p-4 min-w-[148px] flex-1 text-left snap-start active:scale-95 transition-transform group"
                        >
                            <div className="text-[28px] mb-2.5">{tutorial.icon}</div>
                            <h3 className="text-[13px] font-semibold text-white mb-0.5 leading-snug">
                                {tutorial.title}
                            </h3>
                            <p className="text-[11px] text-white/60 leading-snug">
                                {tutorial.description}
                            </p>
                            <div className="flex items-center gap-1 text-[#6F00FF] text-[11px] font-medium mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver tutorial
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── FAQ ─────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="flex items-center gap-2 mb-3 px-0.5">
                    <HelpCircle className="w-[18px] h-[18px] text-[#6F00FF]" />
                    <p className="text-[15px] font-semibold text-white">
                        Perguntas Frequentes
                    </p>
                </div>
                <FAQAccordion items={faqItems} />
            </motion.div>

            {/* ── Support Ticket Form ─────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="fintech-glass-card rounded-[20px] p-5 !rounded-[22px]">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-[18px] h-[18px] text-[#6F00FF]" />
                        <h2 className="text-[15px] font-semibold text-white">
                            Abrir Chamado
                        </h2>
                    </div>
                    <p className="text-[13px] text-white/60 mb-5">
                        Não encontrou o que procurava? Envie sua dúvida ou reporte um problema.
                    </p>

                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="subject"
                                    className="text-[13px] font-medium text-white/80"
                                >
                                    Assunto
                                </Label>
                                <Input
                                    id="subject"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    placeholder="Ex: Problema com depósito"
                                    className="h-11 rounded-xl bg-white/10 border-white/15 text-[14px] placeholder:text-white/40"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="category"
                                    className="text-[13px] font-medium text-white/80"
                                >
                                    Categoria
                                </Label>
                                <Select value={ticketCategory} onValueChange={setTicketCategory}>
                                    <SelectTrigger className="h-11 rounded-xl bg-white/10 border-white/15 text-[14px]">
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

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="message"
                                className="text-[13px] font-medium text-white/80"
                            >
                                Mensagem
                            </Label>
                            <Textarea
                                id="message"
                                value={ticketMessage}
                                onChange={(e) => setTicketMessage(e.target.value)}
                                placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível..."
                                rows={5}
                                className="rounded-xl bg-white/10 border-white/15 text-[14px] placeholder:text-white/40 resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="h-11 px-6 rounded-xl bg-[#6F00FF] hover:bg-[#5C00D6] text-white text-[14px] font-semibold gap-2 active:scale-95 transition-transform shadow-lg shadow-[#6F00FF]/25"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
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
