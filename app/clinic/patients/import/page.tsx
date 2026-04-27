'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type ImportRow = {
  rowNumber: number
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  homeAddress: string | null
  area: string | null
  accessNotes: string | null
  category: string | null
  tags: string[]
  internalNotes: string | null
  errors: string[]
  duplicateReason: string | null
}

type ImportSummary = {
  total: number
  valid: number
  importable: number
  duplicates: number
  invalid: number
  created?: number
  skipped?: number
}

function errorLabel(t: ReturnType<typeof useClinicLocale>['t'], code: string) {
  if (code === 'name_missing') return t.importErrorNameMissing
  if (code === 'dob_missing') return t.importErrorDobMissing
  if (code === 'contact_missing') return t.importErrorContactMissing
  if (code === 'email_invalid') return t.importErrorEmailInvalid
  return code
}

function duplicateLabel(t: ReturnType<typeof useClinicLocale>['t'], code: string | null) {
  if (!code) return ''
  if (code === 'existing_email') return t.importDuplicateExistingEmail
  if (code === 'existing_phone') return t.importDuplicateExistingPhone
  if (code === 'file_email') return t.importDuplicateFileEmail
  if (code === 'file_phone') return t.importDuplicateFilePhone
  return code
}

export default function PatientImportPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function preview() {
    if (!file) {
      setError(t.importChooseFileFirst)
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.set('file', file)
      const res = await fetch('/api/clinic/patients/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.importPreviewFailed)
        return
      }
      setRows(data.rows || [])
      setSummary(data.summary || null)
      setTruncated(Boolean(data.truncated))
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  async function commit() {
    if (rows.length === 0) return
    setCommitting(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/clinic/patients/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'commit', rows }),
      })
      if (res.status === 401) {
        router.replace('/login')
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.importCommitFailed)
        return
      }
      setSummary(data.summary || null)
      setSuccess(t.importComplete.replace('{count}', String(data.summary?.created ?? 0)))
      router.refresh()
    } catch {
      setError(t.networkError)
    } finally {
      setCommitting(false)
    }
  }

  const canCommit = Boolean(summary?.importable)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/clinic/patients" className="text-sm text-orange-600 hover:text-orange-700">
          {t.backPatients}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{t.importPatients}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.importPatientsIntro}</p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {success && <ClinicAlert variant="success">{success}</ClinicAlert>}
      {truncated && <ClinicAlert variant="warning">{t.importTruncated}</ClinicAlert>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block flex-1 text-sm font-medium text-gray-700">
            {t.importSpreadsheet}
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900"
            />
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={() => void preview()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" aria-hidden />
            {loading ? t.importPreviewing : t.importPreview}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">{t.importAcceptedColumns}</p>
      </section>

      {summary && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label={t.importTotalRows} value={summary.total} />
          <Stat label={t.importReadyRows} value={summary.importable} tone="success" />
          <Stat label={t.importDuplicateRows} value={summary.duplicates} tone="warning" />
          <Stat label={t.importInvalidRows} value={summary.invalid} tone="danger" />
          <Stat label={t.importCreatedRows} value={summary.created ?? 0} />
        </section>
      )}

      {rows.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{t.importPreviewTitle}</h2>
              <p className="text-xs text-gray-500">{t.importPreviewHint}</p>
            </div>
            <button
              type="button"
              disabled={!canCommit || committing}
              onClick={() => void commit()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {committing ? t.importCreating : t.importCreatePatients}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">{t.importRow}</th>
                  <th className="px-4 py-3">{t.patientLabel}</th>
                  <th className="px-4 py-3">{t.dateOfBirth}</th>
                  <th className="px-4 py-3">{t.contact}</th>
                  <th className="px-4 py-3">{t.patientCategory}</th>
                  <th className="px-4 py-3">{t.importStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 200).map((row) => {
                  const hasError = row.errors.length > 0
                  const duplicate = Boolean(row.duplicateReason)
                  return (
                    <tr key={row.rowNumber} className={hasError || duplicate ? 'bg-amber-50/50' : undefined}>
                      <td className="px-4 py-3 text-gray-500">{row.rowNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {[row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ')}
                        </p>
                        {row.homeAddress && <p className="text-xs text-gray-500">{row.homeAddress}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.dateOfBirth || t.emptyValue}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{row.phone || t.emptyValue}</p>
                        {row.email && <p className="text-xs text-gray-500">{row.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{row.category || t.emptyValue}</p>
                        {row.tags.length > 0 && <p className="text-xs text-gray-500">{row.tags.join(', ')}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {hasError ? (
                          <Status tone="danger" text={row.errors.map((code) => errorLabel(t, code)).join(', ')} />
                        ) : duplicate ? (
                          <Status tone="warning" text={duplicateLabel(t, row.duplicateReason)} />
                        ) : (
                          <Status tone="success" text={t.importReady} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 200 && (
            <p className="border-t border-gray-100 p-4 text-xs text-gray-500">{t.importPreviewLimited}</p>
          )}
        </section>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'success' | 'warning' | 'danger'
}) {
  const colors =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-800'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-800'
        : tone === 'danger'
          ? 'bg-red-50 text-red-800'
          : 'bg-white text-gray-900'
  return (
    <div className={`rounded-2xl border border-gray-200 p-4 ${colors}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}

function Status({ tone, text }: { tone: 'success' | 'warning' | 'danger'; text: string }) {
  const colors =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-red-50 text-red-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}>
      {tone !== 'success' && <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
      {text}
    </span>
  )
}
