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
    // Supabase serves public files with a 1h max-age (or no-cache), which
    // would make the optimizer refetch them hourly. Replaced files get a new
    // URL (route thumbnails add ?v=), so a week is safe.
    minimumCacheTTL: 60 * 60 * 24 * 7,
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
