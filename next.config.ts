/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "");
    if (!base) {
      console.warn(
        "[next.config.js] NEXT_PUBLIC_API_BASE_URL ausente — rewrites desativados. " +
        "Defina a env no Vercel (Production/Preview) para habilitar o proxy /auth e /pix."
      );
      return []; // evita "destination undefined"
    }
    return [
      { source: "/auth/:path*", destination: `${base}/auth/:path*` },
      { source: "/pix/:path*", destination: `${base}/pix/:path*` },
    ];
  },
};

module.exports = nextConfig;
