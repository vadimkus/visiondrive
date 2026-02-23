import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technology - VisionDrive NB-IoT Smart Kitchen Platform',
  description: 'Learn about VisionDrive\'s NB-IoT temperature monitoring technology stack. MQTT protocol, real-time sensor data, AWS UAE region hosting, and automated compliance reporting.',
  keywords: 'NB-IoT technology, temperature sensor technology, MQTT monitoring, smart kitchen platform, IoT kitchen technology, UAE food safety tech',
  alternates: { canonical: '/technology' },
  openGraph: {
    title: 'VisionDrive Technology Platform',
    description: 'Enterprise-grade NB-IoT smart kitchen technology with UAE data residency.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
