import { contactInfo } from '@/data/menuData'

const BASE_URL = 'https://pizzadalcielo.com'

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
    geo: {
      '@type': 'GeoCoordinates' as const,
      addressLocality: contactInfo.address.city,
      addressRegion: 'Martinique',
    },
    openingHoursSpecification,
    image: `${BASE_URL}/images/logo.png`,
    sameAs: [contactInfo.socials.instagram, contactInfo.socials.facebook],
    priceRange: '€€',
    servesCuisine: 'Italian',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
