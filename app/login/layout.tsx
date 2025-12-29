import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - VisionDrive Portal',
  description: 'Sign in to the VisionDrive management portal. Access sensor data, analytics, and parking management tools.',
  keywords: 'VisionDrive login, portal sign in, parking management login',
  robots: 'noindex, nofollow',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

