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
    sitemap: ['https://visiondrive.ae/sitemap.xml'],
    host: 'https://visiondrive.ae',
  }
}
