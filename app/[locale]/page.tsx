import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildAlternates } from '@/lib/seo'
import { RoadHome } from '@/components/features/home/road-home'

// Static per locale, served from the edge cache and rebuilt in the background every 10 minutes
export const revalidate = 600

export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return { alternates: buildAlternates(locale, '') }
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return <RoadHome locale={locale} />
}
