import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/menuUtils'
import { getBaseUrl } from '@/lib/seo'

const BASE_URL = getBaseUrl()

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/menu`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/customize`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/commander`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/mentions`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const menuSlugs = getAllSlugs().map((slug) => ({
    url: `${BASE_URL}/menu/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  return [...staticPages, ...menuSlugs]
}
