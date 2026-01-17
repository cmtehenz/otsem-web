"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import http from "@/lib/http";
import { motion, AnimatePresence } from "framer-motion";

interface KycUpgradeModalProps {
    open: boolean;
    onClose: () => void;
    targetLevel: string;
    targetLevelName: string;
    targetLimit: string;
    requirements: string[];
    onSuccess: () => void;
}

interface UploadedFile {
    name: string;
    objectPath: string;
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
    const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
    const [uploading, setUploading] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    function handleClose() {
        if (!uploading && !submitting) {
            setStep("upload");
            setUploadedFiles([]);
            onClose();
        }
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                const res = await http.post<{ uploadURL: string; objectPath: string }>("/api/uploads/request-url", {
                    name: file.name,
                    size: file.size,
                    contentType: file.type || "application/octet-stream",
                });

                const { uploadURL, objectPath } = res.data;

                await fetch(uploadURL, {
                    method: "PUT",
                    body: file,
                    headers: {
                        "Content-Type": file.type || "application/octet-stream",
                    },
                });

                setUploadedFiles(prev => [...prev, {
                    name: file.name,
                    objectPath,
                    size: file.size,
                }]);
            }
            toast.success("Arquivo(s) enviado(s) com sucesso!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Erro ao enviar arquivo(s)");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    function removeFile(index: number) {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        if (uploadedFiles.length === 0) {
            toast.error("Envie pelo menos um documento");
            return;
        }

        setSubmitting(true);
        setStep("submitting");

        try {
            await http.post("/api/kyc-upgrade-requests", {
                targetLevel,
                documents: uploadedFiles.map(f => ({
                    name: f.name,
                    objectPath: f.objectPath,
                })),
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
            <DialogContent className="premium-card border-0 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        Solicitar Upgrade para {targetLevelName}
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
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
                                    disabled={uploading}
                                    className="w-full h-24 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-6 h-6 text-primary" />
                                            <span className="text-sm text-muted-foreground">
                                                Clique para selecionar arquivos
                                            </span>
                                        </div>
                                    )}
                                </Button>

                                {uploadedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
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
                                    disabled={uploadedFiles.length === 0 || uploading}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                                >
                                    Enviar Solicitação
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Formatos aceitos: PDF, JPG, PNG. Máximo 10MB por arquivo.
                            </p>
                        </motion.div>
                    )}

                    {step === "submitting" && (
                        <motion.div
                            key="submitting"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="py-10 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
                            <p className="text-foreground font-medium">Enviando solicitação...</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Aguarde enquanto processamos seus documentos
                            </p>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="py-10 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <p className="text-foreground font-bold text-lg">Solicitação Enviada!</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Nossa equipe analisará seus documentos e entrará em contato em até 48 horas.
                            </p>
                            <Button
                                onClick={handleClose}
                                className="mt-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                            >
                                Entendi
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
