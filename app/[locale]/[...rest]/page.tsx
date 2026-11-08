import { notFound } from 'next/navigation'

// Unknown paths under a locale render the localized not-found page
// (with header/footer) instead of Next's bare default 404.
export default function CatchAllPage() {
  notFound()
}
