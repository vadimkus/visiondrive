import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Sign In - Smart Kitchen',
  description: 'Sign in to your VisionDrive Smart Kitchen portal. Access temperature monitoring, compliance reports, and alerts.',
  robots: { index: false, follow: false },
  themeColor: '#f5f5f7',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Kitchen',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



