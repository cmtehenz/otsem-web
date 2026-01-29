import type { NextConfig } from 'next';
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

const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
    allowedDevOrigins: [
      '*.replit.dev',
      '*.replit.app', 
      '*.riker.replit.dev',
      '*.picard.replit.dev',
      '*.orchids.cloud',
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
      { source: "/auth/:path*", destination: `${base}/auth/:path*` },
      { source: "/pix/:path*", destination: `${base}/pix/:path*` },
      { source: "/accounts/:path*", destination: `${base}/accounts/:path*` },
      { source: "/customers/:path*", destination: `${base}/customers/:path*` },
      { source: "/wallet/:path*", destination: `${base}/wallet/:path*` },
      { source: "/fdbank/:path*", destination: `${base}/fdbank/:path*` },
      { source: "/inter/:path*", destination: `${base}/inter/:path*` },
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
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
};

export default nextConfig;
// Orchids restart: 1769569860119
