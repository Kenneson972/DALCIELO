import type { Metadata } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export const metadata: Metadata = {
  title: 'Contact - Adresse & Horaires',
  description: 'Contactez Pizza dal Cielo à Bellevue, Fort-de-France. Horaires : mardi au samedi 18h-22h. Téléphone, WhatsApp, formulaire de contact.',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Contact | Pizza dal Cielo',
    description: 'Nous trouver à Fort-de-France. Réservations, commandes, questions.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    siteName: 'Pizza dal Cielo',
    images: [{ url: `${BASE_URL}/images/og-image.jpg`, width: 1200, height: 630, alt: 'Pizza dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
