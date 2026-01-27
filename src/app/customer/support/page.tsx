"use client";

import * as React from "react";
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
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

type FAQItem = {
    question: string;
    answer: string;
};

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

function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition"
                    >
                        <span className="font-medium text-foreground pr-4">{item.question}</span>
                        {openIndex === index ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                    </button>
                    {openIndex === index && (
                        <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                            {item.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

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
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Central de Ajuda</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Encontre respostas para suas dúvidas ou entre em contato conosco
                </p>
            </div>

            <div className="bg-gradient-to-br from-[#6F00FF] to-purple-700 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span className="text-white font-medium">Sistema Operacional</span>
                </div>
                <p className="text-white/80 text-sm">
                    Todos os serviços estão funcionando normalmente
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card border border-border rounded-xl p-5 hover:border-green-500/50 hover:bg-green-500/5 transition group"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <MessageCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="font-semibold text-foreground">WhatsApp</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Atendimento rápido pelo WhatsApp
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Seg-Sex: 9h às 18h
                    </p>
                </a>

                <a
                    href="mailto:suporte@otsempay.com"
                    className="bg-card border border-border rounded-xl p-5 hover:border-[#6F00FF]/50/50 hover:bg-[#6F00FF]/50/5 transition group"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#6F00FF]/50/20">
                            <Mail className="w-5 h-5 text-[#6F00FF]/50" />
                        </div>
                        <span className="font-semibold text-foreground">Email</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        suporte@otsempay.com
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Resposta em até 24h
                    </p>
                </a>

                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Phone className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="font-semibold text-foreground">Telefone</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        (11) 3000-0000
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Seg-Sex: 9h às 18h
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-[#6F00FF]/50" />
                    <h2 className="text-lg font-semibold text-foreground">Tutoriais Rápidos</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tutorials.map((tutorial, index) => (
                        <button
                            key={index}
                            onClick={() => toast.info("Tutorial em desenvolvimento")}
                            className="bg-card border border-border rounded-xl p-4 text-left hover:border-[#6F00FF]/50/50 hover:bg-accent/50 transition group"
                        >
                            <div className="text-3xl mb-3">{tutorial.icon}</div>
                            <h3 className="font-medium text-foreground mb-1">{tutorial.title}</h3>
                            <p className="text-xs text-muted-foreground">{tutorial.description}</p>
                            <div className="flex items-center gap-1 text-[#6F00FF]/50 text-xs mt-3 opacity-0 group-hover:opacity-100 transition">
                                Ver tutorial
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-[#6F00FF]/50" />
                    <h2 className="text-lg font-semibold text-foreground">Perguntas Frequentes</h2>
                </div>
                <FAQAccordion items={faqItems} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-[#6F00FF]/50" />
                    <h2 className="text-lg font-semibold text-foreground">Abrir Chamado</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    Não encontrou o que procurava? Envie sua dúvida ou reporte um problema.
                </p>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Assunto</Label>
                            <Input
                                id="subject"
                                value={ticketSubject}
                                onChange={(e) => setTicketSubject(e.target.value)}
                                placeholder="Ex: Problema com depósito"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select value={ticketCategory} onValueChange={setTicketCategory}>
                                <SelectTrigger className="bg-background">
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
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea
                            id="message"
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível..."
                            rows={5}
                            className="bg-background resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] gap-2"
                        >
                            {submitting ? (
                                "Enviando..."
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
        </div>
    );
}
