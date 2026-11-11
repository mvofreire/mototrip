import { Suspense } from 'react'

// The page reads the filters from the URL (useSearchParams), so it needs a
// Suspense boundary for the rest of the site to be rendered statically.
export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen" />}>{children}</Suspense>
}
