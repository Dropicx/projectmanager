/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow external images from any domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Configure for production
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
