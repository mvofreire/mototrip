'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function copyText(text: string): Promise<boolean> {
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

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareRouteButton({ title }: { title: string }) {
  const t = useTranslations('route')
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (e) {
        // User closed the share sheet: nothing to do
        if ((e as Error).name === 'AbortError') return
      }
    }
    if (!(await copyText(url))) return
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
