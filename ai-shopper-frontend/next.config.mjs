/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dummyjson.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
      },
    ],
  },

  // Proxy /api/* → backend so frontend can call /api/ai/classify etc. without CORS issues
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
