/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'staticmap.openstreetmap.de',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

const withNextIntl = require('next-intl/plugin')('./i18n.ts')

module.exports = withNextIntl(nextConfig)
