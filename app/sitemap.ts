import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://visiondrive.ae'
  const currentDate = new Date()

  return [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },

    // Core product pages - high priority
    {
      url: `${baseUrl}/solutions`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/technology`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // Kitchen Owner Portal - high priority
    {
      url: `${baseUrl}/kitchen-owner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },

    // Company pages - medium-high priority
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mission`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Contact and engagement - medium priority
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Compliance and trust pages - medium priority
    {
      url: `${baseUrl}/compliance`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Legal pages - low priority but required
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
