import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#6F00FF",
};
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
    title: "OtsemPay • BRL ↔ USDT",
    description: "Pagamentos e conversão BRL ↔ USDT com transparência.",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon-32.png",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        title: "Otsem Pay",
        statusBarStyle: "black-translucent",
    },
};

// TODO: Re-enable ConnectionStatus with a dedicated /health endpoint instead of /auth/me
// import { ConnectionStatus } from "@/components/connection-status";
// import { validateEnv } from "@/lib/env";
import { CookieConsent } from "@/components/CookieConsent";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        {/* TODO: Re-enable ConnectionStatus after creating a /health endpoint */}
        {/* <ConnectionStatus /> */}
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="8dca9fc2-17fe-42a1-b323-5e4a298d9904"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />

        <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
            <CookieConsent />
        </ThemeProvider>
        </NextIntlClientProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}