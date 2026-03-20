import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Personnaliser ma Pizza - Bientôt disponible',
  description: 'La personnalisation de votre pizza sur mesure arrive bientôt. En attendant, découvrez notre menu Pizza Dal Cielo à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/customize` },
  openGraph: {
    title: 'Pizza Perso | Bientôt disponible | Pizza Dal Cielo',
    description: 'La création de pizza sur mesure arrive bientôt. Découvrez notre menu en attendant.',
    url: `${BASE_URL}/customize`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return children
}
