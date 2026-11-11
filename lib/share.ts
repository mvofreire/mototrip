import { getSiteUrl } from '@/lib/site-url'
import { routePath } from '@/lib/route-url'

export type ShareSource = 'whatsapp' | 'facebook' | 'x' | 'linkedin' | 'copy' | 'native'

/** Canonical route URL tagged with where it was shared (shows up in analytics) */
export function shareUrl(locale: string, route: { id: string; slug?: string | null }, source: ShareSource) {
  return tagUrl(routePath(locale, route), source)
}

/** Any site path tagged with where it was shared */
export function tagUrl(path: string, source: ShareSource) {
  const url = new URL(path, getSiteUrl())
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', 'share')
  return url.toString()
}

export const whatsappLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export const facebookLink = (url: string) =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

export const xLink = (text: string, url: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

export const linkedinLink = (url: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Older browsers / blocked clipboard API: legacy copy via a hidden field
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    el.remove()
    return ok
  }
}
