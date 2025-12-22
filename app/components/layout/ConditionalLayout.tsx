'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith('/portal')

  if (isPortal) {
    // Portal pages: no header/footer, full screen (portal has its own navigation)
    return <main className="flex-1 min-h-screen">{children}</main>
  }

  // Public pages (including login): show header and footer
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}

