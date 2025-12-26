"use client";

import * as React from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import http from "@/lib/http";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    userEmail: string;
};

const emailTemplates = [
    { id: "custom", label: "Mensagem personalizada" },
    { id: "kyc_reminder", label: "Lembrete de verificação KYC" },
    { id: "account_blocked", label: "Conta bloqueada" },
    { id: "account_unblocked", label: "Conta desbloqueada" },
    { id: "welcome", label: "Boas-vindas" },
];

export function SendEmailModal({ open, onOpenChange, userId, userName, userEmail }: Props) {
    const [loading, setLoading] = React.useState(false);
    const [template, setTemplate] = React.useState("custom");
    const [subject, setSubject] = React.useState("");
    const [message, setMessage] = React.useState("");

    React.useEffect(() => {
        if (open) {
            setTemplate("custom");
            setSubject("");
            setMessage("");
        }
    }, [open]);

    React.useEffect(() => {
        switch (template) {
            case "kyc_reminder":
                setSubject("Complete sua verificação de identidade");
                setMessage(`Olá ${userName || ""},\n\nNotamos que você ainda não completou sua verificação de identidade (KYC). Para ter acesso a todas as funcionalidades da sua conta, por favor finalize o processo de verificação.\n\nAcesse sua conta e vá até a seção de verificação para enviar seus documentos.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe OtsemPay`);
                break;
            case "account_blocked":
                setSubject("Sua conta foi temporariamente bloqueada");
                setMessage(`Olá ${userName || ""},\n\nInformamos que sua conta foi temporariamente bloqueada por motivos de segurança.\n\nPara mais informações ou para solicitar o desbloqueio, entre em contato com nosso suporte.\n\nAtenciosamente,\nEquipe OtsemPay`);
                break;
            case "account_unblocked":
                setSubject("Sua conta foi desbloqueada");
                setMessage(`Olá ${userName || ""},\n\nInformamos que sua conta foi desbloqueada e você já pode acessar normalmente todos os serviços.\n\nObrigado pela compreensão.\n\nAtenciosamente,\nEquipe OtsemPay`);
                break;
            case "welcome":
                setSubject("Bem-vindo ao OtsemPay!");
                setMessage(`Olá ${userName || ""},\n\nSeja bem-vindo ao OtsemPay! Estamos muito felizes em tê-lo conosco.\n\nPara começar a usar todos os recursos da plataforma, complete sua verificação de identidade e adicione saldo à sua conta.\n\nQualquer dúvida, nossa equipe de suporte está à disposição.\n\nAtenciosamente,\nEquipe OtsemPay`);
                break;
            default:
                break;
        }
    }, [template, userName]);

    const handleSend = async () => {
        if (!subject.trim()) {
            toast.error("Informe o assunto do email");
            return;
        }
        if (!message.trim()) {
            toast.error("Informe a mensagem do email");
            return;
        }

        try {
            setLoading(true);
            await http.post(`/admin/users/${userId}/send-email`, {
                subject: subject.trim(),
                message: message.trim(),
                template: template !== "custom" ? template : undefined,
            });
            toast.success("Email enviado com sucesso");
            onOpenChange(false);
        } catch (err: unknown) {
            const errorMsg = isAxiosError(err)
                ? err.response?.data?.message
                : "Falha ao enviar email";
            toast.error(errorMsg || "Falha ao enviar email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Enviar Email
                    </DialogTitle>
                    <DialogDescription>
                        Enviar email para <strong>{userEmail}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="template">Template</Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um template" />
                            </SelectTrigger>
                            <SelectContent>
                                {emailTemplates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                            id="subject"
                            placeholder="Assunto do email"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea
                            id="message"
                            placeholder="Digite sua mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSend} disabled={loading} className="gap-2">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Enviar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
