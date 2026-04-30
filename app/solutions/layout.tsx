import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Practice OS Solutions - VisionDrive',
  description: 'Practice operations software for UAE solo practitioners: booking, patient records, mobile notes, payments, inventory, quotes, and follow-up.',
  keywords: 'Practice OS, solo practitioner software, clinic management UAE, appointment scheduling, patient records, treatment notes, payments',
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: 'VisionDrive Practice OS Solutions',
    description: 'Software for solo practitioners to manage appointments, patient records, treatments, payments, and follow-up.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
