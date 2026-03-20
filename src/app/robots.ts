import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo'

const BASE_URL = getBaseUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/order/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
