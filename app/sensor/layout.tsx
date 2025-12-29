import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NB-IoT Parking Sensor - VisionDrive Smart Parking',
  description: 'High-precision NB-IoT parking sensors with 99% accuracy, 5-year battery life, IP68 rating, and dual-mode detection. Perfect for UAE smart city deployments.',
  keywords: 'NB-IoT parking sensor, smart parking sensor, IoT parking detector, parking bay sensor, wireless parking sensor UAE',
  openGraph: {
    title: 'VisionDrive NB-IoT Parking Sensor',
    description: '99% accuracy, 5-year battery life, IP68 protection for smart parking infrastructure.',
    type: 'website',
  },
}

export default function SensorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

