'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function SensorDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [note, setNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/portal/sensors/${id}`, { credentials: 'include' })
      const json = await res.json()
      if (json.success) setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const run = async () => {
      const me = await fetch('/api/auth/me', { credentials: 'include' })
      if (!me.ok) {
        router.push('/login')
        return
      }
      await load()
    }
    if (id) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const addNote = async () => {
    if (!note.trim()) return
    setNoteSaving(true)
    try {
      const res = await fetch(`/api/portal/sensors/${id}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const json = await res.json()
      if (json.success) {
        setNote('')
        await load()
      }
    } finally {
      setNoteSaving(false)
    }
  }

  if (loading) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading…</div>
      </Section>
    )
  }

  const sensor = data?.sensor

  return (
    <Section className="pt-24 pb-12">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/portal/sensors')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sensors
        </button>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sensor?.devEui}</h1>
              <p className="text-sm text-gray-600">
                {sensor?.siteName || '—'} / {sensor?.zoneName || '—'} / Bay {sensor?.bayCode || '—'}
              </p>
            </div>
            <div className="text-sm text-gray-700">
              <div>Type: <span className="font-semibold">{sensor?.type}</span></div>
              <div>Status: <span className="font-semibold">{sensor?.status}</span></div>
              <div>Last seen: <span className="font-semibold">{sensor?.lastSeen ? new Date(sensor.lastSeen).toLocaleString() : '—'}</span></div>
              <div>Battery: <span className="font-semibold">{typeof sensor?.batteryPct === 'number' ? `${Math.round(sensor.batteryPct)}%` : '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Events</h2>
            <div className="overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Kind</th>
                    <th className="text-left px-3 py-2">Decoded</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.events || []).slice(0, 50).map((e: any, idx: number) => (
                    <tr key={idx} className="border-t border-gray-100 align-top">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{new Date(e.time).toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-700">{e.kind}</td>
                      <td className="px-3 py-2">
                        <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-w-[520px]">
                          {JSON.stringify(e.decoded, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {(data?.events || []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                        No events yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Maintenance Notes</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Add a note (e.g., replaced battery, moved sensor, inspection scheduled)…"
            />
            <button
              onClick={addNote}
              disabled={noteSaving}
              className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {noteSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Note
            </button>

            <div className="mt-4 space-y-3">
              {(data?.notes || []).map((n: any) => (
                <div key={n.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(n.createdAt).toLocaleString()} · {n.authorEmail || 'system'}
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{n.note}</div>
                </div>
              ))}
              {(data?.notes || []).length === 0 && <p className="text-sm text-gray-500">No notes yet</p>}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}


