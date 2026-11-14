import type { HomepageVariant } from '@/lib/flags/homepage-config'
import { ClassicHome } from './classic-home'
import { RoadHome } from './road-home'

/** The homepage layout chosen by the `homepage-variant` flag */
export function Homepage({ locale, variant }: { locale: string; variant: HomepageVariant }) {
  switch (variant) {
    case 'classic':
      return <ClassicHome locale={locale} />
    case 'road':
      return <RoadHome locale={locale} />
  }
}
