import type { Metadata } from 'next'
import { absoluteUrl, getDefaultOgImageUrl } from '@/lib/seo'

const BASE_URL = absoluteUrl('/')
const OG_IMAGE = getDefaultOgImageUrl()

export const metadata: Metadata = {
  title: 'Contact - Adresse & Horaires',
  description: 'Contactez Pizza Dal Cielo à Bellevue, Fort-de-France. Horaires : mardi au samedi 18h-22h. Téléphone, WhatsApp, formulaire de contact.',
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: 'Contact | Pizza Dal Cielo',
    description: 'Nous trouver à Fort-de-France. Réservations, commandes, questions.',
    url: `${BASE_URL}/contact`,
    type: 'website',
    siteName: 'Pizza Dal Cielo',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Pizza Dal Cielo - Pizzeria Artisanale Martinique' }],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
