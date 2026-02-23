import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - VisionDrive',
  description: 'VisionDrive privacy policy. Learn how we collect, use, and protect your data in compliance with UAE data protection regulations.',
  keywords: 'privacy policy, data protection, VisionDrive privacy, UAE data privacy',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'VisionDrive Privacy Policy',
    description: 'Our commitment to protecting your privacy and data.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



