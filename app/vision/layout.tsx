import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vision - Smart Kitchen IoT for UAE Municipalities & Enterprise | VisionDrive',
  description: 'TDRA-certified smart kitchen temperature monitoring with NB-IoT sensors. Dubai Municipality compliant food safety solution for commercial kitchens across the UAE.',
  alternates: { canonical: '/vision' },
  openGraph: {
    title: 'Vision - Smart Kitchen IoT for UAE Municipalities & Enterprise',
    description: 'TDRA-certified smart kitchen temperature monitoring with NB-IoT sensors. Dubai Municipality compliant food safety solution.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
