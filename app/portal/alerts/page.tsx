import { Suspense } from 'react'
import AlertsPageClient from './AlertsPageClient'

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <AlertsPageClient />
    </Suspense>
  )
}



