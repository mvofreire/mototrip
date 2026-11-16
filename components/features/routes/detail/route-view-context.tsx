'use client'

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { HEADER_OFFSET } from '@/lib/scroll'

export type RouteTab = 'stops' | 'about' | 'reviews'

type RouteView = {
  tab: RouteTab
  /**
   * Switches tab from the tab bar. When the page is scrolled past the tab bar,
   * it lands at the top of the new tab instead of wherever the shorter or
   * longer content leaves the scroll position (e.g. on the footer).
   */
  setTab: (tab: RouteTab) => void
  /** Opens a tab and scrolls the tab bar into view */
  goToTab: (tab: RouteTab) => void
  /** Marks where the (sticky) tab bar sits in the page flow */
  tabsRef: React.RefObject<HTMLDivElement>
  /** Stop highlighted on the map (hovered in the list) */
  activeStop: string | null
  setActiveStop: (id: string | null) => void
  /** Phones: full-screen live map */
  mapOpen: boolean
  setMapOpen: (open: boolean) => void
  /** Desktop: details panel folded away so the map takes the whole width */
  expanded: boolean
  setExpanded: (expanded: boolean) => void
}

const Ctx = createContext<RouteView | null>(null)

export function RouteViewProvider({ initialTab, children }: { initialTab: RouteTab; children: ReactNode }) {
  const [tab, setTabState] = useState<RouteTab>(initialTab)
  const [activeStop, setActiveStop] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  const keepTabsInView = useRef(false)

  const setTab = useCallback((next: RouteTab) => {
    const anchor = tabsRef.current
    keepTabsInView.current = anchor ? anchor.getBoundingClientRect().top < HEADER_OFFSET : false
    setTabState(next)
  }, [])

  // Once the new panel is in the DOM, before paint: no visible jump
  useLayoutEffect(() => {
    const anchor = tabsRef.current
    if (!keepTabsInView.current || !anchor) return
    keepTabsInView.current = false
    const top = anchor.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    window.scrollTo({ top, behavior: 'auto' })
  }, [tab])

  const goToTab = useCallback((next: RouteTab) => {
    setTabState(next)
    setExpanded(false)
    requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  const value = useMemo(
    () => ({ tab, setTab, goToTab, tabsRef, activeStop, setActiveStop, mapOpen, setMapOpen, expanded, setExpanded }),
    [tab, setTab, goToTab, activeStop, mapOpen, expanded],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRouteView() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useRouteView must be used inside RouteViewProvider')
  return ctx
}
