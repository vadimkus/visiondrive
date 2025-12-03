import type { Metadata } from 'next'
import SolutionsHero from '@/components/sections/solutions/SolutionsHero'
import CommunitiesSection from '@/components/sections/solutions/CommunitiesSection'
import MunicipalitiesSection from '@/components/sections/solutions/MunicipalitiesSection'
import TechnologyDeepDive from '@/components/sections/solutions/TechnologyDeepDive'
import IntegrationProcess from '@/components/sections/solutions/IntegrationProcess'

export const metadata: Metadata = {
  title: 'Enterprise Smart Parking Solutions | Vision Drive Corporate Portal',
  description: 'Comprehensive smart parking solutions for municipalities, RTA, commercial properties, and enterprises. Data-driven analytics, real-time monitoring, and seamless integration for corporate clients.',
  keywords: 'enterprise parking solutions, corporate parking management, RTA parking solutions, municipality parking, commercial parking, smart city parking, parking analytics, enterprise portal',
  openGraph: {
    title: 'Enterprise Smart Parking Solutions | Vision Drive',
    description: 'Corporate smart parking solutions for municipalities, RTA, and commercial enterprises.',
    type: 'website',
    url: 'https://visiondrive.ae/solutions',
  },
  alternates: {
    canonical: '/solutions',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Enterprise Smart Parking Solutions',
  provider: {
    '@type': 'Organization',
    name: 'Vision Drive Technologies FZ-LLC',
    url: 'https://visiondrive.ae',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
  },
  description: 'Comprehensive smart parking solutions for municipalities, RTA, commercial properties, and enterprises.',
  areaServed: {
    '@type': 'Country',
    name: 'United Arab Emirates',
  },
  serviceType: 'Smart Parking Management',
  offers: {
    '@type': 'Offer',
    category: 'Enterprise Software Solutions',
  },
}

export default function SolutionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SolutionsHero />
      <CommunitiesSection />
      <MunicipalitiesSection />
      <TechnologyDeepDive />
      <IntegrationProcess />
    </>
  )
}

