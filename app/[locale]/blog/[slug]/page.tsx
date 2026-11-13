import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft } from 'lucide-react'
import { locales } from '@/i18n'
import { languageAlternates } from '@/lib/seo'
import { coverOf, getPublishedPost, getPublishedPosts, pickTranslation, routesBySlug } from '@/lib/blog/posts'
import { BlogMarkdown, routeSlugsIn } from '@/lib/blog/markdown'
import { getSiteUrl } from '@/lib/site-url'
import { SharePostPanel } from '@/components/features/blog/share-post-panel'
import { PostNextSteps } from '@/components/features/blog/post-next-steps'

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
  const cover = coverOf(post)
  return {
    title: c.title,
    description: c.description,
    alternates: {
      // A fallback translation points at the language it is written in
      canonical: `/${c.locale}/blog/${post.slug}`,
      languages: languageAlternates(
        (l) => `/${l}/blog/${post.slug}`,
        locales.filter((l) => post.translations.some((t) => t.locale === l)),
      ),
    },
    openGraph: {
      type: 'article',
      title: c.title,
      description: c.description,
      url: `/${c.locale}/blog/${post.slug}`,
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
  const [routes, allPosts] = await Promise.all([routesBySlug(slugs), getPublishedPosts().catch(() => [])])
  // Other guides: ones written in this language first, then the newest
  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, i, own: p.translations.some((tr) => tr.locale === locale) }))
    .sort((a, b) => Number(b.own) - Number(a.own) || a.i - b.i)
    .slice(0, 3)
    .map(({ p }) => p)
  const cover = coverOf(post)
  const date = post.published_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(post.published_at))
    : null
  const language = new Intl.DisplayNames([locale], { type: 'language' }).of(c.locale) ?? c.locale

  const base = getSiteUrl()
  const postUrl = `${base}/${c.locale}/blog/${post.slug}`
  const posting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: c.title,
    description: c.description,
    inLanguage: c.locale,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: cover ? [cover] : undefined,
    url: postUrl,
    author: { '@type': 'Organization', name: 'MotoTrip', url: base },
    publisher: { '@type': 'Organization', name: 'MotoTrip', logo: { '@type': 'ImageObject', url: `${base}/icon-512.png` } },
    mentions: slugs
      .map((s) => routes.get(s))
      .filter((r) => !!r)
      .map((r) => ({ '@type': 'TouristTrip', name: r!.title, url: `${base}/${locale}/routes/${r!.slug}` })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MotoTrip', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: c.title, item: postUrl },
    ],
  }
  const jsonLd = [posting, breadcrumb]

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
          <figure className="mb-10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
              <Image
                src={cover}
                alt={post.cover_image_url ? c.title : ''}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            {post.cover_image_url && post.cover_image_credit && (
              <figcaption className="mt-2 text-right text-xs text-muted-foreground">{post.cover_image_credit}</figcaption>
            )}
          </figure>
        )}

        <BlogMarkdown markdown={c.body_md} locale={locale} routes={routes} postSlug={post.slug} />

        <SharePostPanel post={{ slug: post.slug, title: c.title }} />

        <PostNextSteps
          locale={locale}
          postSlug={post.slug}
          routes={slugs.map((s) => routes.get(s)).filter((r): r is NonNullable<typeof r> => !!r)}
          related={related}
        />
      </div>
    </article>
  )
}
