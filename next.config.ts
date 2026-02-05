import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';
import fs from 'node:fs';

// Manual env loading for next.config.ts
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const nextConfig: NextConfig = {
    output: 'standalone',
    allowedDevOrigins: [
      '*.replit.dev',
      '*.replit.app',
      '*.riker.replit.dev',
      '*.picard.replit.dev',
    ],
    async rewrites() {
      const base = (
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://api.otsembank.com"
      ).trim().replace(/\/+$/, "");

      if (!base || base === "https://api.otsembank.com") {
        console.log("[next.config.js] Usando base API default: " + base);
      }

    return [
      // Catch-all: httpClient uses /api prefix to avoid conflicts with page routes
      { source: "/api/:path*", destination: `${base}/:path*` },
      // Direct path rewrites (for fetch calls and backward compatibility)
      { source: "/auth/:path*", destination: `${base}/auth/:path*` },
      { source: "/pix/:path*", destination: `${base}/pix/:path*` },
      { source: "/pix-keys/:path*", destination: `${base}/pix-keys/:path*` },
      { source: "/accounts/:path*", destination: `${base}/accounts/:path*` },
      { source: "/customers/:path*", destination: `${base}/customers/:path*` },
      { source: "/wallet/:path*", destination: `${base}/wallet/:path*` },
      { source: "/fdbank/:path*", destination: `${base}/fdbank/:path*` },
      { source: "/inter/:path*", destination: `${base}/inter/:path*` },
      { source: "/transactions/:path*", destination: `${base}/transactions/:path*` },
      { source: "/transfers/:path*", destination: `${base}/transfers/:path*` },
      { source: "/payments/:path*", destination: `${base}/payments/:path*` },
      { source: "/public/:path*", destination: `${base}/public/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
