import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vision Drive - Smart Parking Solutions for the UAE',
  description: 'Revolutionizing urban mobility in the UAE with cutting-edge, data-driven smart parking solutions. Real-time occupancy and unparalleled convenience.',
  keywords: 'smart parking, UAE, Dubai, parking app, real-time parking, RTA parking solution',
  authors: [{ name: 'Vision Drive Technologies FZ-LLC' }],
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
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
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
