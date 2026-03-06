import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { locales } from '@/i18n'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home.hero' })

  return {
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
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      url: 'https://mototrip.com',
      siteName: 'MotoTrip',
      title: 'MotoTrip - ' + t('title') + ' ' + t('titleHighlight'),
      description: t('subtitle'),
      images: [
        {
          url: '/og-image.jpg',
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
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
