import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et informations juridiques - Pizza Dal Cielo, pizzeria artisanale à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/mentions` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Mentions légales | Pizza Dal Cielo',
    description: 'Mentions légales et informations juridiques - Pizza Dal Cielo, Fort-de-France, Martinique.',
    url: `${BASE_URL}/mentions`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function MentionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
