import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et informations juridiques - Pizza dal Cielo, pizzeria artisanale à Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/mentions` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Mentions légales | Pizza dal Cielo',
    description: 'Mentions légales et informations juridiques - Pizza dal Cielo, Fort-de-France, Martinique.',
    url: `${BASE_URL}/mentions`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
  },
}

export default function MentionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
