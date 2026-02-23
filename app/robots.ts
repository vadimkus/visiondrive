import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/portal/', '/login', '/notes', '/roadmap2'],
      },
    ],
    sitemap: 'https://visiondrive.ae/sitemap.xml',
    other: [
      'Host: https://visiondrive.ae',
      '',
      '# LLM access files',
      'Sitemap: https://visiondrive.ae/llms.txt',
    ].join('\n'),
  }
}
