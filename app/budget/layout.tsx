import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing & Budget - Smart Kitchen Monitoring Solutions',
  description: 'VisionDrive smart kitchen monitoring costs and flexible pricing. Transparent budgeting for NB-IoT temperature sensor deployments in UAE commercial kitchens.',
  keywords: 'smart kitchen pricing, temperature monitoring cost, IoT kitchen deployment budget, VisionDrive pricing',
  alternates: { canonical: '/budget' },
  openGraph: {
    title: 'Pricing & Budget - Smart Kitchen Monitoring Solutions',
    description: 'VisionDrive smart kitchen monitoring costs and flexible pricing. Transparent budgeting for NB-IoT temperature sensor deployments in UAE commercial kitchens.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



