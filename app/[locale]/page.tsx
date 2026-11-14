import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildAlternates } from '@/lib/seo'
import { DEFAULT_HOMEPAGE } from '@/lib/flags/homepage-config'
import { Homepage } from '@/components/features/home/homepage'

// Served from the edge cache and rebuilt in the background every 10 minutes
export const revalidate = 600

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return { alternates: buildAlternates(locale, '') }
}

// The middleware normally rewrites /[locale] to /[locale]/home/[variant]
// (see lib/flags/homepage.ts); this is only reached if it doesn't.
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return <Homepage locale={locale} variant={DEFAULT_HOMEPAGE} />
}
