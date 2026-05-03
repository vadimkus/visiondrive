import { MetadataRoute } from 'next'
import { absoluteUrl, publicSeoRoutes } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return publicSeoRoutes
    .filter((route) => route.sitemap !== false)
    .map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
}
