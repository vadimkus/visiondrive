import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Kitchen Solutions - VisionDrive Temperature Monitoring',
  description: 'Enterprise-grade NB-IoT temperature sensors for commercial kitchens. Real-time monitoring, danger zone alerts, and Dubai Municipality compliance reporting.',
  keywords: 'smart kitchen solutions, temperature monitoring, food safety sensors, Dubai Municipality compliance, commercial kitchen IoT, restaurant temperature monitoring',
  openGraph: {
    title: 'VisionDrive Smart Kitchen Solutions',
    description: 'Temperature monitoring sensors for commercial kitchens with real-time alerts and compliance reporting.',
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
