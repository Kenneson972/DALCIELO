import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'Notre Menu - Pizzas & Boissons',
  description: 'Découvrez le menu Pizza dal Cielo : pizzas classiques, signatures, végétariennes et boissons. Margherita, Reine, Calzone et plus. Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/menu` },
  openGraph: {
    title: 'Menu | Pizza dal Cielo',
    description: 'Pizzas artisanales et boissons à Fort-de-France. Consultez nos prix et compositions.',
    url: `${BASE_URL}/menu`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630, alt: 'Pizza dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children
}
