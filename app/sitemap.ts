import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { locales } from '@/i18n'
import { supabase } from '@/lib/supabase/client'

const BASE_URL = getSiteUrl()

const STATIC_PAGES = ['', '/explore', '/riders', '/community', '/about', '/guidelines', '/blog', '/terms', '/privacy']

// Rebuild hourly so new routes show up
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      changeFrequency: path === '' || path === '/explore' ? 'daily' : 'monthly',
      priority: path === '' ? 1 : path === '/explore' ? 0.9 : 0.5,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}${path}`])),
      },
    })),
  )

  const { data } = await supabase
    .from('routes')
    .select('id, updated_at')
    .eq('published', true)

  const routes: MetadataRoute.Sitemap = ((data ?? []) as { id: string; updated_at: string | null }[]).flatMap(
    (route) =>
      locales.map((locale) => ({
        url: `${BASE_URL}/${locale}/routes/${route.id}`,
        lastModified: route.updated_at ? new Date(route.updated_at) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/routes/${route.id}`]),
          ),
        },
      })),
  )

  return [...pages, ...routes]
}
