import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Parking Solutions - VisionDrive NB-IoT Technology',
  description: 'Enterprise-grade NB-IoT parking sensors for UAE municipalities. Bay-level occupancy data, UAE data residency, TDRA compliance, and government API integration.',
  keywords: 'smart parking solutions, NB-IoT parking sensors, UAE parking technology, municipal parking system, RTA parking solution, IoT parking infrastructure',
  openGraph: {
    title: 'VisionDrive Smart Parking Solutions',
    description: 'NB-IoT parking sensors for bay-level ground truth occupancy data with UAE data residency compliance.',
    type: 'website',
  },
}

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

