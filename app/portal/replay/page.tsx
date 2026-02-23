'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '../../components/common/Section'
import { 
  FlaskConical, 
  AlertTriangle, 
  Loader2,
  Play,
  Save,
  Search,
  FileCode,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Code2,
  Zap
} from 'lucide-react'

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
  const [sensorType, setSensorType] = useState<'TEMPERATURE' | 'WEATHER' | 'OTHER'>('TEMPERATURE')
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
      <Section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-3" />
          <span className="text-gray-600 text-lg">Loading replay tools...</span>
        </div>
      </Section>
    )
  }

  return (
    <Section className="pt-6 pb-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Replay & Decoder Tools</h1>
          <p className="text-gray-600">Test payload decoding and review failed data ingestion events</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('bench')}
            className={`inline-flex items-center px-6 py-3 rounded-xl border-2 font-medium transition-all ${
              tab === 'bench' 
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <FlaskConical className="h-5 w-5 mr-2" />
            Decoder Bench
          </button>
          <button
            onClick={() => setTab('deadletters')}
            className={`inline-flex items-center px-6 py-3 rounded-xl border-2 font-medium transition-all ${
              tab === 'deadletters' 
                ? 'bg-orange-600 text-white border-orange-600 shadow-lg' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            Dead Letters ({deadLettersTotal})
          </button>
        </div>

        {tab === 'bench' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FlaskConical className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Decoder Bench</h2>
                  <p className="text-sm text-gray-600">Test payload decoding and simulate sensor events</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-gray-500" />
                    DevEUI
                  </label>
                  <input
                    value={devEui}
                    onChange={(e) => setDevEui(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="ABCDEF0000000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-500" />
                    Sensor Type
                  </label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="TEMPERATURE">TEMPERATURE</option>
                    <option value="WEATHER">WEATHER</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={runPreview}
                    disabled={previewLoading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg font-medium"
                  >
                    {previewLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Eye className="h-5 w-5 mr-2" />
                    )}
                    Preview
                  </button>
                  <button
                    onClick={runSave}
                    disabled={saveLoading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-all shadow-lg font-medium"
                  >
                    {saveLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Save
                  </button>
                </div>
              </div>

              {/* Payload Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-gray-500" />
                  Raw Payload (JSON or HEX)
                </label>
                <textarea
                  value={rawPayload}
                  onChange={(e) => setRawPayload(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  rows={8}
                  placeholder='{"occupied":false,"batteryPct":90}  OR  0164'
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Spaces are ignored for HEX. JSON is parsed as-is.
                </p>
              </div>

              {/* Preview Error */}
              {previewError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Preview Error</p>
                    <p className="text-sm text-red-800 mt-1">{previewError}</p>
                  </div>
                </div>
              )}

              {/* Preview Result */}
              {preview && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <p className="font-semibold text-blue-900">Decoded Preview</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <pre className="text-sm overflow-auto font-mono bg-white p-4 rounded-lg border border-blue-200">
                      {JSON.stringify(preview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Save Error */}
              {saveError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Save Error</p>
                    <p className="text-sm text-red-800 mt-1">{saveError}</p>
                  </div>
                </div>
              )}

              {/* Save Result */}
              {saveResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 border-b border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-900">Event Saved Successfully</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <pre className="text-sm overflow-auto font-mono bg-white p-4 rounded-lg border border-green-200">
                      {JSON.stringify(saveResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'deadletters' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dead Letters</h2>
                    <p className="text-sm text-gray-600">Failed payloads and validation errors from data ingestion</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-orange-600">{deadLettersTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchDeadLetters()}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="Search by reason..."
                  />
                </div>
                <button
                  onClick={fetchDeadLetters}
                  disabled={deadLettersLoading}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 transition-all shadow-lg font-medium"
                >
                  {deadLettersLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-2" />
                  )}
                  Refresh
                </button>
              </div>

              {/* Dead Letters Table */}
              <div className="overflow-auto border border-gray-200 rounded-xl">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Time
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4" />
                          File
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Row</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Reason
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">Raw Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deadLettersLoading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-3" />
                          <p className="text-gray-600">Loading dead letters...</p>
                        </td>
                      </tr>
                    )}
                    {!deadLettersLoading && deadLetters.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No dead letters found</p>
                          <p className="text-sm text-gray-400 mt-1">All payloads processed successfully!</p>
                        </td>
                      </tr>
                    )}
                    {!deadLettersLoading && deadLetters.map((d) => (
                      <tr key={d.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(d.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-900">
                            {d.filename}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{d.rowIndex ?? '—'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {d.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              View JSON
                            </summary>
                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-[600px]">
                              <pre className="text-xs overflow-auto font-mono">
                                {JSON.stringify(d.raw, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}


