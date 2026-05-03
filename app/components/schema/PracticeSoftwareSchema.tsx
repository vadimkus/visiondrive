import { absoluteUrl, corePositioning, legalName, publicLanguages, siteUrl } from '@/lib/seo'

export default function PracticeSoftwareSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#practice-software`,
    name: corePositioning.productName,
    alternateName: corePositioning.headline,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS Safari, iPadOS Safari, Android Chrome',
    url: siteUrl,
    description: corePositioning.description,
    creator: {
      '@type': 'Organization',
      name: legalName,
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Arab Emirates',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Solo practitioners, home-visit practitioners, independent clinics',
      geographicArea: {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/LimitedAvailability',
      category: 'Private onboarding',
      url: absoluteUrl('/contact'),
    },
    featureList: [
      'Appointment calendar and private online booking link',
      'Patient records, anamnesis, and visit notes',
      'Before and after photo attachments',
      'Inventory and procedure bill of materials',
      'Inline payments, receipts, packages, and client balances',
      'Reminders, reviews, and follow-up workflows',
      'P&L and procedure profitability reporting',
      'Patient-safe exports and private patient portal links',
    ],
    inLanguage: publicLanguages,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
