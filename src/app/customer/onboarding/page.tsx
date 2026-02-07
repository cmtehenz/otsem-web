"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import http from "@/lib/http";
import type { CustomerResponse } from "@/types/customer";

import { PersonalDataStep } from "./steps/personal-data-step";
import { CpfVerificationStep } from "./steps/cpf-verification-step";
import { SuccessStep } from "./steps/success-step";

type Step = "personal" | "cpf" | "success";

const STEP_ORDER: Step[] = ["personal", "cpf", "success"];

function ProgressBar({ currentStep }: { currentStep: Step }) {
    const idx = STEP_ORDER.indexOf(currentStep);
    const total = STEP_ORDER.length;

    return (
        <div className="flex items-center gap-2 w-full max-w-xs mx-auto">
            {STEP_ORDER.map((step, i) => (
                <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= idx
                            ? "bg-[#3871F1]"
                            : "bg-muted"
                    }`}
                />
            ))}
            <span className="text-xs text-white ml-2 whitespace-nowrap">
                {idx + 1}/{total}
            </span>
        </div>
    );
}

function determineStep(customer: CustomerResponse): Step {
    if (customer.onboardingCompleted) return "success";
    if (!customer.birthday || !customer.address) return "personal";
    if (customer.cpfVerificationStatus !== "verified") return "cpf";
    return "success";
}

export default function OnboardingPage() {
    const router = useRouter();
    const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
    const [currentStep, setCurrentStep] = React.useState<Step>("personal");
    const [loading, setLoading] = React.useState(true);

    const fetchCustomer = React.useCallback(async () => {
        try {
            const res = await http.get<{ data: CustomerResponse } | CustomerResponse>("/customers/me");
            const data = "data" in res.data && (res.data as { data?: CustomerResponse }).data
                ? (res.data as { data: CustomerResponse }).data
                : res.data as CustomerResponse;
            setCustomer(data);
            return data;
        } catch (err) {
            console.error("Erro ao buscar dados do cliente:", err);
            return null;
        }
    }, []);

    React.useEffect(() => {
        async function init() {
            const data = await fetchCustomer();
            if (data) {
                const step = determineStep(data);
                if (step === "success" && data.onboardingCompleted) {
                    router.replace("/customer/dashboard");
                    return;
                }
                setCurrentStep(step);
            }
            setLoading(false);
        }
        init();
    }, [fetchCustomer, router]);

    async function handleStepComplete() {
        const data = await fetchCustomer();
        if (!data) return;

        const nextStep = determineStep(data);
        if (nextStep === "success" && data.onboardingCompleted) {
            setCurrentStep("success");
        } else {
            setCurrentStep(nextStep);
        }
    }

    function goToNext() {
        const idx = STEP_ORDER.indexOf(currentStep);
        if (idx < STEP_ORDER.length - 1) {
            setCurrentStep(STEP_ORDER[idx + 1]);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="flex items-center justify-center border-b border-border/50 px-4 py-4">
                <Image
                    src="/images/logo-64.png"
                    alt="OtsemPay"
                    width={36}
                    height={36}
                    className="rounded-lg"
                />
                <span className="ml-3 text-lg font-bold">
                    <span className="text-amber-500 dark:text-amber-400">Otsem</span>
                    <span className="text-[#3871F1]">Pay</span>
                </span>
            </header>

            <div className="flex-1 flex flex-col items-center px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <ProgressBar currentStep={currentStep} />
                    </div>

                    {currentStep === "personal" && (
                        <PersonalDataStep
                            customer={customer}
                            onComplete={handleStepComplete}
                        />
                    )}
                    {currentStep === "cpf" && (
                        <CpfVerificationStep
                            customer={customer}
                            onComplete={handleStepComplete}
                            onSkip={goToNext}
                        />
                    )}
                    {currentStep === "success" && (
                        <SuccessStep />
                    )}
                </div>
            </div>
        </div>
    );
}
