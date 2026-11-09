import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { locales } from '@/i18n'
import { POSTS, blogLocale, getPost, postRouteSlugs } from '@/lib/blog/posts'
import { RoutesService } from '@/lib/services/routes.service'
import { getSiteUrl } from '@/lib/site-url'
import { RouteCard } from '@/components/features/routes/route-card'
import type { RouteWithDetails } from '@/types'

export const revalidate = 3600

type Props = { params: { locale: string; slug: string } }

export function generateStaticParams() {
  return locales.flatMap((locale) => POSTS.map((p) => ({ locale, slug: p.slug })))
}

async function routesBySlug() {
  const routes = ((await RoutesService.getRoutes().catch(() => [])) as RouteWithDetails[]) ?? []
  return new Map(routes.map((r) => [r.slug, r]))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug)
  if (!post) return {}
  const c = post.content[blogLocale(params.locale)]
  const cover = (await routesBySlug()).get(post.coverRoute)?.thumbnail_url
  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: `/${params.locale}/blog/${post.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/blog/${post.slug}`])),
    },
    openGraph: {
      type: 'article',
      title: c.title,
      description: c.description,
      url: `/${params.locale}/blog/${post.slug}`,
      publishedTime: post.date,
      images: cover ? [{ url: cover, alt: c.title }] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug)
  if (!post) notFound()
  const { locale } = params
  const lang = blogLocale(locale)
  const c = post.content[lang]
  const t = await getTranslations({ locale, namespace: 'blog' })
  const routes = await routesBySlug()
  const cover = routes.get(post.coverRoute)?.thumbnail_url
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(post.date))

  const base = getSiteUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: c.title,
    description: c.description,
    inLanguage: lang,
    datePublished: post.date,
    image: cover ? [cover] : undefined,
    url: `${base}/${locale}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'MotoTrip', url: base },
    publisher: { '@type': 'Organization', name: 'MotoTrip', logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` } },
    mentions: postRouteSlugs(post, lang)
      .map((s) => routes.get(s))
      .filter((r): r is RouteWithDetails => !!r)
      .map((r) => ({ '@type': 'TouristTrip', name: r.title, url: `${base}/${locale}/routes/${r.slug}` })),
  }

  return (
    <article className="container py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-3xl">
        <Link href={`/${locale}/blog`} className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('back')}
        </Link>

        <header className="mb-8 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{date}</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{c.title}</h1>
          <p className="text-lg text-muted-foreground">{c.description}</p>
          {lang !== locale && <p className="text-sm text-muted-foreground">{t('englishOnly')}</p>}
        </header>

        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mb-10 w-full rounded-lg border object-cover" />
        )}

        <div className="space-y-6 text-[1.05rem] leading-relaxed">
          {c.blocks.map((b, i) => {
            if ('h2' in b) return <h2 key={i} className="pt-4 text-2xl font-bold md:text-3xl">{b.h2}</h2>
            if ('p' in b) return <p key={i}>{b.p}</p>
            if ('list' in b)
              return (
                <ul key={i} className="list-disc space-y-2 pl-6">
                  {b.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )
            if ('tip' in b)
              return (
                <div key={i} className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                  <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p>{b.tip}</p>
                </div>
              )
            const route = routes.get(b.route)
            return route ? (
              <div key={i} className="mx-auto max-w-md">
                <RouteCard route={route} locale={locale} />
              </div>
            ) : null
          })}
        </div>
      </div>
    </article>
  )
}
