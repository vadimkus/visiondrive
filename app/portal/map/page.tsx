import { Suspense } from 'react'
import PortalMapPageClient from './MapPageClient'

export default function PortalMapPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <PortalMapPageClient />
    </Suspense>
  )
}
