import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['en', 'pt', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
