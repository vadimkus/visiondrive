import { Suspense } from 'react'
import BaysPageClient from './BaysPageClient'

export default function BaysPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-600">Loading…</div>}>
      <BaysPageClient />
    </Suspense>
  )
}



