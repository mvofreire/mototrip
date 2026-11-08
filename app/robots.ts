import type { MetadataRoute } from 'next'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mototrip.pt').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/*/profile', '/*/auth/', '/*/submit'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
