'use client'

import { usePathname } from 'next/navigation'
import KitchenSidebar from './components/KitchenSidebar'
import KitchenHeader from './components/KitchenHeader'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme()
  
  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#f5f5f7]'}`}>
      <KitchenSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <KitchenHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function SmartKitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Owner portal has its own layout - no sidebar/header
  if (pathname?.startsWith('/portal/smart-kitchen/owner')) {
    return <>{children}</>
  }
  
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  )
}
