import { track } from '@vercel/analytics'
import { HOMEPAGE_COOKIE } from '@/lib/flags/homepage-config'

type Props = Record<string, string | number | boolean | null>

/** Homepage variant this visitor was given (set by the middleware), if any */
export function homeVariant(): string {
  if (typeof document === 'undefined') return 'none'
  const match = document.cookie.match(new RegExp(`(?:^|; )${HOMEPAGE_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : 'none'
}

/**
 * Vercel Analytics custom event tagged with the visitor's homepage variant,
 * so conversions anywhere on the site (GPX downloads, Google Maps opens) can
 * be compared between the homepages of an A/B test.
 */
export function trackEvent(name: string, props: Props = {}) {
  track(name, { ...props, home_variant: homeVariant() })
}
