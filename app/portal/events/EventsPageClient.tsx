'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Download } from 'lucide-react'

type EventRow = {
  time: string
  devEui: string
  kind: string
  occupied: boolean | null
  batteryPct: number | null
  rssi: number | null
  snr: number | null
}

export default function EventsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const zoneId = searchParams.get('zoneId') || 'all'
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<EventRow[]>([])
  const [devEui, setDevEui] = useState('')
  const [kind, setKind] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (zoneId) params.set('zoneId', zoneId)
    if (devEui.trim()) params.set('devEui', devEui.trim())
    if (kind.trim()) params.set('kind', kind.trim())
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    params.set('limit', '500')
    const res = await fetch(`/api/portal/events?${params.toString()}`, { credentials: 'include' })
    const json = await res.json()
    if (json.success) setItems(json.items || [])
  }

  useEffect(() => {
    const run = async () => {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      if (!me.ok) {
        router.push('/login')
        return
      }
      await load()
      setLoading(false)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId])

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  const exportUrl = (() => {
    const params = new URLSearchParams()
    if (zoneId) params.set('zoneId', zoneId)
    if (devEui.trim()) params.set('devEui', devEui.trim())
    if (kind.trim()) params.set('kind', kind.trim())
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    params.set('limit', '2000')
    params.set('format', 'csv')
    return `/api/portal/events?${params.toString()}`
  })()

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push(`/portal?zoneId=${encodeURIComponent(zoneId)}`)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-600">Time-series viewer (tenant-scoped) with CSV export.</p>
          </div>
          <a href={exportUrl} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">DevEUI contains</label>
              <input value={devEui} onChange={(e) => setDevEui(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kind</label>
              <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="UPLINK/OVERRIDE…" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start (ISO)</label>
              <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="2025-12-21T00:00:00Z" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End (ISO)</label>
              <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="2025-12-21T23:59:59Z" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="mt-3">
            <button onClick={load} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
              Apply Filters
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">DevEUI</th>
                <th className="text-left px-4 py-3">Kind</th>
                <th className="text-left px-4 py-3">Occupied</th>
                <th className="text-left px-4 py-3">Battery</th>
                <th className="text-left px-4 py-3">RSSI/SNR</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No events
                  </td>
                </tr>
              )}
              {items.map((e) => (
                <tr key={`event-${e.time}-${e.devEui}-${e.kind}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">{new Date(e.time).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.devEui}</td>
                  <td className="px-4 py-3 text-gray-700">{e.kind}</td>
                  <td className="px-4 py-3 text-gray-700">{typeof e.occupied === 'boolean' ? (e.occupied ? 'true' : 'false') : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{typeof e.batteryPct === 'number' ? `${Math.round(e.batteryPct)}%` : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {typeof e.rssi === 'number' ? e.rssi : '—'} / {typeof e.snr === 'number' ? e.snr : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}



