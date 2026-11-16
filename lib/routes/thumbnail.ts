/**
 * Route thumbnails come in two files next to each other in the route_map
 * bucket: thumbnail-<id>.png (light, stored in routes.thumbnail_url and used as
 * the social/OG image) and thumbnail-<id>-dark.png (dark theme). The dark URL
 * is derived from the light one, keeping its ?v= cache buster.
 */

const LIGHT_FILE = /(\/route_map\/thumbnail-[0-9a-f-]{36})\.png(\?.*)?$/i

/** URL of the dark thumbnail, or null when `url` isn't one of our route thumbnails */
export function darkThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(LIGHT_FILE)
  if (!match) return null
  return url.replace(LIGHT_FILE, `$1-dark.png$2`)
}
