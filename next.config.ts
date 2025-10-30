/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/:path*`,
      },
      {
        source: "/pix/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/pix/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
