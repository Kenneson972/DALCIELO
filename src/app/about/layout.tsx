import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'À Propos - Notre Histoire & Valeurs',
  description: 'Pizza dal Cielo : une pizzeria artisanale née de la passion de l\'Italie. Qualité, passion et excellence à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: 'À Propos | Pizza dal Cielo',
    description: 'Notre histoire, nos valeurs. Pizzas faites main avec des ingrédients frais.',
    url: `${BASE_URL}/about`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630, alt: 'Pizza dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
