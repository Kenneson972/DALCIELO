import { contactInfo } from '@/data/menuData'
import { absoluteUrl, getBaseUrl } from '@/lib/seo'

const BASE_URL = getBaseUrl()
const GBP_URL = 'https://share.google/Y4tYHayqzTwUmFlRB'
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${contactInfo.name}, ${contactInfo.address.street}, ${contactInfo.address.postalCode} ${contactInfo.address.city}, ${contactInfo.address.state}`
)}`

/** Horaires Mardi–Samedi 18h–22h (kb-seo: openingHoursSpecification en tableau) */
const openingHoursSpecification = [
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
].map((dayOfWeek) => ({
  '@type': 'OpeningHoursSpecification' as const,
  dayOfWeek,
  opens: '18:00',
  closes: '22:00',
}))

export function JsonLd() {
  const logoUrl = absoluteUrl('/images/logo.png')

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${BASE_URL}/#restaurant`,
    name: contactInfo.name,
    description: 'Pizzeria artisanale à Fort-de-France, Martinique. Pizzas faites main, ingrédients frais, passion italienne.',
    url: BASE_URL,
    telephone: contactInfo.phone,
    email: contactInfo.email,
    address: {
      '@type': 'PostalAddress' as const,
      streetAddress: contactInfo.address.street,
      addressLocality: contactInfo.address.city,
      addressRegion: contactInfo.address.state,
      postalCode: contactInfo.address.postalCode,
      addressCountry: 'MQ',
    },
    openingHoursSpecification,
    image: logoUrl,
    logo: logoUrl,
    hasMap: MAPS_URL,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    servesCuisine: ['Pizza', 'Italian'],
    acceptsReservations: true,
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Martinique' },
      { '@type': 'City', name: 'Fort-de-France' },
    ],
    sameAs: [
      GBP_URL,
      contactInfo.socials.instagram,
      contactInfo.socials.facebook,
      contactInfo.socials.tripadvisor,
    ].filter(Boolean),
  }

  // Nom de site dans Google : https://developers.google.com/search/docs/appearance/site-names
  const siteDisplayName = contactInfo.name

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: siteDisplayName,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject' as const,
      url: logoUrl,
    },
    sameAs: [
      GBP_URL,
      contactInfo.socials.instagram,
      contactInfo.socials.facebook,
      contactInfo.socials.tripadvisor,
    ].filter(Boolean),
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: siteDisplayName,
    /** Variantes reconnues par Google (évite de n’afficher que le domaine). */
    alternateName: ['Pizzadalcielo', 'Dal Cielo'],
    inLanguage: 'fr-FR',
    publisher: { '@id': `${BASE_URL}/#organization` },
    /** Lien explicite vers l’entité locale (cohérence marque + lieu). */
    about: { '@id': `${BASE_URL}/#restaurant` },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
