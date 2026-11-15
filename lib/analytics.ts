import { track } from '@vercel/analytics'
import { HOMEPAGE_COOKIE } from '@/lib/flags/homepage-config'
import { pushDataLayer } from '@/lib/consent'

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
  // <Analytics /> sets up window.va in its own effect, which runs after the
  // effects of the page (children run first): queue the event like it would,
  // instead of losing it, and the script sends it once loaded.
  if (typeof window !== 'undefined') {
    const w = window as unknown as { va?: (...params: unknown[]) => void; vaq?: unknown[][] }
    w.va ??= (...params: unknown[]) => {
      ;(w.vaq ??= []).push(params)
    }
  }
  const data = { ...props, home_variant: homeVariant() }
  track(name, data)
  // Same event for GTM (GA4, Meta Pixel…). Tags there are gated on consent.
  pushDataLayer({ event: name, ...data })
}
