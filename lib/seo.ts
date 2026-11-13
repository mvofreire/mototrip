import type { Metadata } from 'next'
import { locales, defaultLocale } from '@/i18n'

/** hreflang code for each locale (the site's Portuguese is European) */
export const HREFLANG: Record<string, string> = {
  en: 'en',
  pt: 'pt-PT',
  es: 'es',
  fr: 'fr',
  de: 'de',
}

/** Open Graph locale for each site locale */
export const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  pt: 'pt_PT',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
}

/**
 * hreflang map (plus x-default) for a page. `pathFor` gives the URL path of
 * the page in a locale; `available` limits it to locales the page exists in.
 */
export function languageAlternates(
  pathFor: (locale: string) => string,
  available: readonly string[] = locales,
): Record<string, string> {
  const langs = Object.fromEntries(available.map((l) => [HREFLANG[l] ?? l, pathFor(l)]))
  const fallback = available.includes(defaultLocale) ? defaultLocale : available[0]
  if (fallback) langs['x-default'] = pathFor(fallback)
  return langs
}

/** Canonical + hreflang for a page at `/<locale><path>` (path like "/about" or "") */
export function buildAlternates(locale: string, path: string): Metadata['alternates'] {
  return {
    canonical: `/${locale}${path}`,
    languages: languageAlternates((l) => `/${l}${path}`),
  }
}

/** For pages that should never show up in search results */
export const NO_INDEX: Metadata['robots'] = { index: false, follow: true }
