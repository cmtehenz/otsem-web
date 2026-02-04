import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: [
        { color: "#6F00FF", media: "(prefers-color-scheme: light)" },
        { color: "#0a0118", media: "(prefers-color-scheme: dark)" },
    ],
};
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
    title: "Otsem Pay | BRL ↔ USDT",
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
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { SplashDismiss } from "@/components/SplashDismiss";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* iOS splash screens */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640x1136.png"  media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750x1334.png"  media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-828x1792.png"  media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1080x2340.png" media="(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body className="antialiased">
        {/* Inline splash overlay — visible before React hydrates, removed on mount */}
        <div
          id="splash-screen"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "url('/images/customer-bg.png') center top / cover no-repeat",
            backgroundColor: "#050010",
            transition: "opacity 0.4s ease-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt=""
            width={80}
            height={80}
            style={{ borderRadius: 20 }}
          />
        </div>
        {/* TODO: Re-enable ConnectionStatus after creating a /health endpoint */}
        {/* <ConnectionStatus /> */}
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
        <ServiceWorkerRegistrar />
        <SplashDismiss />
      </body>
    </html>
  );
}