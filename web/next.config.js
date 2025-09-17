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
    // Disable image optimization in production to avoid cache write errors
    unoptimized: process.env.NODE_ENV === "production",
  },
  // Configure for production
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Disable file system cache in production
  cacheMaxMemorySize: 0,
};

module.exports = nextConfig;
