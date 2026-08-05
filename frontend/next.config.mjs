/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api/:path*`
          : 'https://whatsapp-automation-production-9851.up.railway.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
