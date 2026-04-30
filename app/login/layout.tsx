import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Sign in — Workspace',
  description:
    'VisionDrive workspace — practice operations, made clear. Secure sign-in for authorized team members.',
  robots: { index: false, follow: false },
  themeColor: '#f5f5f7',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VisionDrive Practice',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}



