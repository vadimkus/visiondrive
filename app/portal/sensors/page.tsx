import { Suspense } from 'react'
import SensorsPageClient from './SensorsPageClient'

export default function SensorsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <SensorsPageClient />
    </Suspense>
  )
}
