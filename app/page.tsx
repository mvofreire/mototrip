import { redirect } from 'next/navigation'
import { defaultLocale } from '../i18n'

// Normally unreachable: middleware.ts redirects `/` to the visitor's
// locale (cookie → Accept-Language → default) before this renders. Kept
// only as a fallback should the middleware ever be skipped.
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
