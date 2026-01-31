"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, LogOut } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import http from "@/lib/http";
import type { CustomerResponse } from "@/types/customer";
import { PhoneStep } from "./steps/phone-step";
import { PersonalDataStep } from "./steps/personal-data-step";
import { CpfVerificationStep } from "./steps/cpf-verification-step";
import { SuccessStep } from "./steps/success-step";
import { AnimatePresence } from "framer-motion";

type OnboardingStep = "phone" | "personal-data" | "cpf-verification" | "success";

const STEP_ORDER: OnboardingStep[] = ["phone", "personal-data", "cpf-verification", "success"];
const STEP_LABELS: Record<OnboardingStep, string> = {
    phone: "Telefone",
    "personal-data": "Dados pessoais",
    "cpf-verification": "Verificacao",
    success: "Concluido",
};

function determineInitialStep(customer: CustomerResponse): OnboardingStep {
    if (customer.onboardingCompleted) return "success";
    if (!customer.phoneVerified) return "phone";
    if (!customer.birthday || !customer.address) return "personal-data";
    return "cpf-verification";
}

export default function OnboardingPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
    const [currentStep, setCurrentStep] = React.useState<OnboardingStep>("phone");

    React.useEffect(() => {
        async function loadCustomer() {
            try {
                const res = await http.get<CustomerResponse | { data: CustomerResponse }>(
                    "/customers/me"
                );
                const raw = res.data as Record<string, unknown>;
                const data =
                    "data" in raw && raw.data
                        ? (raw.data as CustomerResponse)
                        : (raw as unknown as CustomerResponse);
                setCustomer(data);

                if (data.onboardingCompleted) {
                    router.replace("/customer/dashboard");
                    return;
                }

                setCurrentStep(determineInitialStep(data));
            } catch {
                // If customer doesn't exist yet, start from the beginning
                setCurrentStep("phone");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadCustomer();
        }
    }, [user, router]);

    function advanceToNextStep() {
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
            setCurrentStep(STEP_ORDER[currentIndex + 1]);
        }
    }

    const stepIndex = STEP_ORDER.indexOf(currentStep);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-[#6F00FF]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <Image
                        src="/images/logo.png"
                        alt="OtsemPay"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                    <span className="text-lg font-bold">
                        <span className="text-amber-500 dark:text-amber-400">Otsem</span>
                        <span className="text-[#6F00FF]">Pay</span>
                    </span>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </header>

            {/* Content */}
            <div className="flex flex-1 items-start justify-center px-4 py-8 md:py-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Step indicator */}
                    {currentStep !== "success" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-slate-900 dark:text-white">
                                    Etapa {stepIndex + 1} de {STEP_ORDER.length - 1}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">
                                    {STEP_LABELS[currentStep]}
                                </span>
                            </div>
                            <Progress
                                value={(stepIndex / (STEP_ORDER.length - 1)) * 100}
                                className="h-2"
                            />
                        </div>
                    )}

                    {/* Step content */}
                    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
                        <AnimatePresence mode="wait">
                            {currentStep === "phone" && (
                                <PhoneStep
                                    key="phone"
                                    initialPhone={customer?.phone}
                                    onComplete={advanceToNextStep}
                                />
                            )}
                            {currentStep === "personal-data" && (
                                <PersonalDataStep
                                    key="personal-data"
                                    initialBirthday={customer?.birthday}
                                    initialAddress={customer?.address}
                                    onComplete={advanceToNextStep}
                                />
                            )}
                            {currentStep === "cpf-verification" && (
                                <CpfVerificationStep
                                    key="cpf-verification"
                                    customerType={customer?.type || "PF"}
                                    initialStatus={customer?.cpfVerificationStatus || "not_started"}
                                    onComplete={advanceToNextStep}
                                />
                            )}
                            {currentStep === "success" && (
                                <SuccessStep key="success" />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
