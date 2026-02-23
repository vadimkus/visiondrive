import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sensor Technology - Smart Kitchen NB-IoT Temperature Sensors',
  description: 'NB-IoT temperature sensors with ±0.3°C accuracy, 5+ year battery life, IP67 rating. Real-time kitchen monitoring for UAE commercial food safety.',
  keywords: 'NB-IoT temperature sensor, smart kitchen sensor, IoT temperature monitor, kitchen food safety sensor, wireless temperature sensor UAE',
  alternates: { canonical: '/sensor' },
  openGraph: {
    title: 'Sensor Technology - Smart Kitchen NB-IoT Temperature Sensors',
    description: 'NB-IoT temperature sensors with ±0.3°C accuracy, 5+ year battery life, IP67 rating. Real-time kitchen monitoring for UAE commercial food safety.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function SensorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



