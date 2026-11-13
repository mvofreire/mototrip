import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, BookOpen } from 'lucide-react'
import { coverOf, getPublishedPosts, pickTranslation } from '@/lib/blog/posts'

export const revalidate = 3600

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: buildAlternates(locale, '/blog'),
  }
}

export default async function BlogPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'blog' })
  // Newest first; the cover is an uploaded image or the map of the post's main route
  const posts = await getPublishedPosts().catch(() => [])
  const date = (iso: string | null) => (iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(iso)) : '')

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post, i) => {
            const c = pickTranslation(post, locale)
            if (!c) return null
            const img = coverOf(post)
            return (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className={`group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className={`relative overflow-hidden bg-muted ${i === 0 ? 'aspect-[21/9]' : 'aspect-[16/9]'}`}>
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes={i === 0 ? '(max-width: 1024px) 100vw, 1024px' : '(max-width: 768px) 100vw, 512px'}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-brand">
                      <BookOpen className="h-12 w-12 text-white/80" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{date(post.published_at)}</p>
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
