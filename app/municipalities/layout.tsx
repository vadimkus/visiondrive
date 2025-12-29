import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Parking for Municipalities - VisionDrive UAE',
  description: 'Smart parking solutions for UAE municipalities. Reduce traffic, lower emissions, increase revenue with NB-IoT parking sensors and real-time data.',
  keywords: 'municipal parking, city parking solution, government parking, traffic reduction, smart city parking UAE',
  openGraph: {
    title: 'Smart Parking for UAE Municipalities',
    description: 'Data-driven parking management for cities and government authorities.',
    type: 'website',
  },
}

export default function MunicipalitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

