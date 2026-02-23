export default function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://visiondrive.ae/#website',
    name: 'VisionDrive',
    url: 'https://visiondrive.ae',
    description: 'Smart Kitchen Temperature Monitoring for UAE Commercial Kitchens',
    publisher: {
      '@type': 'Organization',
      name: 'VisionDrive Technologies FZ-LLC',
      url: 'https://visiondrive.ae',
    },
    inLanguage: 'en',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
