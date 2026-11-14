/**
 * Homepage A/B test settings, safe to import anywhere (no Flags client here:
 * see ./homepage.ts for the evaluation).
 *
 * Vercel Flags key. Which homepage visitors see is decided in the Vercel
 * dashboard (Flags → homepage-variant): serve one value to everyone, or split
 * traffic by `visitor.id` to A/B test the layouts.
 */
export const HOMEPAGE_FLAG = 'homepage-variant'

/**
 * - `classic`: the original homepage (control group)
 * - `road`: cinematic layout (prototype A)
 */
export const HOMEPAGE_VARIANTS = ['classic', 'road'] as const
export type HomepageVariant = (typeof HOMEPAGE_VARIANTS)[number]

/** Served when the flag can't answer (no credentials locally, outage, quota) and to bots */
export const DEFAULT_HOMEPAGE: HomepageVariant = 'road'

/** Anonymous id the split is based on, so a visitor keeps seeing the same page */
export const VISITOR_COOKIE = 'mt_vid'
/** Variant this visitor was given; read by analytics events on other pages */
export const HOMEPAGE_COOKIE = 'mt_home'
/**
 * How long a visitor keeps their variant before the flag is asked again. Each
 * evaluation is a billed flag request, and this is also how long a change in
 * the dashboard takes to reach returning visitors.
 */
export const HOMEPAGE_COOKIE_MAX_AGE = 12 * 60 * 60
export const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60

export function isHomepageVariant(value: unknown): value is HomepageVariant {
  return typeof value === 'string' && (HOMEPAGE_VARIANTS as readonly string[]).includes(value)
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless/i

/** Search engines and link previews always get the default page and no cookies */
export function isBot(userAgent: string | null) {
  return !!userAgent && BOT.test(userAgent)
}
