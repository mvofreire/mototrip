'use client'

import Link from "next/link"
import { MapPin, Github, Twitter, Instagram } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLocale, useTranslations } from 'next-intl'

export function Footer() {
  const locale = useLocale()
  const t = useTranslations('footer')

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-md bg-gradient-sunshine flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span>MotoTrip</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('tagline')}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Routes */}
          <div>
            <h3 className="font-semibold mb-4">{t('routes')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/explore?category=scenic`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('scenicRides')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore?category=mountain`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('mountainPasses')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore?category=coastal`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('coastalRoutes')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/explore?category=adventure`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('adventureTrails')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">{t('community')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/submit`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('submitRoute')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/community`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('popularRoutes')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/riders`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('topRiders')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/guidelines`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('communityGuidelines')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>{t('copyright')}</p>
          <p>{t('builtForRiders')}</p>
        </div>
      </div>
    </footer>
  )
}
