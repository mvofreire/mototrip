/**
 * Route content is written in Portuguese; translations live in
 * routes.translations / route_stops.translations keyed by locale.
 * These helpers return the text for the page's locale, falling back to the
 * original when there is no translation.
 */

export const SOURCE_LOCALE = 'pt'

type Translations = Record<string, Record<string, string | null | undefined> | undefined> | null | undefined

function pick(translations: Translations, locale: string, field: string): string | undefined {
  if (locale === SOURCE_LOCALE) return undefined
  const value = translations?.[locale]?.[field]
  return typeof value === 'string' && value.trim() ? value : undefined
}

type LocalizableStop = { name: string; description: string | null; translations?: unknown }
type LocalizableRoute = {
  title: string
  description: string | null
  translations?: unknown
  stops?: LocalizableStop[] | null
}

export function localizeStop<S extends LocalizableStop>(stop: S, locale: string): S {
  const tr = stop.translations as Translations
  return {
    ...stop,
    name: pick(tr, locale, 'name') ?? stop.name,
    description: pick(tr, locale, 'description') ?? stop.description,
  }
}

export function localizeRoute<R extends LocalizableRoute>(route: R, locale: string): R {
  const tr = route.translations as Translations
  return {
    ...route,
    title: pick(tr, locale, 'title') ?? route.title,
    description: pick(tr, locale, 'description') ?? route.description,
    stops: route.stops ? route.stops.map((s) => localizeStop(s, locale)) : route.stops,
  }
}

type LocalizableCuratorReview = {
  verdict: string
  highlights: string[]
  warnings: string[]
  best_season: string | null
  translations?: unknown
}

/** MotoTrip curator review in the page's locale (Portuguese as fallback) */
export function localizeCuratorReview<C extends LocalizableCuratorReview>(review: C, locale: string): C {
  if (locale === SOURCE_LOCALE) return review
  const tr = (review.translations as Record<string, Partial<LocalizableCuratorReview> | undefined> | null)?.[locale]
  if (!tr?.verdict?.trim()) return review
  const list = (value: unknown, fallback: string[]) =>
    Array.isArray(value) && value.length === fallback.length ? (value as string[]) : fallback
  return {
    ...review,
    verdict: tr.verdict,
    highlights: list(tr.highlights, review.highlights),
    warnings: list(tr.warnings, review.warnings),
    best_season: (typeof tr.best_season === 'string' && tr.best_season.trim()) || review.best_season,
  }
}
