import { MetadataRoute } from 'next'
import { privateOrDuplicatePaths, siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const crawlerAllowRules = [
    'Googlebot',
    'Bingbot',
    'OAI-SearchBot',
    'GPTBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'Claude-User',
    'Applebot',
  ].map((userAgent) => ({
    userAgent,
    allow: '/',
    disallow: [...privateOrDuplicatePaths],
  }))

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...privateOrDuplicatePaths],
      },
      ...crawlerAllowRules,
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  }
}
