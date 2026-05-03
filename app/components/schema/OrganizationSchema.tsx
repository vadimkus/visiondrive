import { absoluteUrl, corePositioning, legalName, publicLanguages, siteName, siteUrl } from '@/lib/seo'

export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: legalName,
    alternateName: siteName,
    url: siteUrl,
    logo: absoluteUrl('/favicon/android-chrome-512x512.png'),
    description: corePositioning.description,
    email: 'tech@visiondrive.ae',
    telephone: '+971559152985',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ras Al Khaimah',
      addressCountry: 'AE',
    },
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971559152985',
      contactType: 'sales and product onboarding',
      availableLanguage: ['English', 'Russian'],
      areaServed: 'AE',
    },
    knowsLanguage: publicLanguages,
    makesOffer: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: corePositioning.productName,
        applicationCategory: 'BusinessApplication',
      },
      availability: 'https://schema.org/LimitedAvailability',
      url: absoluteUrl('/contact'),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
