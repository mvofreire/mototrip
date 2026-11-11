'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Link2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FacebookIcon, WhatsAppIcon } from '@/components/features/routes/share-route-panel'
import { copyText, facebookLink, tagUrl, whatsappLink, xLink, type ShareSource } from '@/lib/share'

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.48 3.24H4.3z" />
    </svg>
  )
}

/** "Share this guide": WhatsApp, Facebook, X, native share and copy link, each tagged with utm_source. */
export function SharePostPanel({ post }: { post: { slug: string; title: string } }) {
  const t = useTranslations('blog')
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  const [canNative, setCanNative] = useState(false)
  useEffect(() => setCanNative(typeof navigator.share === 'function'), [])

  const url = (source: ShareSource) => tagUrl(`/${locale}/blog/${post.slug}`, source)
  const text = t('shareText', { title: post.title })

  const onCopy = async () => {
    if (!(await copyText(url('copy')))) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const onNative = async () => {
    try {
      await navigator.share({ title: post.title, text, url: url('native') })
    } catch {
      // closed the share sheet
    }
  }

  const ext = { target: '_blank', rel: 'noopener noreferrer' }

  return (
    <section className="mt-12 rounded-lg border bg-card p-5 md:p-6">
      <h2 className="text-lg font-bold md:text-xl">{t('shareTitle')}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t('shareDescription')}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5a] sm:flex-initial">
          <a href={whatsappLink(`${text} ${url('whatsapp')}`)} {...ext}>
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        </Button>
        <Button asChild className="flex-1 bg-[#1877F2] text-white hover:bg-[#166fe5] sm:flex-initial">
          <a href={facebookLink(url('facebook'))} {...ext}>
            <FacebookIcon className="mr-2 h-4 w-4" />
            Facebook
          </a>
        </Button>
        <Button asChild className="flex-1 bg-black text-white hover:bg-black/80 sm:flex-initial">
          <a href={xLink(text, url('x'))} {...ext}>
            <XIcon className="mr-2 h-4 w-4" />X
          </a>
        </Button>
        {canNative && (
          <Button variant="outline" className="flex-1 sm:flex-initial" onClick={onNative}>
            <Share2 className="mr-2 h-4 w-4" />
            {t('share')}
          </Button>
        )}
        <Button variant="outline" className="flex-1 sm:flex-initial" onClick={onCopy}>
          {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Link2 className="mr-2 h-4 w-4" />}
          {copied ? t('linkCopied') : t('copyLink')}
        </Button>
      </div>
    </section>
  )
}
