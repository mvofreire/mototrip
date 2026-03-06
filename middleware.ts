import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always redirect to locale prefix
  localePrefix: 'always',
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt|es|en)/:path*'],
}
