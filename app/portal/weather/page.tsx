import { Suspense } from 'react'
import WeatherPageClient from './WeatherPageClient'

export default function WeatherPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-600">Loading…</div>}>
      <WeatherPageClient />
    </Suspense>
  )
}


