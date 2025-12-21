import { Suspense } from 'react'
import EventsPageClient from './EventsPageClient'

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-600">Loading…</div>}>
      <EventsPageClient />
    </Suspense>
  )
}
