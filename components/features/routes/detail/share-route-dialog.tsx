'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Instagram, Link2, Loader2, Share2, X } from 'lucide-react'
import { FacebookIcon, WhatsAppIcon } from '@/components/icons/social'
import { copyText, facebookLink, shareUrl, whatsappLink } from '@/lib/share'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

type ShareRoute = { id: string; slug?: string | null; title: string; updated_at?: string | null }

/**
 * The route page's only "Share" control: opens a sheet (bottom on phones,
 * centered on desktop) with WhatsApp, Facebook, an Instagram story image,
 * copy link and the phone's own share menu. Links carry utm_source.
 */
export function ShareRouteDialog({ route, className }: { route: ShareRoute; className?: string }) {
  const t = useTranslations('route')
  const tStory = useTranslations('story')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [story, setStory] = useState<'idle' | 'busy' | 'error'>('idle')
  const [canNative, setCanNative] = useState(false)

  useEffect(() => setCanNative(typeof navigator !== 'undefined' && !!navigator.share), [])

  const routeSlug = route.slug ?? route.id
  const sent = (channel: string) => trackEvent('route_share', { route: routeSlug, channel })
  const text = `${t('shareText', { title: route.title })} ${shareUrl(locale, route, 'whatsapp')}`

  const onCopy = async () => {
    if (!(await copyText(shareUrl(locale, route, 'copy')))) return
    sent('copy')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const onNative = async () => {
    try {
      await navigator.share({ title: route.title, text: t('shareText', { title: route.title }), url: shareUrl(locale, route, 'native') })
      sent('native')
      setOpen(false)
    } catch {
      // Closed the share menu: nothing to do
    }
  }

  // Vertical image for Instagram stories: share sheet on phones, download elsewhere
  const onStory = async () => {
    if (!route.slug) return
    setStory('busy')
    try {
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
      sent('story')
      setStory('idle')
    } catch (e) {
      console.error('Story image failed:', e)
      setStory('error')
    }
  }

  const item = 'flex flex-col items-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors hover:bg-muted'
  const disc = 'flex h-14 w-14 items-center justify-center rounded-full'

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('share')}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95',
            className,
          )}
        >
          <Share2 className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed z-[70] border bg-card p-5 text-card-foreground shadow-2xl focus:outline-none',
            // Bottom sheet on phones, centered dialog from sm up
            'inset-x-0 bottom-0 rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1.25rem)] data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom',
            'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:pb-6 sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] sm:data-[state=open]:zoom-in-95',
          )}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-2xl font-bold uppercase">{t('shareTitle')}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">{t('shareDescription')}</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('close')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1">
            <a href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" onClick={() => sent('whatsapp')} className={item}>
              <span className={cn(disc, 'bg-[#25D366] text-white')}>
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              WhatsApp
            </a>
            <a
              href={facebookLink(shareUrl(locale, route, 'facebook'))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sent('facebook')}
              className={item}
            >
              <span className={cn(disc, 'bg-[#1877F2] text-white')}>
                <FacebookIcon className="h-6 w-6" />
              </span>
              Facebook
            </a>
            {route.slug && (
              <button type="button" onClick={onStory} disabled={story === 'busy'} className={item}>
                <span className={cn(disc, 'bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white')}>
                  {story === 'busy' ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <Instagram className="h-6 w-6" aria-hidden />}
                </span>
                {story === 'busy' ? tStory('preparing') : 'Story'}
              </button>
            )}
            <button type="button" onClick={onCopy} className={item}>
              <span className={cn(disc, 'bg-muted')}>
                {copied ? <Check className="h-6 w-6 text-green-600" aria-hidden /> : <Link2 className="h-6 w-6" aria-hidden />}
              </span>
              {copied ? t('linkCopied') : t('copyLink')}
            </button>
          </div>
          {story === 'error' && <p className="mt-3 text-sm text-destructive">{tStory('failed')}</p>}

          {canNative && (
            <button
              type="button"
              onClick={onNative}
              className="mt-4 h-12 w-full rounded-xl border text-sm font-semibold transition-colors hover:bg-muted"
            >
              {t('moreShareOptions')}
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
