import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'Commander',
  description: 'Commandez vos pizzas Pizza dal Cielo : via CieloBot, téléphone, WhatsApp ou directement sur le site. Fort-de-France, Martinique.',
  alternates: { canonical: `${BASE_URL}/commander` },
  openGraph: {
    title: 'Commander | Pizza dal Cielo',
    description: 'Commandez en toute simplicité : CieloBot, téléphone, WhatsApp ou site. Fort-de-France, Martinique.',
    url: `${BASE_URL}/commander`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
  },
}

export default function CommanderLayout({ children }: { children: React.ReactNode }) {
  return children
}
