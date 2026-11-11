import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { locales } from '@/i18n'
import { getPublishedPost, getPublishedPosts, pickTranslation, routesBySlug } from '@/lib/blog/posts'
import { BlogMarkdown, routeSlugsIn } from '@/lib/blog/markdown'
import { getSiteUrl } from '@/lib/site-url'
import { SharePostPanel } from '@/components/features/blog/share-post-panel'

export const revalidate = 3600

type Props = { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  const posts = await getPublishedPosts().catch(() => [])
  return locales.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost(params.slug).catch(() => null)
  const c = post && pickTranslation(post, params.locale)
  if (!post || !c) return {}
  const cover = post.cover?.thumbnail_url
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
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: cover ? [{ url: cover, alt: c.title }] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  setRequestLocale(params.locale)

  const post = await getPublishedPost(params.slug).catch(() => null)
  const c = post && pickTranslation(post, params.locale)
  if (!post || !c) notFound()
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const slugs = routeSlugsIn(c.body_md)
  const routes = await routesBySlug(slugs)
  const cover = post.cover?.thumbnail_url
  const date = post.published_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(post.published_at))
    : null
  const language = new Intl.DisplayNames([locale], { type: 'language' }).of(c.locale) ?? c.locale

  const base = getSiteUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: c.title,
    description: c.description,
    inLanguage: c.locale,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: cover ? [cover] : undefined,
    url: `${base}/${locale}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'MotoTrip', url: base },
    publisher: { '@type': 'Organization', name: 'MotoTrip', logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` } },
    mentions: slugs
      .map((s) => routes.get(s))
      .filter((r) => !!r)
      .map((r) => ({ '@type': 'TouristTrip', name: r!.title, url: `${base}/${locale}/routes/${r!.slug}` })),
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
          {date && <p className="text-xs uppercase tracking-wider text-muted-foreground">{date}</p>}
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{c.title}</h1>
          <p className="text-lg text-muted-foreground">{c.description}</p>
          {c.locale !== locale && <p className="text-sm text-muted-foreground">{t('availableIn', { language })}</p>}
        </header>

        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mb-10 w-full rounded-lg border object-cover" />
        )}

        <BlogMarkdown markdown={c.body_md} locale={locale} routes={routes} />

        <SharePostPanel post={{ slug: post.slug, title: c.title }} />
      </div>
    </article>
  )
}
