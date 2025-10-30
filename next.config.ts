/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base =
      (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "")
        .trim()
        .replace(/\/+$/, "");

    if (!base) {
      console.warn(
        "[next.config.js] API base ausente — rewrites desativados. " +
        "Defina NEXT_PUBLIC_API_URL (ou NEXT_PUBLIC_API_BASE_URL) no Vercel."
      );
      return [];
    }

    return [
      { source: "/auth/:path*", destination: `${base}/auth/:path*` },
      { source: "/pix/:path*", destination: `${base}/pix/:path*` },
    ];
  },
};
module.exports = nextConfig;
