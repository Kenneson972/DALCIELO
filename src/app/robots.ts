import type { MetadataRoute } from 'next'

const BASE_URL = 'https://pizzadalcielo.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/order/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
