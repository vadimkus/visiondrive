import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Budget & Pricing - VisionDrive Smart Parking',
  description: 'VisionDrive smart parking deployment costs and pricing models. Transparent budgeting for NB-IoT sensor deployments in the UAE.',
  keywords: 'parking sensor pricing, smart parking cost, IoT deployment budget, VisionDrive pricing',
  alternates: { canonical: '/budget' },
  openGraph: {
    title: 'VisionDrive Budget & Pricing',
    description: 'Transparent pricing for smart parking deployments.',
    type: 'website',
  },
}

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



