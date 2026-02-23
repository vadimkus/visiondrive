'use client'

import { usePathname } from 'next/navigation'
import PortalNavigation from '../components/portal/PortalNavigation'
import PortalSidebar from '../components/portal/PortalSidebar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Smart Kitchen has its own dedicated layout
  const isKitchenPortal = pathname.startsWith('/portal/smart-kitchen')
  
  if (isKitchenPortal) {
    return <>{children}</>
  }

  // Portal layout: full screen with top navigation and left sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PortalSidebar />
      <div className="flex-1 flex flex-col">
        <PortalNavigation />
        <div className="flex-1 pb-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
