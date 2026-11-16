import { track } from '@vercel/analytics'
import { pushDataLayer } from '@/lib/consent'

type Props = Record<string, string | number | boolean | null>

/** Vercel Analytics custom event, also pushed to GTM */
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
  track(name, props)
  // Same event for GTM (GA4, Meta Pixel…). Tags there are gated on consent.
  pushDataLayer({ event: name, ...props })
}
