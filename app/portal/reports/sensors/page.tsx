import { Suspense } from 'react'
import SensorReportsClient from './SensorReportsClient'

export default function SensorReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <SensorReportsClient />
    </Suspense>
  )
}


