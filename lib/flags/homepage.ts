import { flagsClient } from '@vercel/flags-core'
import { DEFAULT_HOMEPAGE, HOMEPAGE_FLAG, isHomepageVariant, type HomepageVariant } from './homepage-config'

export * from './homepage-config'

/** Homepage variant for this visitor, from Vercel Flags */
export async function evaluateHomepageVariant(visitorId: string): Promise<HomepageVariant> {
  try {
    const result = await flagsClient.evaluate<string>(HOMEPAGE_FLAG, DEFAULT_HOMEPAGE, {
      visitor: { id: visitorId },
    })
    if (result.errorMessage) {
      console.warn(`Flag ${HOMEPAGE_FLAG}: ${result.errorMessage} (using ${DEFAULT_HOMEPAGE})`)
    }
    return isHomepageVariant(result.value) ? result.value : DEFAULT_HOMEPAGE
  } catch (e) {
    console.warn(`Flag ${HOMEPAGE_FLAG} unavailable, using ${DEFAULT_HOMEPAGE}:`, e)
    return DEFAULT_HOMEPAGE
  }
}
