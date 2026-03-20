import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Notre Menu - Pizzas & Boissons',
  description: 'Découvrez le menu Pizza Dal Cielo : pizzas classiques, signatures, végétariennes et boissons. Margherita, Reine, Calzone et plus. Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/menu` },
  openGraph: {
    title: 'Menu | Pizza Dal Cielo',
    description: 'Pizzas artisanales et boissons à Fort-de-France. Consultez nos prix et compositions.',
    url: `${BASE_URL}/menu`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children
}
