import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Partners - VisionDrive UAE Government Partnerships',
  description: 'VisionDrive partners with UAE government entities including RTA, SRTA, Parkin, ITC Abu Dhabi, and TDRA for smart parking infrastructure deployment.',
  keywords: 'VisionDrive partners, RTA partnership, UAE government parking, SRTA, Parkin, ITC Abu Dhabi, smart city partners',
  openGraph: {
    title: 'VisionDrive Government Partners',
    description: 'Working with UAE authorities to deploy smart parking infrastructure across the Emirates.',
    type: 'website',
  },
}

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



