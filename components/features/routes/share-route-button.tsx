'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyText, shareUrl } from '@/lib/share'

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareRouteButton({ route }: { route: { id: string; slug?: string | null; title: string } }) {
  const t = useTranslations('route')
  const locale = useLocale()
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: route.title,
          text: t('shareText', { title: route.title }),
          url: shareUrl(locale, route, 'native'),
        })
        return
      } catch (e) {
        // User closed the share sheet: nothing to do
        if ((e as Error).name === 'AbortError') return
      }
    }
    if (!(await copyText(shareUrl(locale, route, 'copy')))) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" className="text-sm md:text-base" onClick={handleShare}>
      {copied ? (
        <Check className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-600" />
      ) : (
        <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
      )}
      {copied ? t('linkCopied') : t('share')}
    </Button>
  )
}
