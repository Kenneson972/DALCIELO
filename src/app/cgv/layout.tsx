import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Conditions Générales de Vente de Pizza Dal Cielo — pizzeria artisanale à Fort-de-France, Martinique. Commandes en ligne, paiement sécurisé, retrait sur place.',
  alternates: { canonical: `${BASE_URL}/cgv` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CGV | Pizza Dal Cielo',
    description: 'Conditions Générales de Vente - Pizza Dal Cielo, Fort-de-France, Martinique.',
    url: `${BASE_URL}/cgv`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function CgvLayout({ children }: { children: React.ReactNode }) {
  return children
}
