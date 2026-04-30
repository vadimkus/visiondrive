'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { useLanguage } from '../../contexts/LanguageContext'

function SkipToContent() {
  const { publicLanguage } = useLanguage()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
    >
      {publicLanguage === 'ru' ? 'Перейти к основному содержимому' : 'Skip to main content'}
    </a>
  )
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname?.startsWith('/portal')
  const isClinic = pathname?.startsWith('/clinic')
  const isLogin = pathname === '/login'

  if (!pathname) {
    return <main id="main-content" className="flex-1 min-h-screen">{children}</main>
  }

  if (isPortal || isClinic || isLogin) {
    return <main id="main-content" className="min-h-screen w-full min-w-0 flex-1 overflow-x-hidden">{children}</main>
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

