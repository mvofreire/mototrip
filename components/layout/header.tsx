'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MapPin, Menu, User, LogOut, Shield } from 'lucide-react'
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
import { useAuth } from '@/hooks/use-auth'

export function Header() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  const isAdmin = user?.profile?.role === 'admin'

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
                  {loading ? (
                    <Button variant="ghost" disabled>
                      Carregando...
                    </Button>
                  ) : user ? (
                    <>
                      <Link href={`/${locale}/profile`} onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          {user.profile?.full_name || user.email}
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href={`/${locale}/profile/admin`} onClick={() => setOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-amber-600 hover:text-amber-700">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          signOut()
                          setOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href={`/${locale}/auth/login`} onClick={() => setOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          {t('signIn')}
                        </Button>
                      </Link>
                      <Link href={`/${locale}/auth/register`} onClick={() => setOpen(false)}>
                        <Button className="w-full bg-gradient-sunshine hover:opacity-90">
                          {t('getStarted')}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {loading ? (
              <Button variant="ghost" size="sm" disabled>
                Carregando...
              </Button>
            ) : user ? (
              <>
                <Link href={`/${locale}/profile`}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.profile?.full_name || user.email}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href={`/${locale}/profile/admin`}>
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={signOut}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button size="sm" className="bg-gradient-sunshine hover:opacity-90">
                    {t('getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
