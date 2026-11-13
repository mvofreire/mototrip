import type { Metadata } from 'next'
import { NO_INDEX } from '@/lib/seo'

// Account-only pages: kept out of search results
export const metadata: Metadata = { robots: NO_INDEX }

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children
}
