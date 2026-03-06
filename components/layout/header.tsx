'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MapPin, Menu, User } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Header() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-md bg-gradient-sunshine flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline-block">{tCommon('mototrip')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}/explore`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('exploreRoutes')}
            </Link>
            <Link
              href={`/${locale}/submit`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('submitRoute')}
            </Link>
            <Link
              href={`/${locale}/community`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('community')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              {t('signIn')}
            </Button>
            <Button size="sm" className="bg-gradient-sunshine hover:opacity-90">
              {t('getStarted')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
