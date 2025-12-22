import { Suspense } from 'react'
import NetworkOverviewClient from './NetworkOverviewClient'

export default function NetworkOverviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <NetworkOverviewClient />
    </Suspense>
  )
}


