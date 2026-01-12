import { ReactNode } from 'react'
import OwnerSidebar from './components/OwnerSidebar'
import OwnerHeader from './components/OwnerHeader'

export const metadata = {
  title: "Abdul's Kitchen - VisionDrive Smart Kitchen",
  description: 'Temperature monitoring and food safety compliance dashboard',
}

export default function KitchenOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
