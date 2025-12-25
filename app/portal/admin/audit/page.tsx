import { Suspense } from 'react'
import AuditClient from './AuditClient'

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-12 text-center text-gray-600">Loading audit…</div>}>
      <AuditClient />
    </Suspense>
  )
}



