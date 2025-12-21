'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, Search } from 'lucide-react'

type SensorItem = {
  id: string
  devEui: string
  type: string
  status: string
  bayCode: string | null
  lastSeen: string | null
  batteryPct: number | null
  healthScore: number
}

export default function SensorsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SensorItem[]>([])
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return items
    return items.filter((s) => s.devEui.toLowerCase().includes(t))
  }, [items, q])

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) {
          router.push('/login')
          return
        }
        const res = await fetch('/api/portal/sensors', { credentials: 'include' })
        const json = await res.json()
        if (json.success) setItems(json.items || [])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [router])

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  return (
    <Section className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => router.push('/portal')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sensors</h1>
            <p className="text-sm text-gray-600">Fleet view: health score, last seen, battery.</p>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search DevEUI…"
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-auto shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">DevEUI</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Bay</th>
                <th className="text-left px-4 py-3">Last seen</th>
                <th className="text-left px-4 py-3">Battery</th>
                <th className="text-left px-4 py-3">Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No sensors found
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/portal/sensors/${s.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{s.devEui}</td>
                  <td className="px-4 py-3 text-gray-700">{s.type}</td>
                  <td className="px-4 py-3 text-gray-700">{s.bayCode || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{s.lastSeen ? new Date(s.lastSeen).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {typeof s.batteryPct === 'number' ? `${Math.round(s.batteryPct)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                        s.healthScore >= 80
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : s.healthScore >= 50
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {s.healthScore}
                    </span>
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


