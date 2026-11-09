import { locales, defaultLocale } from '@/i18n'

/** Locale from the current URL (/pt/...), falling back to the default. */
export function currentLocale(): string {
  if (typeof window === 'undefined') return defaultLocale
  const segment = window.location.pathname.split('/')[1]
  return (locales as readonly string[]).includes(segment) ? segment : defaultLocale
}

/**
 * Absolute URL on the site the user is currently on, used as the target of
 * auth emails (confirmation, password reset). Using the current origin makes
 * links point to mototrip.pt in production and localhost in development.
 *
 * Supabase only honours it if the URL is listed under
 * Authentication → URL Configuration → Redirect URLs.
 */
/**
 * An internal path that is safe to navigate to after sign-in, or the locale
 * home. Rejects open redirects such as //evil.com or /\evil.com.
 */
export function safeRedirectPath(target: string | null | undefined, locale: string): string {
  if (target && target.startsWith('/') && !target.startsWith('//') && !target.includes('\\')) {
    return target
  }
  return `/${locale}`
}

export function authRedirectUrl(path: string, locale = currentLocale()): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${origin}/${locale}${path}`
}
