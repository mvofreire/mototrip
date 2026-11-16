'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useRouteView, type RouteTab } from './route-view-context'

type Tab = { id: RouteTab; label: string; content: ReactNode }

/**
 * Sticky tab bar of the route panel. Every panel stays in the HTML (hidden
 * when not selected) so search engines index the description, review and
 * stops whichever tab is open.
 */
export function RouteTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const { tab, setTab, tabsRef } = useRouteView()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    setTab(tabs[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <>
      {/* In-flow marker: the bar itself is sticky, so its own box can't tell where the tabs start */}
      <div ref={tabsRef} aria-hidden className="mt-6 scroll-mt-16" />
      <div
        role="tablist"
        aria-label={label}
        className="sticky top-16 z-20 -mx-4 flex gap-1 border-b bg-card/95 px-4 py-2 backdrop-blur lg:-mx-10 lg:px-10"
      >
        {tabs.map((t, i) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              role="tab"
              id={`route-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`route-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'h-10 flex-1 rounded-lg px-3 text-sm font-bold transition-colors lg:flex-none lg:px-5',
                active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`route-panel-${t.id}`}
          aria-labelledby={`route-tab-${t.id}`}
          hidden={t.id !== tab}
          className="pt-5 animate-in fade-in slide-in-from-right-2 duration-300"
        >
          {t.content}
        </div>
      ))}
    </>
  )
}
