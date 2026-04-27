'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'

type ProductImportRow = {
  rowNumber: number
  name: string
  sku: string | null
  barcode: string | null
  unit: string
  initialQuantity: number
  reorderPoint: number
  consumePerVisit: number
  procedureName: string | null
  procedureId: string | null
  supplier: string | null
  unitCost: string | null
  notes: string | null
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
  if (code === 'name_missing') return t.productImportErrorNameMissing
  if (code === 'unit_missing') return t.productImportErrorUnitMissing
  if (code === 'procedure_not_found') return t.productImportErrorProcedureNotFound
  return code
}

function duplicateLabel(t: ReturnType<typeof useClinicLocale>['t'], code: string | null) {
  if (!code) return ''
  if (code === 'existing_barcode') return t.productImportDuplicateExistingBarcode
  if (code === 'existing_sku') return t.productImportDuplicateExistingSku
  if (code === 'existing_name') return t.productImportDuplicateExistingName
  if (code === 'file_barcode') return t.productImportDuplicateFileBarcode
  if (code === 'file_sku') return t.productImportDuplicateFileSku
  if (code === 'file_name') return t.productImportDuplicateFileName
  return code
}

export default function ProductImportPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ProductImportRow[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function preview() {
    if (!file) {
      setError(t.productImportChooseFileFirst)
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const formData = new FormData()
      formData.set('file', file)
      const res = await fetch('/api/clinic/inventory/import', {
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
        setError(data.error || t.productImportPreviewFailed)
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
      const res = await fetch('/api/clinic/inventory/import', {
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
        setError(data.error || t.productImportCommitFailed)
        return
      }
      setSummary(data.summary || null)
      setSuccess(t.productImportComplete.replace('{count}', String(data.summary?.created ?? 0)))
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
        <Link href="/clinic/inventory" className="text-sm text-orange-600 hover:text-orange-700">
          ← {t.inventory}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{t.productImportTitle}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.productImportIntro}</p>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {success && <ClinicAlert variant="success">{success}</ClinicAlert>}
      {truncated && <ClinicAlert variant="warning">{t.productImportTruncated}</ClinicAlert>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block flex-1 text-sm font-medium text-gray-700">
            {t.productImportSpreadsheet}
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
            {loading ? t.productImportPreviewing : t.productImportPreview}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">{t.productImportAcceptedColumns}</p>
      </section>

      {summary && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label={t.productImportTotalRows} value={summary.total} />
          <Stat label={t.productImportReadyRows} value={summary.importable} tone="success" />
          <Stat label={t.productImportDuplicateRows} value={summary.duplicates} tone="warning" />
          <Stat label={t.productImportInvalidRows} value={summary.invalid} tone="danger" />
          <Stat label={t.productImportCreatedRows} value={summary.created ?? 0} />
        </section>
      )}

      {rows.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{t.productImportPreviewTitle}</h2>
              <p className="text-xs text-gray-500">{t.productImportPreviewHint}</p>
            </div>
            <button
              type="button"
              disabled={!canCommit || committing}
              onClick={() => void commit()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {committing ? t.productImportCreating : t.productImportCreateItems}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">{t.productImportRow}</th>
                  <th className="px-4 py-3">{t.stockItemName}</th>
                  <th className="px-4 py-3">{t.stockSku}</th>
                  <th className="px-4 py-3">{t.stockOnHand}</th>
                  <th className="px-4 py-3">{t.stockReorderPoint}</th>
                  <th className="px-4 py-3">{t.inventoryProcedureCol}</th>
                  <th className="px-4 py-3">{t.productImportStatus}</th>
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
                        <p className="font-semibold text-gray-900">{row.name || t.emptyValue}</p>
                        {row.supplier && <p className="text-xs text-gray-500">{row.supplier}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{row.sku || t.emptyValue}</p>
                        {row.barcode && <p className="text-xs text-gray-500">{row.barcode}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.initialQuantity} {row.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.reorderPoint}</td>
                      <td className="px-4 py-3 text-gray-600">{row.procedureName || t.emptyValue}</td>
                      <td className="px-4 py-3">
                        {hasError ? (
                          <Status tone="danger" text={row.errors.map((code) => errorLabel(t, code)).join(', ')} />
                        ) : duplicate ? (
                          <Status tone="warning" text={duplicateLabel(t, row.duplicateReason)} />
                        ) : (
                          <Status tone="success" text={t.productImportReady} />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 200 && (
            <p className="border-t border-gray-100 p-4 text-xs text-gray-500">{t.productImportPreviewLimited}</p>
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
