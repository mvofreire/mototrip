import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n'
import { buildAlternates } from '@/lib/seo'
import { HOMEPAGE_VARIANTS, isHomepageVariant } from '@/lib/flags/homepage-config'
import { Homepage } from '@/components/features/home/homepage'

// One static page per locale and layout, rebuilt in the background every 10 minutes.
// Visitors never see this URL: the middleware rewrites /[locale] here.
export const revalidate = 600
export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((locale) => HOMEPAGE_VARIANTS.map((variant) => ({ locale, variant })))
}

type Props = { params: { locale: string; variant: string } }

// Same canonical and hreflang as the homepage, whichever layout is shown
export function generateMetadata({ params: { locale } }: Props): Metadata {
  return { alternates: buildAlternates(locale, '') }
}

export default function HomeVariantPage({ params: { locale, variant } }: Props) {
  if (!isHomepageVariant(variant)) notFound()
  setRequestLocale(locale)
  return <Homepage locale={locale} variant={variant} />
}
