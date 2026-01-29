import type { NextConfig } from 'next';
import path from 'node:path';
import fs from 'node:fs';

// Force load .env for configurations that run before Next.js loads envs
if (fs.existsSync('.env')) {
  try {
    // @ts-ignore - process.loadEnvFile is available in Node 20.6.0+
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile('.env');
    }
  } catch (e) {
    console.warn('[next.config.js] Failed to load .env file:', e);
  }
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
        ""
      ).trim().replace(/\/+$/, "");

      if (!base) {
        console.warn(
          "[next.config.js] API base ausente — rewrites desativados."
        );
        return [];
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
