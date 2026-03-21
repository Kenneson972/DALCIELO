import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo'

/** PWA / navigateurs : renforce le nom de marque (complément au JSON-LD WebSite pour Google). */
export default function manifest(): MetadataRoute.Manifest {
  const base = getBaseUrl()
  return {
    name: 'Pizza Dal Cielo',
    short_name: 'Dal Cielo',
    description: 'Pizzeria artisanale à Fort-de-France, Martinique — commande en ligne.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF8F0',
    theme_color: '#D4633F',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
    lang: 'fr',
    id: base,
  }
}
