export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VisionDrive Technologies FZ-LLC',
    url: 'https://visiondrive.ae',
    logo: 'https://visiondrive.ae/favicon/android-chrome-512x512.png',
    description: 'UAE-based IoT company providing smart kitchen temperature monitoring solutions for commercial kitchens, ensuring Dubai Municipality food safety compliance.',
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
      availableLanguage: ['English', 'Arabic'],
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
