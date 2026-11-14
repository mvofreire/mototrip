import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n'
import {
  DEFAULT_HOMEPAGE,
  HOMEPAGE_COOKIE,
  HOMEPAGE_COOKIE_MAX_AGE,
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  evaluateHomepageVariant,
  isBot,
  isHomepageVariant,
  type HomepageVariant,
} from './lib/flags/homepage'

// Locale resolution order (next-intl): URL prefix → NEXT_LOCALE cookie
// (set by the language switcher and on every localized visit) →
// Accept-Language header → defaultLocale. Prefixed URLs are never
// redirected, so shared and indexed links keep their language; only
// entry points without a locale (`/`, `/routes/x`) are detected.
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

const HOME = new RegExp(`^/(${locales.join('|')})/?$`)

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const home = request.nextUrl.pathname.match(HOME)
  // Only the localized homepage is split; next-intl answers it with a rewrite
  if (!home || !response.headers.has('x-middleware-rewrite')) return response
  const locale = home[1]

  const { variant, visitorId, remember } = await pickHomepage(request)

  // Serve /[locale]/home/[variant] under the /[locale] URL: each variant stays
  // a statically cached page, and the address, canonical and hreflang don't change.
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}/home/${variant}`
  const headers = new Headers(request.headers)
  headers.set('X-NEXT-INTL-LOCALE', locale)
  const rewritten = NextResponse.rewrite(url, { request: { headers } })

  const link = response.headers.get('link')
  if (link) rewritten.headers.set('link', link)

  // Keep the locale cookie next-intl set
  for (const cookie of response.cookies.getAll()) rewritten.cookies.set(cookie)
  if (visitorId) {
    rewritten.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    })
  }
  if (remember) {
    rewritten.cookies.set(HOMEPAGE_COOKIE, variant, {
      maxAge: HOMEPAGE_COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    })
  }
  return rewritten
}

async function pickHomepage(request: NextRequest): Promise<{
  variant: HomepageVariant
  visitorId?: string
  remember: boolean
}> {
  // Preview any layout with ?home=road (not remembered)
  const forced = request.nextUrl.searchParams.get('home')
  if (isHomepageVariant(forced)) return { variant: forced, remember: false }

  if (isBot(request.headers.get('user-agent'))) return { variant: DEFAULT_HOMEPAGE, remember: false }

  const saved = request.cookies.get(HOMEPAGE_COOKIE)?.value
  if (isHomepageVariant(saved)) return { variant: saved, remember: false }

  const existingId = request.cookies.get(VISITOR_COOKIE)?.value
  const visitorId = existingId || crypto.randomUUID()
  const variant = await evaluateHomepageVariant(visitorId)
  return { variant, visitorId: existingId ? undefined : visitorId, remember: true }
}

export const config = {
  // Every page path, so unprefixed links (`/routes/x`) get redirected to
  // the visitor's locale instead of 404ing. Skips API routes, Next/Vercel
  // internals and anything with a file extension (robots.txt, sitemap.xml,
  // icons, sw.js, /images/*).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
