'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MapPin, Menu, User, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

export function Header() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`)
  }

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
              className={`text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('exploreRoutes')}
            </Link>
            <Link
              href={`/${locale}/submit`}
              className={`text-sm font-medium transition-colors ${
                isActive('/submit')
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('submitRoute')}
            </Link>
            <Link
              href={`/${locale}/community`}
              className={`text-sm font-medium transition-colors ${
                isActive('/community')
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('community')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-sunshine flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  {tCommon('mototrip')}
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-6 mt-8">
                {/* Navigation Links */}
                <nav className="flex flex-col gap-4">
                  <Link
                    href={`/${locale}/explore`}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-medium transition-colors py-2 ${
                      isActive('/explore')
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('exploreRoutes')}
                  </Link>
                  <Link
                    href={`/${locale}/submit`}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-medium transition-colors py-2 ${
                      isActive('/submit')
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('submitRoute')}
                  </Link>
                  <Link
                    href={`/${locale}/community`}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-medium transition-colors py-2 ${
                      isActive('/community')
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t('community')}
                  </Link>
                </nav>

                {/* Divider */}
                <div className="border-t" />

                {/* Theme & Language */}
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Auth Buttons */}
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" className="justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {t('signIn')}
                  </Button>
                  <Button className="bg-gradient-sunshine hover:opacity-90">
                    {t('getStarted')}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
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
