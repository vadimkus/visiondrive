import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { LanguageProvider } from './contexts/LanguageContext'
import ConditionalLayout from './components/layout/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Vision Drive - Smart Parking Solutions for the UAE',
  description: 'Revolutionizing urban mobility in the UAE with cutting-edge, data-driven smart parking solutions. Real-time occupancy and unparalleled convenience.',
  keywords: 'smart parking, UAE, Dubai, parking app, real-time parking, RTA parking solution',
  authors: [{ name: 'Vision Drive Technologies FZ-LLC' }],
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  openGraph: {
    title: 'Vision Drive - Smart Parking Solutions',
    description: 'Guaranteed Parking. Seamless Mobility. Driven by Vision.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <LanguageProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </LanguageProvider>
      </body>
    </html>
  )
}
