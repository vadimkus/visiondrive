import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - VisionDrive Smart Parking Questions',
  description: 'Frequently asked questions about VisionDrive smart parking solutions. Learn about NB-IoT sensors, installation, pricing, and UAE compliance.',
  keywords: 'VisionDrive FAQ, smart parking questions, parking sensor FAQ, NB-IoT FAQ, UAE parking solutions questions',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'VisionDrive FAQ',
    description: 'Answers to common questions about smart parking solutions.',
    type: 'website',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



