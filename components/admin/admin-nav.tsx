'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Map, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminNav() {
  const t = useTranslations('admin.nav')
  const locale = useLocale()
  const pathname = usePathname()

  const items = [
    { href: `/${locale}/profile/admin`, label: t('routes'), icon: Map },
    { href: `/${locale}/profile/admin/users`, label: t('users'), icon: Users },
  ]

  return (
    <nav className="mb-6 flex gap-1 border-b">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
