import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technology - VisionDrive NB-IoT Smart Parking Platform',
  description: 'Learn about VisionDrive\'s NB-IoT parking technology stack. MQTT protocol, HEX payload decoding, AWS UAE region hosting, and real-time occupancy detection.',
  keywords: 'NB-IoT technology, parking sensor technology, MQTT parking, smart parking platform, IoT parking technology, UAE parking tech',
  alternates: { canonical: '/technology' },
  openGraph: {
    title: 'VisionDrive Technology Platform',
    description: 'Enterprise-grade NB-IoT smart parking technology with UAE data residency.',
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



