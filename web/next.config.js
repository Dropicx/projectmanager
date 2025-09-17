/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Railway domain
  images: {
    domains: ["web-production-871ac.up.railway.app"],
  },
  // Configure for production
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
