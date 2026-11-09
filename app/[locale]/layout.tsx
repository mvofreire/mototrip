import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { locales } from '@/i18n'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Analytics } from '@vercel/analytics/react'
import { Pwa } from '@/components/pwa/pwa'
import { SOCIAL_PROFILES } from '@/lib/social'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Se a URL não tem protocolo, adicionar https://
  if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
    return `https://${siteUrl}`
  }
  
  return siteUrl
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home.hero' })

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: 'MotoTrip - ' + t('title') + ' ' + t('titleHighlight'),
      template: '%s | MotoTrip',
    },
    description: t('subtitle'),
    keywords: [
      'motorcycle',
      'routes',
      'riding',
      'adventure',
      'scenic roads',
      'motorcycle touring',
    ],
    authors: [{ name: 'MotoTrip' }],
    creator: 'MotoTrip',
    openGraph: {
      type: 'website',
      locale: ({ pt: 'pt_BR', es: 'es_ES', fr: 'fr_FR', de: 'de_DE' } as Record<string, string>)[locale] ?? 'en_US',
      url: `/${locale}`,
      siteName: 'MotoTrip',
      title: 'MotoTrip - ' + t('title') + ' ' + t('titleHighlight'),
      description: t('subtitle'),
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'MotoTrip',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'MotoTrip - ' + t('title') + ' ' + t('titleHighlight'),
      description: t('subtitle'),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    applicationName: 'MotoTrip',
    appleWebApp: {
      capable: true,
      title: 'MotoTrip',
      statusBarStyle: 'black-translucent',
    },
    formatDetection: { telephone: false },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0d0f14' },
    { media: '(prefers-color-scheme: light)', color: '#f5f6f8' },
  ],
  viewportFit: 'cover',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  // Providing all messages to the client
  const messages = await getMessages()

  // Lets search engines tie the site to its official profiles
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MotoTrip',
    url: getBaseUrl(),
    logo: `${getBaseUrl()}/icon-512.png`,
    sameAs: SOCIAL_PROFILES,
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} ${display.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Pwa />
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
