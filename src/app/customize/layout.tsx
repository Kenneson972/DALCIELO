import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'Personnaliser ma Pizza - Bientôt disponible',
  description: 'La personnalisation de votre pizza sur mesure arrive bientôt. En attendant, découvrez notre menu Pizza dal Cielo à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/customize` },
  openGraph: {
    title: 'Pizza Perso | Bientôt disponible | Pizza dal Cielo',
    description: 'La création de pizza sur mesure arrive bientôt. Découvrez notre menu en attendant.',
    url: `${BASE_URL}/customize`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630, alt: 'Pizza dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function CustomizeLayout({ children }: { children: React.ReactNode }) {
  return children
}
