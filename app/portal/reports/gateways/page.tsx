import { Suspense } from 'react'
import GatewayReportsClient from './GatewayReportsClient'

export default function GatewayReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <GatewayReportsClient />
    </Suspense>
  )
}



