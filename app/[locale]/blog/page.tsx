import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { locales } from '@/i18n'
import { POSTS, blogLocale } from '@/lib/blog/posts'
import { RoutesService } from '@/lib/services/routes.service'
import type { RouteWithDetails } from '@/types'

export const revalidate = 3600

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/blog`])),
    },
  }
}

export default async function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'blog' })
  const lang = blogLocale(locale)
  // Cover image = map of the post's main route
  const routes = ((await RoutesService.getRoutes().catch(() => [])) as RouteWithDetails[]) ?? []
  const cover = (slug: string) => routes.find((r) => r.slug === slug)?.thumbnail_url
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(iso))

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post, i) => {
            const c = post.content[lang]
            const img = cover(post.coverRoute)
            return (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className={`group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className={`w-full object-cover ${i === 0 ? 'aspect-[21/9]' : 'aspect-[16/9]'}`} loading="lazy" />
                )}
                <div className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{date(post.date)}</p>
                  <h2 className={`font-bold leading-tight group-hover:text-primary ${i === 0 ? 'text-3xl' : 'text-2xl'}`}>{c.title}</h2>
                  <p className="text-muted-foreground">{c.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t('readMore')} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
