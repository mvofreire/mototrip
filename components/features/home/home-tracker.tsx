'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

/** Where a link on the homepage leads, for the A/B test reports */
function linkTarget(href: string) {
  if (href.includes('google.com/maps')) return 'google_maps'
  if (href.includes('/api/gpx/')) return 'gpx'
  if (/\/routes\//.test(href)) return 'route'
  if (/\/explore/.test(href)) return 'explore'
  if (/\/submit/.test(href)) return 'submit'
  if (/\/regions/.test(href)) return 'region'
  if (/\/blog/.test(href)) return 'blog'
  return 'other'
}

/**
 * Records a `home_view` when the homepage is shown and a `home_click` for
 * every link followed from it, both tagged with the variant. Wrap the page in
 * an element with `data-home-variant` so clicks in the header and footer are
 * not counted.
 */
export function HomeTracker({ variant }: { variant: string }) {
  useEffect(() => {
    trackEvent('home_view', { variant })

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link || !link.closest('[data-home-variant]')) return
      const href = link.getAttribute('href') ?? ''
      const target = linkTarget(href)
      trackEvent('home_click', {
        variant,
        target,
        section: link.closest('[data-home-section]')?.getAttribute('data-home-section') ?? 'none',
      })
      if (target === 'gpx') trackEvent('gpx_download', { from: 'home' })
      if (target === 'google_maps') trackEvent('google_maps_open', { from: 'home' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [variant])

  return null
}
