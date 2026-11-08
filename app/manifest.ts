import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MotoTrip',
    short_name: 'MotoTrip',
    description: 'As melhores rotas de moto, curadas por motociclistas.',
    start_url: '/pt',
    display: 'standalone',
    background_color: '#0d0f14',
    theme_color: '#d00f25',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
