import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Commander',
  description: 'Commandez vos pizzas Pizza Dal Cielo : via CieloBot, téléphone, WhatsApp ou directement sur le site. Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/commander` },
  openGraph: {
    title: 'Commander | Pizza Dal Cielo',
    description: 'Commandez en toute simplicité : CieloBot, téléphone, WhatsApp ou site. Fort-de-France, Martinique.',
    url: `${BASE_URL}/commander`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function CommanderLayout({ children }: { children: React.ReactNode }) {
  return children
}
