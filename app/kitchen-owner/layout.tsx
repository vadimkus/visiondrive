import { ReactNode } from 'react'
import OwnerSidebar from './components/OwnerSidebar'
import OwnerHeader from './components/OwnerHeader'
import MobileHeader from './components/MobileHeader'
import MobileNav from './components/MobileNav'
import AuthGuard from './components/AuthGuard'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'

export const metadata = {
  title: "Abdul's Kitchen - VisionDrive Smart Kitchen",
  description: 'Temperature monitoring and food safety compliance dashboard',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1d1f' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Kitchen',
  },
}

export default function KitchenOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthGuard>
          <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#1a1a1a] transition-colors duration-300">
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block">
              <OwnerSidebar />
            </div>
            
            <div className="flex-1 flex flex-col min-w-0">
              {/* Desktop Header - hidden on mobile */}
              <div className="hidden md:block">
                <OwnerHeader />
              </div>
              
              {/* Mobile Header - shown only on mobile */}
              <MobileHeader />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto pb-20 md:pb-0">
                {children}
              </main>
              
              {/* Mobile Bottom Navigation - shown only on mobile */}
              <MobileNav />
            </div>
          </div>
        </AuthGuard>
      </SettingsProvider>
    </ThemeProvider>
  )
}
