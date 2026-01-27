"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";

interface KycUpgradeModalProps {
    open: boolean;
    onClose: () => void;
    targetLevel: string;
    targetLevelName: string;
    targetLimit: string;
    requirements: string[];
    onSuccess: () => void;
}

interface SelectedFile {
    file: File;
    name: string;
    size: number;
}

export function KycUpgradeModal({
    open,
    onClose,
    targetLevel,
    targetLevelName,
    targetLimit,
    requirements,
    onSuccess,
}: KycUpgradeModalProps) {
    const [step, setStep] = React.useState<"upload" | "submitting" | "success">("upload");
    const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
    const [submitting, setSubmitting] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    function handleClose() {
        if (!submitting) {
            setStep("upload");
            setSelectedFiles([]);
            onClose();
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files).map(file => ({
            file,
            name: file.name,
            size: file.size,
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function removeFile(index: number) {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        if (selectedFiles.length === 0) {
            toast.error("Selecione pelo menos um documento");
            return;
        }

        setSubmitting(true);
        setStep("submitting");

        try {
            const formData = new FormData();
            formData.append("targetLevel", targetLevel);
            
            selectedFiles.forEach((sf) => {
                formData.append("documents", sf.file);
            });

            await http.post("/customers/kyc-upgrade-requests", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setStep("success");
            toast.success("Solicitação enviada com sucesso!");
            onSuccess();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Erro ao enviar solicitação");
            setStep("upload");
        } finally {
            setSubmitting(false);
        }
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#1a1025] border border-white/70 dark:border-white/10 rounded-3xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Solicitar Upgrade para {targetLevelName}
                    </DialogTitle>
                </DialogHeader>

                {step === "upload" && (
                    <div className="space-y-5">
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-sm text-foreground">
                                Novo limite: <span className="font-bold text-primary">{targetLimit}/mês</span>
                            </p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-foreground mb-3">Documentos necessários:</p>
                            <ul className="space-y-2">
                                {requirements.map((req, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={submitting}
                                className="w-full h-24 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-6 h-6 text-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        Clique para selecionar arquivos
                                    </span>
                                </div>
                            </Button>

                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="p-1 hover:bg-red-500/10 rounded"
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedFiles.length === 0 || submitting}
                                className="flex-1 bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white"
                            >
                                Enviar Solicitação
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            Formatos aceitos: PDF, JPG, PNG. Máximo 10MB por arquivo.
                        </p>
                    </div>
                )}

                {step === "submitting" && (
                    <div className="py-10 text-center">
                        <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
                        <p className="text-foreground font-medium">Enviando solicitação...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Aguarde enquanto processamos seus documentos
                        </p>
                    </div>
                )}

                {step === "success" && (
                    <div className="py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-foreground font-bold text-lg">Solicitação Enviada!</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Nossa equipe analisará seus documentos e entrará em contato em até 48 horas.
                        </p>
                        <Button
                            onClick={handleClose}
                            className="mt-6 bg-gradient-to-r from-[#6F00FF] to-[#6F00FF] hover:from-[#6F00FF]/50 hover:to-[#6F00FF] text-white"
                        >
                            Entendi
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
