export default function PracticeSoftwareSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://visiondrive.ae/#practice-software',
    name: 'VisionDrive Practice OS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS Safari, iPadOS Safari, Android Chrome',
    url: 'https://visiondrive.ae',
    description:
      'Practice management software for solo practitioners and independent clinics in the UAE: bookings, patient records, treatment notes, photos, inventory, payments, reminders, packages, and profitability reporting.',
    creator: {
      '@type': 'Organization',
      name: 'VisionDrive Technologies FZ-LLC',
      url: 'https://visiondrive.ae',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United Arab Emirates',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Solo practitioners, home-visit practitioners, independent clinics',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/LimitedAvailability',
      priceCurrency: 'AED',
      category: 'Private onboarding',
      url: 'https://visiondrive.ae/contact',
    },
    featureList: [
      'Appointments and online booking',
      'Patient records and visit notes',
      'Before and after photo attachments',
      'Inventory and procedure bill of materials',
      'Inline payments, receipts, packages, and client balances',
      'Reminders, reviews, and follow-up workflows',
      'P&L and procedure profitability reporting',
    ],
    inLanguage: ['en', 'ru'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
