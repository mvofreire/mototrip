import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildAlternates } from '@/lib/seo'
import { RoutesService } from '@/lib/services/routes.service'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'explore' })
  const stats = await RoutesService.getStats().catch(() => null)
  return {
    title: t('title'),
    description: t('subtitle', { count: stats?.routes ?? 0 }),
    // Filtered views (?category=…) all point back to the plain listing
    alternates: buildAlternates(locale, '/explore'),
  }
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children
}
