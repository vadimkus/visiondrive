import { Suspense } from 'react'
import PortalPageClient from './PortalPageClient'

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <PortalPageClient />
    </Suspense>
  )
}

