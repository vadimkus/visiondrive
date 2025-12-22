import { Suspense } from 'react'
import TenantsAdminClient from './TenantsAdminClient'

export default function TenantsAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <TenantsAdminClient />
    </Suspense>
  )
}


