'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { locales, localeNames, type Locale } from '@/i18n'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: Locale) => {
    // Remove current locale from pathname and add new one
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '')
    router.push(`/${newLocale}${pathnameWithoutLocale}`)
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        aria-label="Change language"
      >
        <Languages className="h-4 w-4" />
        <span className="text-sm font-medium">{localeNames[locale as Locale]}</span>
      </Button>
      <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-sand-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-1">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLanguage(loc)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-sand-100 transition-colors ${
                locale === loc ? 'bg-sand-50 text-sunshine-600 font-medium' : 'text-sand-700'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
