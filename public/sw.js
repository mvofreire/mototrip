/* MotoTrip service worker: makes the site installable and usable offline. */
const VERSION = 'v1'
const STATIC_CACHE = `mototrip-static-${VERSION}`
const PAGES_CACHE = `mototrip-pages-${VERSION}`
const OFFLINE_URL = '/offline.html'
const PRECACHE = [OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('mototrip-') && ![STATIC_CACHE, PAGES_CACHE].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Only handle our own origin; Supabase, map tiles and analytics go straight to the network
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/_vercel') || url.pathname.startsWith('/api/')) return

  // Pages: network first, fall back to the last copy, then to the offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => (await caches.match(request)) || caches.match(OFFLINE_URL)),
    )
    return
  }

  // Build assets are content-hashed: cache first
  if (url.pathname.startsWith('/_next/static/') || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
