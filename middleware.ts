import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

// Locale resolution order (next-intl): URL prefix → NEXT_LOCALE cookie
// (set by the language switcher and on every localized visit) →
// Accept-Language header → defaultLocale. Prefixed URLs are never
// redirected, so shared and indexed links keep their language; only
// entry points without a locale (`/`, `/routes/x`) are detected.
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Pages declare canonical + hreflang in their own <head> (lib/seo.ts). The
  // header next-intl would add says `pt` instead of `pt-PT` and points
  // x-default at the redirecting `/`, contradicting it, and is wrong for pages
  // whose slug differs per locale.
  alternateLinks: false,
})

export default intlMiddleware

export const config = {
  // Every page path, so unprefixed links (`/routes/x`) get redirected to
  // the visitor's locale instead of 404ing. Skips API routes, Next/Vercel
  // internals and anything with a file extension (robots.txt, sitemap.xml,
  // icons, sw.js, /images/*).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
