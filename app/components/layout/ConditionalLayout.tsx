'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
    >
      Skip to main content
    </a>
  )
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith('/portal')
  const isKitchenOwner = pathname?.startsWith('/kitchen-owner')
  const isLogin = pathname === '/login'

  if (!pathname) {
    return <main id="main-content" className="flex-1 min-h-screen">{children}</main>
  }

  if (isPortal || isKitchenOwner || isLogin) {
    return <main id="main-content" className="flex-1 min-h-screen">{children}</main>
  }

  return (
    <>
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  )
}

