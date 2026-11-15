'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type RouteTab = 'stops' | 'about' | 'reviews'

type RouteView = {
  tab: RouteTab
  setTab: (tab: RouteTab) => void
  /** Opens a tab and scrolls the tab bar into view */
  goToTab: (tab: RouteTab) => void
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
  const [tab, setTab] = useState<RouteTab>(initialTab)
  const [activeStop, setActiveStop] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)

  const goToTab = useCallback((next: RouteTab) => {
    setTab(next)
    setExpanded(false)
    requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  const value = useMemo(
    () => ({ tab, setTab, goToTab, tabsRef, activeStop, setActiveStop, mapOpen, setMapOpen, expanded, setExpanded }),
    [tab, goToTab, activeStop, mapOpen, expanded],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRouteView() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useRouteView must be used inside RouteViewProvider')
  return ctx
}
