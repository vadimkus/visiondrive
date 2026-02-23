import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Municipality Solutions - Dubai Municipality Food Safety Compliance',
  description: 'Smart kitchen temperature monitoring for UAE municipalities. Help food businesses achieve Dubai Municipality compliance with automated reporting and real-time alerts.',
  keywords: 'Dubai Municipality compliance, food safety monitoring, municipal kitchen inspection, UAE food regulation, smart kitchen government',
  alternates: { canonical: '/municipalities' },
  openGraph: {
    title: 'Municipality Solutions - Dubai Municipality Food Safety Compliance',
    description: 'Smart kitchen temperature monitoring for UAE municipalities. Help food businesses achieve Dubai Municipality compliance with automated reporting and real-time alerts.',
    type: 'website',
    locale: 'en_AE',
    siteName: 'VisionDrive',
  },
}

export default function MunicipalitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



