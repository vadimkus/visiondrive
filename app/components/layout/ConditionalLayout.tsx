'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith('/portal')
  const isAuth = pathname === '/login'

  // In dev/HMR, `usePathname()` can be briefly undefined during the first paint.
  // Avoid mounting the marketing header/footer in that transient state (it triggers /api/auth/me).
  if (!pathname) {
    return <main className="flex-1 min-h-screen">{children}</main>
  }

  if (isPortal) {
    // Portal pages: no marketing header/footer. Portal has its own navigation.
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

