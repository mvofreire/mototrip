'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Instagram, Link2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyText, facebookLink, shareUrl, whatsappLink } from '@/lib/share'

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.38 9.38 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.81.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.62l6.02-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
    </svg>
  )
}

/**
 * "Share this route" block: WhatsApp, Facebook and copy link. Each link is
 * tagged with utm_source so analytics shows which channel brings visits.
 */
export function ShareRoutePanel({
  route,
}: {
  route: { id: string; slug?: string | null; title: string; updated_at?: string | null }
}) {
  const t = useTranslations('route')
  const tStory = useTranslations('story')
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  const [story, setStory] = useState<'idle' | 'busy' | 'error'>('idle')

  // Vertical image for Instagram stories: share sheet on phones, download elsewhere
  const onStory = async () => {
    if (!route.slug) return
    setStory('busy')
    try {
      // The version in the URL busts caches whenever the route is edited
      const version = route.updated_at ? `&v=${encodeURIComponent(route.updated_at)}` : ''
      const res = await fetch(`/api/story/${route.slug}?locale=${locale}${version}`)
      if (!res.ok) throw new Error(String(res.status))
      const blob = await res.blob()
      const file = new File([blob], `${route.slug}-mototrip.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: route.title })
        } catch (e) {
          if ((e as Error).name !== 'AbortError') throw e
        }
      } else {
        const href = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = href
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(href)
      }
      setStory('idle')
    } catch (e) {
      console.error('Story image failed:', e)
      setStory('error')
    }
  }

  const text = (source: 'whatsapp') =>
    `${t('shareText', { title: route.title })} ${shareUrl(locale, route, source)}`

  const onCopy = async () => {
    if (!(await copyText(shareUrl(locale, route, 'copy')))) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-lg border bg-card p-5 md:p-6">
      <h2 className="text-lg font-bold md:text-xl">{t('shareTitle')}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t('shareDescription')}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5a] sm:flex-initial">
          <a href={whatsappLink(text('whatsapp'))} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild className="flex-1 bg-[#1877F2] text-white hover:bg-[#166fe5] sm:flex-initial">
          <a href={facebookLink(shareUrl(locale, route, 'facebook'))} target="_blank" rel="noopener noreferrer">
            <FacebookIcon className="mr-2 h-4 w-4" />
            Facebook
          </a>
        </Button>
        {route.slug && (
          <Button
            className="flex-1 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-90 sm:flex-initial"
            onClick={onStory}
            disabled={story === 'busy'}
          >
            {story === 'busy' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Instagram className="mr-2 h-4 w-4" />}
            {story === 'busy' ? tStory('preparing') : tStory('button')}
          </Button>
        )}
        <Button variant="outline" className="flex-1 sm:flex-initial" onClick={onCopy}>
          {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Link2 className="mr-2 h-4 w-4" />}
          {copied ? t('linkCopied') : t('copyLink')}
        </Button>
      </div>
      {story === 'error' && <p className="mt-3 text-sm text-destructive">{tStory('failed')}</p>}
    </section>
  )
}
