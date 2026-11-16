'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { useMyRoutes } from '@/hooks/use-profile'
import { useSavedRouteIds } from '@/hooks/use-saved-routes'
import { cn } from '@/lib/utils'
import { ProfileHero } from './profile-hero'
import { ProfileStats } from './profile-stats'
import { MyRoutes } from './my-routes'
import { SavedRoutes } from './saved-routes'

// Forms only load when the Account tab is opened
const AccountPanel = dynamic(() => import('./account-panel'), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-xl bg-muted/50" />,
})

type Tab = 'routes' | 'saved' | 'account'

// #my-routes is where the submit flow sends riders after sending a route
const HASH: Record<Tab, string> = { routes: '#my-routes', saved: '#saved', account: '#account' }
const tabFromHash = (hash: string): Tab =>
  (Object.keys(HASH) as Tab[]).find((k) => HASH[k] === hash) ?? 'routes'

/** The signed-in rider's profile: cover and photo, stats, and tabs for routes, saved routes and account */
export function ProfileView() {
  const t = useTranslations('account')
  // Rendered only on the client (behind ProtectedRoute), so the hash is readable here
  const [tab, setTab] = useState<Tab>(() => tabFromHash(window.location.hash))
  const [notice, setNotice] = useState<string | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const { data: mine } = useMyRoutes()
  const { data: savedIds } = useSavedRouteIds()

  useEffect(() => {
    const onHash = () => setTab(tabFromHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const select = useCallback((next: Tab, reveal = false) => {
    setTab(next)
    history.replaceState(null, '', HASH[next])
    // From the stats: bring the tabs up when they are scrolled away
    const bar = tabsRef.current
    if (reveal && bar && bar.getBoundingClientRect().top > window.innerHeight * 0.6) {
      bar.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [])

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'routes', label: t('tabRoutes'), count: mine?.length },
    { key: 'saved', label: t('tabSaved'), count: savedIds?.size },
    { key: 'account', label: t('tabAccount') },
  ]

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((x) => x.key === tab)
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = tabs[(i + step + tabs.length) % tabs.length].key
    select(next)
    document.getElementById(`profile-tab-${next}`)?.focus()
  }

  return (
    <div className="pb-16">
      <ProfileHero onNotice={setNotice} />

      <div className="mt-4 md:mt-6">
        <ProfileStats onSelect={(target) => select(target, true)} />
      </div>

      {/* Sticky under the site header (h-16 + iOS safe area) */}
      <div
        ref={tabsRef}
        className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-30 mt-4 scroll-mt-[calc(4rem+env(safe-area-inset-top))] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div role="tablist" aria-label={t('profileTitle')} onKeyDown={onKeyDown} className="container flex gap-1 py-2">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              id={`profile-tab-${key}`}
              role="tab"
              type="button"
              aria-selected={tab === key}
              aria-controls="profile-panel"
              tabIndex={tab === key ? 0 : -1}
              onClick={() => select(key)}
              className={cn(
                'min-h-10 flex-1 whitespace-nowrap rounded-lg px-3 text-[13px] font-bold transition-colors md:flex-none md:px-5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tab === key
                  ? 'bg-secondary text-foreground shadow-[inset_0_-2px_0_hsl(var(--primary))]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
              {count !== undefined && <span className="ml-1 font-semibold tabular-nums text-muted-foreground">{count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div
        key={tab}
        id="profile-panel"
        role="tabpanel"
        aria-labelledby={`profile-tab-${tab}`}
        className="profile-panel container pt-5 md:pt-6"
      >
        {tab === 'routes' && <MyRoutes />}
        {tab === 'saved' && <SavedRoutes />}
        {tab === 'account' && <AccountPanel onNotice={setNotice} />}
      </div>

      {notice && (
        <div
          role="status"
          className="profile-panel fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-sm items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          {notice}
        </div>
      )}
    </div>
  )
}
