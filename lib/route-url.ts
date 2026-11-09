/** Public path of a route: readable slug when it has one, id otherwise */
export function routePath(locale: string, route: { id: string; slug?: string | null }) {
  return `/${locale}/routes/${route.slug || route.id}`
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string) {
  return UUID.test(value)
}
