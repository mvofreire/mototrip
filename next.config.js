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
  webpack(config, { nextRuntime }) {
    // The middleware (edge) bundles flags-core, so that optional import has to
    // resolve: use the embedded definitions when the build has them, otherwise
    // an empty module (flags-core then fetches the definitions instead).
    if (nextRuntime === 'edge') {
      let hasDefinitions = true
      try {
        require.resolve('@vercel/flags-definitions')
      } catch {
        hasDefinitions = false
      }
      if (!hasDefinitions) {
        config.resolve.alias = { ...config.resolve.alias, '@vercel/flags-definitions': false }
      }
    }
    return config
  },
}

const withNextIntl = require('next-intl/plugin')('./i18n.ts')

module.exports = withNextIntl(nextConfig)
