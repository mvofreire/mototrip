'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Set the first time the banner is shown: it is offered once per browser */
const SEEN_KEY = 'mototrip:pwa-prompt-seen'
/** Older key (dismissed within 14 days); treated as seen */
const LEGACY_DISMISS_KEY = 'mototrip:pwa-dismissed-at'
const SHOW_DELAY_MS = 20_000

function alreadySeen() {
  try {
    return Boolean(localStorage.getItem(SEEN_KEY) || localStorage.getItem(LEGACY_DISMISS_KEY))
  } catch {
    // No storage (private mode, blocked): don't nag on every page view
    return true
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()))
  } catch {}
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

    if (isStandalone() || alreadySeen()) return

    // Chrome fires `beforeinstallprompt` again after the native prompt is
    // dismissed, so a single timer decides, and the banner shows at most once.
    let timer: number | undefined
    const show = (next: 'android' | 'ios') => {
      if (timer) return
      timer = window.setTimeout(() => {
        if (alreadySeen()) return
        markSeen()
        setMode(next)
      }, SHOW_DELAY_MS)
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      show('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    if (isIosSafari()) show('ios')

    const onInstalled = () => {
      markSeen()
      setMode(null)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    markSeen()
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
          {mode === 'ios' ? (
            <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
              {(['iosStep1', 'iosStep2'] as const).map((key) => (
                <li key={key}>
                  {t.rich(key, {
                    share: () => (
                      <span className="mx-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border bg-muted align-middle text-foreground">
                        <Share className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    ),
                    b: (chunks) => <strong className="font-semibold text-foreground">{chunks}</strong>,
                  })}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">{t('description')}</p>
          )}
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
