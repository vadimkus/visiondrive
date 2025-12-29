'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Section from '../../../components/common/Section'
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react'

interface SensorEvent {
  time: string;
  kind: string;
  decoded: Record<string, unknown>;
}

interface SensorAlert {
  id: string;
  severity: string;
  type: string;
  slaDueAt: string | null;
}

interface SensorNote {
  id: string;
  createdAt: string;
  authorEmail: string | null;
  note: string;
}

interface SensorHealth {
  rssi?: number | null;
  snr?: number | null;
  spreadingFactor?: number | null;
  daysInUse?: number | null;
  score?: number | null;
  batteryDrainPerDay7d?: number | null;
  uplinkCount7d?: number | null;
  stateFlipCount7d?: number | null;
  staleEventRatio7d?: number | null;
  avgRssi24h?: number | null;
  avgSnr24h?: number | null;
  signalSamples24h?: number | null;
  [key: string]: number | null | undefined;
}

interface SensorData {
  success: boolean;
  sensor: {
    id: string;
    devEui: string;
    type?: string | null;
    status?: string | null;
    bayCode: string | null;
    siteName: string | null;
    zoneName: string | null;
    lastSeen: string | null;
    batteryPct: number | null;
    confidence: number | null;
    occupied: boolean | null;
    health?: SensorHealth | null;
  } | null;
  events: SensorEvent[];
  notes: SensorNote[];
  alerts: SensorAlert[];
}

function fmtDue(iso: string | null) {
  if (!iso) return '—'
  const ms = new Date(iso).getTime() - Date.now()
  const m = Math.ceil(ms / 60000)
  if (m <= 0) return `overdue`
  if (m < 60) return `${m}m`
  const h = Math.ceil(m / 60)
  if (h < 48) return `${h}h`
  const d = Math.ceil(h / 24)
  return `${d}d`
}

export default function SensorDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SensorData | null>(null)
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
  const health = sensor?.health || {}
  const alerts = data?.alerts || []

  return (
    <Section className="pt-6 pb-12">
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
              <div>Days in use: <span className="font-semibold">{typeof health?.daysInUse === 'number' ? health.daysInUse : '—'}</span></div>
              <div>Health score: <span className="font-semibold">{typeof health?.score === 'number' ? health.score : '—'}</span></div>
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500">Battery drain (7d)</div>
              <div className="font-semibold text-gray-900">
                {typeof health?.batteryDrainPerDay7d === 'number' ? `${health.batteryDrainPerDay7d.toFixed(2)}%/day` : '—'}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500">Signal (avg 24h)</div>
              <div className="font-semibold text-gray-900">
                RSSI {typeof health?.avgRssi24h === 'number' ? health.avgRssi24h.toFixed(1) : '—'} / SNR {typeof health?.avgSnr24h === 'number' ? health.avgSnr24h.toFixed(1) : '—'}
              </div>
              <div className="text-xs text-gray-500">Samples: {health?.signalSamples24h ?? 0}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500">Last signal</div>
              <div className="font-semibold text-gray-900">
                RSSI {typeof health?.lastRssi === 'number' ? health.lastRssi : '—'} / SNR {typeof health?.lastSnr === 'number' ? health.lastSnr : '—'}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500">Flapping</div>
              <div className="font-semibold text-gray-900">{health?.flapChanges ?? 0} changes</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-orange-600" />
                Active Alerts
              </h2>
              <button
                onClick={() => router.push(`/portal/alerts?sensorId=${encodeURIComponent(sensor?.id || '')}`)}
                className="text-xs text-primary-700 hover:underline"
              >
                Open in Alerts
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {alerts.length === 0 && <span className="text-sm text-gray-500">No active alerts</span>}
              {alerts.map((a: SensorAlert) => (
                <span key={a.id} className="px-3 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-800">
                  <span className="font-semibold">{a.severity}</span> · {a.type} · due {fmtDue(a.slaDueAt)}
                </span>
              ))}
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
                  {(data?.events || []).slice(0, 50).map((e: SensorEvent) => (
                    <tr key={`event-${e.time}-${e.kind}`} className="border-t border-gray-100 align-top">
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
              {(data?.notes || []).map((n: SensorNote) => (
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


