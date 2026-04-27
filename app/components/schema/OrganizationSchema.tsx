export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VisionDrive Technologies FZ-LLC',
    url: 'https://visiondrive.ae',
    logo: 'https://visiondrive.ae/favicon/android-chrome-512x512.png',
    description:
      'VisionDrive — practice operations, made clear. UAE software for solo practitioners: bookings, records, inventory, payments, and reporting.',
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
      contactType: 'sales',
      availableLanguage: ['English', 'Russian'],
      areaServed: 'AE',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
