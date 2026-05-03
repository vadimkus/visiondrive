import { corePositioning, legalName, publicLanguages, siteName, siteUrl } from '@/lib/seo'

export default function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: siteName,
    alternateName: corePositioning.productName,
    url: siteUrl,
    description: corePositioning.description,
    publisher: {
      '@type': 'Organization',
      name: legalName,
      url: siteUrl,
    },
    inLanguage: publicLanguages,
    audience: {
      '@type': 'Audience',
      audienceType: 'Solo practitioners, home-visit practitioners, independent clinics',
      geographicArea: {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
