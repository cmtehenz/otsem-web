export default function Page() {
    return (
        <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-background dark:to-background">
            <div className="mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}

import RegisterForm from "@/components/auth/RegisterForm";
