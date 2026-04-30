import PortalNavigation from '../components/portal/PortalNavigation'
import PortalSidebar from '../components/portal/PortalSidebar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
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
