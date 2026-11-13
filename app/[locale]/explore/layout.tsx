import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildAlternates } from '@/lib/seo'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'explore' })
  return {
    title: t('title'),
    description: t('subtitle'),
    // Filtered views (?category=…) all point back to the plain listing
    alternates: buildAlternates(locale, '/explore'),
  }
}

// The page reads the filters from the URL (useSearchParams), so it needs a
// Suspense boundary for the rest of the site to be rendered statically.
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen" />}>{children}</Suspense>
}
