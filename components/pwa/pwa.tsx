'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'mototrip:pwa-dismissed-at'
const DISMISS_DAYS = 14
const SHOW_DELAY_MS = 20_000

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0)
    return Date.now() - at < DISMISS_DAYS * 86_400_000
  } catch {
    return false
  }
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  // Only Safari can add to the home screen on older iOS; other iOS browsers show the share sheet too since iOS 16.4
  return ios && /Safari/.test(ua)
}

/**
 * Registers the service worker and offers to install the site as an app:
 * the native prompt on Android/desktop Chrome, instructions on iPhone.
 */
export function Pwa() {
  const t = useTranslations('pwa')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<'android' | 'ios' | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (isStandalone() || recentlyDismissed()) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      window.setTimeout(() => setMode('android'), SHOW_DELAY_MS)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    let iosTimer: number | undefined
    if (isIosSafari()) iosTimer = window.setTimeout(() => setMode('ios'), SHOW_DELAY_MS)

    const onInstalled = () => setMode(null)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      if (iosTimer) window.clearTimeout(iosTimer)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
    setMode(null)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice.catch(() => null)
    setDeferred(null)
    setMode(null)
  }

  if (!mode) return null

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-lg border bg-card p-4 shadow-xl sm:bottom-6"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="space-y-1">
          <p className="font-semibold">{t('title')}</p>
          <p className="text-sm text-muted-foreground">
            {mode === 'ios'
              ? t.rich('iosHint', {
                  share: () => <Share className="inline h-4 w-4 align-text-bottom" aria-label="Compartilhar" />,
                })
              : t('description')}
          </p>
        </div>
      </div>
      {mode === 'android' && (
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={dismiss}>
            {t('dismiss')}
          </Button>
          <Button size="sm" onClick={install}>
            {t('install')}
          </Button>
        </div>
      )}
    </div>
  )
}
