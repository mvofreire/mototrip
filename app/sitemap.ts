import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { locales } from '@/i18n'
import { supabase } from '@/lib/supabase/client'
import { REGIONS } from '@/lib/regions'
import { routePath } from '@/lib/route-url'
import { languageAlternates } from '@/lib/seo'

const BASE_URL = getSiteUrl()

const STATIC_PAGES = ['', '/explore', '/regions', ...REGIONS.map((r) => `/regions/${r.slug}`), '/riders', '/about', '/contact', '/guidelines', '/blog', '/terms', '/privacy']

// Rebuild hourly so new routes show up
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      changeFrequency: path === '' || path === '/explore' ? 'daily' : path.startsWith('/regions') ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : path === '/explore' ? 0.9 : path.startsWith('/regions') ? 0.8 : 0.5,
      alternates: {
        languages: languageAlternates((l) => `${BASE_URL}/${l}${path}`),
      },
    })),
  )

  const { data } = await supabase
    .from('routes')
    .select('id, slug, updated_at')
    .eq('published', true)

  const routes: MetadataRoute.Sitemap = ((data ?? []) as { id: string; slug: string | null; updated_at: string | null }[]).flatMap(
    (route) =>
      locales.map((locale) => ({
        url: `${BASE_URL}${routePath(locale, route)}`,
        lastModified: route.updated_at ? new Date(route.updated_at) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: languageAlternates((l) => `${BASE_URL}${routePath(l, route)}`),
        },
      })),
  )

  const { data: postRows } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, translations:blog_post_translations(locale)')
    .eq('status', 'published')

  // Only the languages a post is written in: other locales show a fallback
  // translation, which would be duplicate content
  const posts: MetadataRoute.Sitemap = (
    (postRows ?? []) as unknown as { slug: string; updated_at: string; translations: { locale: string }[] }[]
  ).flatMap((post) => {
    const written = locales.filter((l) => post.translations.some((t) => t.locale === l))
    return written.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: languageAlternates((l) => `${BASE_URL}/${l}/blog/${post.slug}`, written),
      },
    }))
  })

  return [...pages, ...routes, ...posts]
}
