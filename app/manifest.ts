import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'MotoTrip – Rotas de Moto',
    short_name: 'MotoTrip',
    description: 'As melhores rotas de moto, curadas por motociclistas.',
    lang: 'pt-BR',
    start_url: '/pt?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0d0f14',
    theme_color: '#0d0f14',
    categories: ['travel', 'navigation', 'sports'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Explorar rotas', short_name: 'Explorar', url: '/pt/explore', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Enviar rota', short_name: 'Enviar', url: '/pt/submit', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
