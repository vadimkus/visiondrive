export default function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://visiondrive.ae/#localbusiness',
    name: 'VisionDrive Technologies FZ-LLC',
    url: 'https://visiondrive.ae',
    image: 'https://visiondrive.ae/favicon/android-chrome-512x512.png',
    description: 'Smart kitchen temperature monitoring and IoT solutions for UAE commercial kitchens.',
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
