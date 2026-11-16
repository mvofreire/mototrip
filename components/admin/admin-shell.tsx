'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown, Clock, FileText, LayoutDashboard, Map, Plus, RefreshCw, Shield, Users, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AdminService } from '@/lib/services/admin.service'
import type { UserRole } from '@/types/auth.types'
import { cn } from '@/lib/utils'

/**
 * Admin and curator area: checks the role once, then shows a sidebar
 * next to the page (a slide-in menu on phones).
 */

interface AdminContextValue {
  role: 'admin' | 'curator'
  isAdmin: boolean
  /** Re-count pending routes (the sidebar badge) after a review */
  refreshPending: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminShell')
  return ctx
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('admin.shell')
  const [role, setRole] = useState<UserRole | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the phone menu after following a link
  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    AdminService.getRole().then((r) => {
      if (r !== 'admin' && r !== 'curator') router.push(`/${locale}/profile`)
      else setRole(r)
    })
    // Only on sign-in changes; the path is just the return address
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, locale])

  const refreshPending = () => {
    AdminService.countPendingRoutes().then(setPending).catch(() => setPending(null))
  }
  // Recount when moving between admin pages
  useEffect(() => {
    if (role) refreshPending()
  }, [role, pathname])

  if (authLoading || (role !== 'admin' && role !== 'curator')) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const base = `/${locale}/profile/admin`
  const nav: { href: string; label: string; icon: LucideIcon; badge?: number | null; exact?: boolean }[] = [
    { href: base, label: t('overview'), icon: LayoutDashboard, exact: true },
    { href: `${base}/routes`, label: t('routes'), icon: Map, badge: pending },
    // Managing users and roles is admin-only
    ...(role === 'admin' ? [{ href: `${base}/users`, label: t('users'), icon: Users }] : []),
    { href: `${base}/blog`, label: t('blog'), icon: FileText },
  ]
  const shortcuts = [
    { href: `${base}/routes?status=pending`, label: t('reviewQueue'), icon: Clock },
    { href: `${base}/blog/new`, label: t('newPost'), icon: Plus },
  ]
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))

  const item = (href: string, label: string, Icon: LucideIcon, active: boolean, badge?: number | null) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-foreground [&_svg]:text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {!!badge && (
        <span className="ml-auto rounded-full bg-amber-500/15 px-2 text-xs font-semibold text-amber-700 dark:text-amber-400">{badge}</span>
      )}
    </Link>
  )

  const current = nav.find((n) => isActive(n.href, n.exact)) ?? nav[0]
  const CurrentIcon = current.icon

  const links = (
    <nav className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('general')}</p>
      {nav.map((n) => item(n.href, n.label, n.icon, isActive(n.href, n.exact), n.badge))}
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('shortcuts')}</p>
      {shortcuts.map((s) => item(s.href, s.label, s.icon, false))}
      <div className="mt-6 flex items-center gap-2 rounded-lg border p-3 text-sm">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">{t(`role.${role}`)}</span>
      </div>
    </nav>
  )

  return (
    <AdminContext.Provider value={{ role, isAdmin: role === 'admin', refreshPending }}>
      <div className="container py-4 md:py-8">
        {/* Phones: one button with the current section that opens the menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="mb-4 flex w-full items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium md:hidden"
            >
              <CurrentIcon className="h-4 w-4 text-primary" />
              {current.label}
              <span className="ml-auto flex items-center gap-2">
                {!!pending && (
                  <span className="rounded-full bg-amber-500/15 px-2 text-xs font-semibold text-amber-700 dark:text-amber-400" title={t('reviewQueue')}>
                    {pending}
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto p-4 pt-12">
            <SheetTitle className="sr-only">{t(`role.${role}`)}</SheetTitle>
            {links}
          </SheetContent>
        </Sheet>

        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden md:sticky md:top-20 md:block md:self-start">{links}</aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  )
}

/** Title row of an admin page, with optional actions on the right */
export function AdminPageHeader({ title, description, children }: { title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}
