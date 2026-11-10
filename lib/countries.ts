/**
 * Countries with routes on the site. `code` is the ISO 3166-1 alpha-2 value
 * stored in routes.country. Add a country here to show it in the explore
 * filters and the submit form.
 */

export type CountryCode = 'PT' | 'ES' | 'FR'

export interface Country {
  code: CountryCode
  flag: string
  name: Record<'pt' | 'en' | 'es' | 'fr' | 'de', string>
}

export const COUNTRIES: Country[] = [
  { code: 'PT', flag: '🇵🇹', name: { pt: 'Portugal', en: 'Portugal', es: 'Portugal', fr: 'Portugal', de: 'Portugal' } },
  { code: 'ES', flag: '🇪🇸', name: { pt: 'Espanha', en: 'Spain', es: 'España', fr: 'Espagne', de: 'Spanien' } },
  { code: 'FR', flag: '🇫🇷', name: { pt: 'França', en: 'France', es: 'Francia', fr: 'France', de: 'Frankreich' } },
]

export function countryName(country: Country, locale: string) {
  return country.name[locale as keyof Country['name']] ?? country.name.en
}
