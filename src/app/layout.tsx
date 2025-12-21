import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
    title: "OtsemPay • BRL ↔ USDT",
    description: "Pagamentos e conversão BRL ↔ USDT com transparência.",
    icons: {
        icon: "/favicon-32.png",
        apple: "/logo-otsempay.png",
    },
};

import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                        <Analytics />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
