'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { ArrowLeft, FlaskConical, AlertTriangle, Loader2 } from 'lucide-react'

type Tab = 'bench' | 'deadletters'

type DeadLetterItem = {
  id: string
  fileId: string
  filename: string
  rowIndex: number | null
  reason: string
  raw: any
  createdAt: string
}

export default function ReplayToolsPage() {
  const router = useRouter()
  const [loadingUser, setLoadingUser] = useState(true)
  const [tab, setTab] = useState<Tab>('bench')

  // Decoder bench state
  const [devEui, setDevEui] = useState('ABCDEF0000000001')
  const [sensorType, setSensorType] = useState<'PARKING' | 'WEATHER' | 'OTHER'>('PARKING')
  const [rawPayload, setRawPayload] = useState('01 64')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveResult, setSaveResult] = useState<any>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Dead letters state
  const [deadLetters, setDeadLetters] = useState<DeadLetterItem[]>([])
  const [deadLettersTotal, setDeadLettersTotal] = useState(0)
  const [deadLettersLoading, setDeadLettersLoading] = useState(false)
  const [q, setQ] = useState('')

  const normalizedRawPayload = useMemo(() => rawPayload.replace(/\s+/g, '').trim(), [rawPayload])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) {
          router.push('/login')
          return
        }
      } catch {
        router.push('/login')
        return
      } finally {
        setLoadingUser(false)
      }
    }
    checkAuth()
  }, [router])

  const runPreview = async () => {
    setPreviewError(null)
    setPreview(null)
    setSaveResult(null)
    setSaveError(null)
    setPreviewLoading(true)
    try {
      const res = await fetch('/api/replay/bench/preview', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sensorType, rawPayload: normalizedRawPayload }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Preview failed')
      setPreview(json.preview)
    } catch (e: any) {
      setPreviewError(e?.message || 'Preview failed')
    } finally {
      setPreviewLoading(false)
    }
  }

  const runSave = async () => {
    setSaveError(null)
    setSaveResult(null)
    setSaveLoading(true)
    try {
      const res = await fetch('/api/replay/bench/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ devEui, sensorType, rawPayload: normalizedRawPayload, time: new Date().toISOString() }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Save failed')
      setSaveResult(json.saved)
    } catch (e: any) {
      setSaveError(e?.message || 'Save failed')
    } finally {
      setSaveLoading(false)
    }
  }

  const fetchDeadLetters = async () => {
    setDeadLettersLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      params.set('limit', '50')
      params.set('offset', '0')
      const res = await fetch(`/api/replay/dead-letters?${params.toString()}`, { credentials: 'include' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load dead letters')
      setDeadLetters(json.items || [])
      setDeadLettersTotal(json.total || 0)
    } catch {
      setDeadLetters([])
      setDeadLettersTotal(0)
    } finally {
      setDeadLettersLoading(false)
    }
  }

  useEffect(() => {
    if (tab !== 'deadletters') return
    fetchDeadLetters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  if (loadingUser) {
    return (
      <Section className="pt-32 pb-12">
        <div className="text-center text-gray-600">Loading...</div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Replay & Decoder Tools</h1>
          <p className="text-gray-600">Use simulated events to develop the portal before gateways arrive.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('bench')}
            className={`inline-flex items-center px-4 py-2 rounded-lg border ${
              tab === 'bench' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            Decoder Bench
          </button>
          <button
            onClick={() => setTab('deadletters')}
            className={`inline-flex items-center px-4 py-2 rounded-lg border ${
              tab === 'deadletters' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Dead Letters
          </button>
        </div>

        {tab === 'bench' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Paste payload → preview → save event</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DevEUI</label>
                <input
                  value={devEui}
                  onChange={(e) => setDevEui(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="ABCDEF..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensor Type</label>
                <select
                  value={sensorType}
                  onChange={(e) => setSensorType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="PARKING">PARKING</option>
                  <option value="WEATHER">WEATHER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={runPreview}
                  disabled={previewLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 w-full"
                >
                  {previewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Preview
                </button>
                <button
                  onClick={runSave}
                  disabled={saveLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 w-full"
                >
                  {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Raw Payload (JSON or HEX)</label>
              <textarea
                value={rawPayload}
                onChange={(e) => setRawPayload(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                rows={6}
                placeholder='{"occupied":false,"batteryPct":90}  OR  0164'
              />
              <p className="text-xs text-gray-500 mt-1">Spaces are ignored for HEX. JSON is parsed as-is.</p>
            </div>

            {previewError && <p className="text-sm text-red-600 mb-3">{previewError}</p>}
            {preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Preview</p>
                <pre className="text-xs overflow-auto">{JSON.stringify(preview, null, 2)}</pre>
              </div>
            )}

            {saveError && <p className="text-sm text-red-600 mb-3">{saveError}</p>}
            {saveResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">Saved</p>
                <pre className="text-xs overflow-auto">{JSON.stringify(saveResult, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {tab === 'deadletters' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dead Letters</h2>
                <p className="text-sm text-gray-600">Invalid payloads / validation failures from uploads.</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Search reason..."
                />
                <button
                  onClick={fetchDeadLetters}
                  disabled={deadLettersLoading}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                >
                  {deadLettersLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Refresh
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">Total: {deadLettersTotal}</p>

            <div className="overflow-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">File</th>
                    <th className="text-left px-3 py-2">Row</th>
                    <th className="text-left px-3 py-2">Reason</th>
                    <th className="text-left px-3 py-2">Raw</th>
                  </tr>
                </thead>
                <tbody>
                  {deadLetters.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                        {deadLettersLoading ? 'Loading…' : 'No dead letters found'}
                      </td>
                    </tr>
                  )}
                  {deadLetters.map((d) => (
                    <tr key={d.id} className="border-t border-gray-100 align-top">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{new Date(d.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2 text-gray-700">{d.filename}</td>
                      <td className="px-3 py-2 text-gray-700">{d.rowIndex ?? '-'}</td>
                      <td className="px-3 py-2 text-red-700">{d.reason}</td>
                      <td className="px-3 py-2">
                        <details>
                          <summary className="cursor-pointer text-gray-700">View</summary>
                          <pre className="text-xs mt-2 bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-w-[600px]">
                            {JSON.stringify(d.raw, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}


