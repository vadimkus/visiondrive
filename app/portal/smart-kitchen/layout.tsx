import KitchenSidebar from './components/KitchenSidebar'
import KitchenHeader from './components/KitchenHeader'

export default function SmartKitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
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
