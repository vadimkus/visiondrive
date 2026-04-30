import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { LanguageProvider } from './contexts/LanguageContext'
import ConditionalLayout from './components/layout/ConditionalLayout'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import OrganizationSchema from './components/schema/OrganizationSchema'
import LocalBusinessSchema from './components/schema/LocalBusinessSchema'
import WebSiteSchema from './components/schema/WebSiteSchema'
import PracticeSoftwareSchema from './components/schema/PracticeSoftwareSchema'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f97316',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://visiondrive.ae'),
  title: {
    default: 'VisionDrive — Practice software for solo practitioners',
    template: '%s | VisionDrive',
  },
  description:
    'Practice operations, made clear. VisionDrive builds professional practice software for solo practitioners — bookings, records, treatment notes, inventory, payments, and reporting from anywhere.',
  keywords:
    'solo practitioner software, practice management software, professional practice software, VisionDrive, appointment software, private practice operations',
  authors: [{ name: 'Vision Drive Technologies FZ-LLC' }],
  creator: 'Vision Drive Technologies FZ-LLC',
  publisher: 'Vision Drive Technologies FZ-LLC',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
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
    title: 'VisionDrive — Practice software for solo practitioners',
    description:
      'Practice operations, made clear. Commercial-grade tools for solo practitioners — bookings to payments.',
    type: 'website',
    url: 'https://visiondrive.ae',
    siteName: 'VisionDrive',
    locale: 'en',
    images: [
      {
        url: '/favicon/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'VisionDrive — Practice software for solo practitioners',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'VisionDrive — Practice software for solo practitioners',
    description:
      'Practice operations, made clear. Software for solo practitioners — bookings, records, inventory, payments, and reporting.',
    images: ['/favicon/android-chrome-512x512.png'],
  },
  other: {
    'geo.region': 'AE',
    'geo.placename': 'Ras Al Khaimah',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'VisionDrive',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
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
        <OrganizationSchema />
        <LocalBusinessSchema />
        <WebSiteSchema />
        <PracticeSoftwareSchema />
        <LanguageProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
