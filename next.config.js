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
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Loaded by Node at runtime: it optionally imports the flag definitions
    // that Vercel embeds at build time, which webpack can't resolve.
    serverComponentsExternalPackages: ['@vercel/flags-core'],
  },
}

const withNextIntl = require('next-intl/plugin')('./i18n.ts')

module.exports = withNextIntl(nextConfig)
