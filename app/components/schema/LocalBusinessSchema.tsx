import { absoluteUrl, corePositioning, legalName, siteUrl } from '@/lib/seo'

export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: legalName,
    url: siteUrl,
    image: absoluteUrl('/opengraph-image'),
    description: corePositioning.description,
    telephone: '+971559152985',
    email: 'tech@visiondrive.ae',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Compass Coworking Centre',
      addressLocality: 'Ras Al Khaimah',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.7895,
      longitude: 55.9432,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$$',
    areaServed: {
      '@type': 'Country',
      name: 'United Arab Emirates',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
