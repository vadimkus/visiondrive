export default function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://visiondrive.ae/#website',
    name: 'VisionDrive',
    url: 'https://visiondrive.ae',
    description: 'VisionDrive — practice operations, made clear. Software for professional teams in the UAE.',
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
