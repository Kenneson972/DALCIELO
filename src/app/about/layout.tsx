import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'À Propos - Notre Histoire & Valeurs',
  description: 'Pizza Dal Cielo : une pizzeria artisanale née de la passion de l\'Italie. Qualité, passion et excellence à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: 'À Propos | Pizza Dal Cielo',
    description: 'Notre histoire, nos valeurs. Pizzas faites main avec des ingrédients frais.',
    url: `${BASE_URL}/about`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
