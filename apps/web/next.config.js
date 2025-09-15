/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  transpilePackages: [
    '@consulting-platform/database',
    '@consulting-platform/api',
    '@consulting-platform/ui'
  ],
  images: {
    domains: ['uploadthing.com', 'images.clerk.dev'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
