'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith('/portal')
  const isKitchenOwner = pathname?.startsWith('/kitchen-owner')
  const isAuth = pathname === '/login'

  // In dev/HMR, `usePathname()` can be briefly undefined during the first paint.
  // Avoid mounting the marketing header/footer in that transient state (it triggers /api/auth/me).
  if (!pathname) {
    return <main className="flex-1 min-h-screen">{children}</main>
  }

  if (isPortal || isKitchenOwner) {
    // Portal pages and kitchen owner: no marketing header/footer
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

