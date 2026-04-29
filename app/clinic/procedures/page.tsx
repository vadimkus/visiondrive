'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Procedure = {
  id: string
  name: string
  defaultDurationMin: number
  bufferAfterMinutes: number
  basePriceCents: number
  currency: string
  bookingPolicyType: 'NONE' | 'DEPOSIT' | 'FULL_PREPAY' | 'CARD_ON_FILE'
  depositAmountCents: number
  depositPercent: number
  cancellationWindowHours: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  bookingPolicyText: string | null
  active: boolean
  materials: ProcedureMaterial[]
  intakeQuestions: IntakeQuestion[]
  aftercareTemplates: AftercareTemplate[]
}

type AftercareTemplate = {
  id: string
  title: string
  messageBody: string
  documentName: string | null
  documentUrl: string | null
  active: boolean
  sortOrder: number
}

type IntakeQuestion = {
  id: string
  prompt: string
  helpText: string | null
  type: 'TEXT' | 'TEXTAREA' | 'YES_NO'
  required: boolean
  active: boolean
  sortOrder: number
}

type ProcedureMaterial = {
  id: string
  quantityPerVisit: number
  unitCostCents: number
  active: boolean
  note: string | null
  stockItem: {
    id: string
    name: string
    unit: string
    quantityOnHand: number
    active: boolean
  }
}

type StockItem = {
  id: string
  name: string
  unit: string
  quantityOnHand: number
  active: boolean
}

type MaterialForm = {
  stockItemId: string
  quantityPerVisit: string
  unitCost: string
  note: string
}

type IntakeForm = {
  prompt: string
  helpText: string
  type: 'TEXT' | 'TEXTAREA' | 'YES_NO'
  required: boolean
}

type AftercareForm = {
  title: string
  messageBody: string
  documentName: string
  documentUrl: string
}

type PolicyForm = {
  bookingPolicyType: Procedure['bookingPolicyType']
  depositAmount: string
  depositPercent: string
  cancellationWindowHours: string
  lateCancelFee: string
  noShowFee: string
  bookingPolicyText: string
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function parseMajorToCents(value: string) {
  const parsed = Number.parseFloat(value || '0')
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0
}

function centsToMajor(cents: number) {
  return (Math.max(0, cents) / 100).toFixed(2)
}

function policyFormFromProcedure(procedure: Procedure): PolicyForm {
  return {
    bookingPolicyType: procedure.bookingPolicyType,
    depositAmount: centsToMajor(procedure.depositAmountCents),
    depositPercent: String(procedure.depositPercent || 0),
    cancellationWindowHours: String(procedure.cancellationWindowHours || 24),
    lateCancelFee: centsToMajor(procedure.lateCancelFeeCents),
    noShowFee: centsToMajor(procedure.noShowFeeCents),
    bookingPolicyText: procedure.bookingPolicyText || '',
  }
}

function materialCost(materials: ProcedureMaterial[]) {
  return materials
    .filter((material) => material.active)
    .reduce((sum, material) => sum + material.quantityPerVisit * material.unitCostCents, 0)
}

export default function ClinicProceduresPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [forms, setForms] = useState<Record<string, MaterialForm>>({})
  const [intakeForms, setIntakeForms] = useState<Record<string, IntakeForm>>({})
  const [aftercareForms, setAftercareForms] = useState<Record<string, AftercareForm>>({})
  const [policyForms, setPolicyForms] = useState<Record<string, PolicyForm>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [procedureRes, inventoryRes] = await Promise.all([
        fetch('/api/clinic/procedures', { credentials: 'include' }),
        fetch('/api/clinic/inventory', { credentials: 'include' }),
      ])
      if (procedureRes.status === 401 || inventoryRes.status === 401) {
        router.replace('/login')
        return
      }
      const procedureData = await procedureRes.json()
      const inventoryData = await inventoryRes.json()
      if (!procedureRes.ok || !inventoryRes.ok) {
        setError(procedureData.error || inventoryData.error || t.failedToLoad)
        return
      }
      setProcedures(procedureData.procedures || [])
      setStockItems((inventoryData.items || []).filter((item: StockItem) => item.active))
      setPolicyForms((current) => {
        const next = { ...current }
        for (const procedure of (procedureData.procedures || []) as Procedure[]) {
          if (!next[procedure.id]) next[procedure.id] = policyFormFromProcedure(procedure)
        }
        return next
      })
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [router, t.failedToLoad, t.networkError])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  function updateForm(procedureId: string, patch: Partial<MaterialForm>) {
    const defaultForm = { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' }
    setForms((current) => ({
      ...current,
      [procedureId]: {
        ...defaultForm,
        ...current[procedureId],
        ...patch,
      },
    }))
  }

  function updateIntakeForm(procedureId: string, patch: Partial<IntakeForm>) {
    const defaultForm: IntakeForm = { prompt: '', helpText: '', type: 'TEXT', required: false }
    setIntakeForms((current) => ({
      ...current,
      [procedureId]: {
        ...defaultForm,
        ...current[procedureId],
        ...patch,
      },
    }))
  }

  function updateAftercareForm(procedureId: string, patch: Partial<AftercareForm>) {
    const defaultForm: AftercareForm = { title: '', messageBody: '', documentName: '', documentUrl: '' }
    setAftercareForms((current) => ({
      ...current,
      [procedureId]: {
        ...defaultForm,
        ...current[procedureId],
        ...patch,
      },
    }))
  }

  function updatePolicyForm(procedure: Procedure, patch: Partial<PolicyForm>) {
    setPolicyForms((current) => ({
      ...current,
      [procedure.id]: {
        ...policyFormFromProcedure(procedure),
        ...current[procedure.id],
        ...patch,
      },
    }))
  }

  async function savePolicy(procedure: Procedure) {
    const form = policyForms[procedure.id] ?? policyFormFromProcedure(procedure)
    setBusy(`policy-${procedure.id}`)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedure.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingPolicyType: form.bookingPolicyType,
          depositAmountCents: parseMajorToCents(form.depositAmount),
          depositPercent: Number.parseInt(form.depositPercent || '0', 10),
          cancellationWindowHours: Number.parseInt(form.cancellationWindowHours || '24', 10),
          lateCancelFeeCents: parseMajorToCents(form.lateCancelFee),
          noShowFeeCents: parseMajorToCents(form.noShowFee),
          bookingPolicyText: form.bookingPolicyText || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function saveMaterial(procedureId: string) {
    const form = forms[procedureId]
    if (!form?.stockItemId) {
      alert(t.materialItemRequired)
      return
    }
    setBusy(procedureId)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/materials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockItemId: form.stockItemId,
          quantityPerVisit: Number.parseInt(form.quantityPerVisit || '1', 10),
          unitCostCents: parseMajorToCents(form.unitCost),
          note: form.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      setForms((current) => ({
        ...current,
        [procedureId]: { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' },
      }))
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function removeMaterial(procedureId: string, materialId: string) {
    setBusy(materialId)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function saveIntakeQuestion(procedureId: string) {
    const form = intakeForms[procedureId]
    if (!form?.prompt.trim()) {
      alert(t.intakeQuestionRequired)
      return
    }
    setBusy(`intake-${procedureId}`)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/intake-questions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: form.prompt,
          helpText: form.helpText || null,
          type: form.type,
          required: form.required,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      setIntakeForms((current) => ({
        ...current,
        [procedureId]: { prompt: '', helpText: '', type: 'TEXT', required: false },
      }))
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function removeIntakeQuestion(procedureId: string, questionId: string) {
    setBusy(questionId)
    try {
      const res = await fetch(`/api/clinic/procedures/${procedureId}/intake-questions/${questionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function saveAftercareTemplate(procedureId: string) {
    const form = aftercareForms[procedureId]
    if (!form?.title.trim() || (!form.messageBody.trim() && !form.documentUrl.trim())) {
      alert(t.aftercareTemplateRequired)
      return
    }
    setBusy(`aftercare-${procedureId}`)
    try {
      const res = await fetch('/api/clinic/aftercare-templates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          procedureId,
          title: form.title,
          messageBody: form.messageBody,
          documentName: form.documentName || null,
          documentUrl: form.documentUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      setAftercareForms((current) => ({
        ...current,
        [procedureId]: { title: '', messageBody: '', documentName: '', documentUrl: '' },
      }))
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function removeAftercareTemplate(templateId: string) {
    setBusy(templateId)
    try {
      const res = await fetch(`/api/clinic/aftercare-templates/${templateId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.operationFailed)
        return
      }
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t.procedures}</h1>
          <p className="text-gray-600 text-sm mt-1">{t.proceduresCatalogSubtitle}</p>
        </div>
        <Link
          href="/clinic/procedures/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          {t.addProcedure}
        </Link>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="space-y-4">
        {[...procedures]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => {
            const form = forms[p.id] ?? { stockItemId: '', quantityPerVisit: '1', unitCost: '0', note: '' }
            const intakeForm = intakeForms[p.id] ?? { prompt: '', helpText: '', type: 'TEXT' as const, required: false }
            const aftercareForm = aftercareForms[p.id] ?? { title: '', messageBody: '', documentName: '', documentUrl: '' }
            const policyForm = policyForms[p.id] ?? policyFormFromProcedure(p)
            const cost = materialCost(p.materials || [])
            return (
              <article key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
                      {p.active ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {t.statusActive}
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          {t.statusInactive}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {p.defaultDurationMin} {t.minutesAbbr} · {t.appointmentBuffer}: {p.bufferAfterMinutes || 0}{' '}
                      {t.minutesAbbr} · {formatMoney(p.basePriceCents, p.currency)}
                    </p>
                    {p.bookingPolicyType !== 'NONE' && (
                      <p className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
                        {t.bookingPolicyRequiredBadge}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-purple-50 px-4 py-3 text-purple-950">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{t.materialCost}</p>
                    <p className="mt-1 text-xl font-semibold">{formatMoney(cost, p.currency)}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.bookingPolicy}</h3>
                      <p className="text-xs text-gray-500">{t.bookingPolicyHint}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyType}
                      <select
                        value={policyForm.bookingPolicyType}
                        onChange={(e) => updatePolicyForm(p, { bookingPolicyType: e.target.value as Procedure['bookingPolicyType'] })}
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 bg-white px-3 text-sm text-gray-900"
                      >
                        <option value="NONE">{t.bookingPolicyNone}</option>
                        <option value="DEPOSIT">{t.bookingPolicyDeposit}</option>
                        <option value="FULL_PREPAY">{t.bookingPolicyFullPrepay}</option>
                        <option value="CARD_ON_FILE">{t.bookingPolicyCardOnFile}</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyDepositAmount}
                      <input
                        value={policyForm.depositAmount}
                        onChange={(e) => updatePolicyForm(p, { depositAmount: e.target.value })}
                        inputMode="decimal"
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 px-3 text-sm text-gray-900"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyDepositPercent}
                      <input
                        value={policyForm.depositPercent}
                        onChange={(e) => updatePolicyForm(p, { depositPercent: e.target.value })}
                        inputMode="numeric"
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 px-3 text-sm text-gray-900"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyCancellationWindow}
                      <input
                        value={policyForm.cancellationWindowHours}
                        onChange={(e) => updatePolicyForm(p, { cancellationWindowHours: e.target.value })}
                        inputMode="numeric"
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 px-3 text-sm text-gray-900"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyLateCancelFee}
                      <input
                        value={policyForm.lateCancelFee}
                        onChange={(e) => updatePolicyForm(p, { lateCancelFee: e.target.value })}
                        inputMode="decimal"
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 px-3 text-sm text-gray-900"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600">
                      {t.bookingPolicyNoShowFee}
                      <input
                        value={policyForm.noShowFee}
                        onChange={(e) => updatePolicyForm(p, { noShowFee: e.target.value })}
                        inputMode="decimal"
                        className="mt-1 min-h-11 w-full rounded-xl border border-orange-100 px-3 text-sm text-gray-900"
                      />
                    </label>
                    <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
                      {t.bookingPolicyText}
                      <textarea
                        rows={2}
                        value={policyForm.bookingPolicyText}
                        onChange={(e) => updatePolicyForm(p, { bookingPolicyText: e.target.value })}
                        placeholder={t.bookingPolicyTextPlaceholder}
                        className="mt-1 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm text-gray-900"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy === `policy-${p.id}`}
                      onClick={() => void savePolicy(p)}
                      className="min-h-11 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 sm:col-span-2 xl:col-span-1"
                    >
                      {busy === `policy-${p.id}` ? t.savingEllipsis : t.saveBookingPolicy}
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.intakeQuestions}</h3>
                      <p className="text-xs text-gray-500">{t.intakeQuestionsHint}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {p.intakeQuestions?.length ? (
                      p.intakeQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{question.prompt}</p>
                            <p className="text-xs text-gray-500">
                              {question.type === 'YES_NO'
                                ? t.intakeTypeYesNo
                                : question.type === 'TEXTAREA'
                                  ? t.intakeTypeTextarea
                                  : t.intakeTypeText}
                              {question.required ? ` · ${t.required}` : ''}
                              {!question.active ? ` · ${t.statusInactive}` : ''}
                            </p>
                            {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}
                          </div>
                          <button
                            type="button"
                            disabled={busy === question.id}
                            onClick={() => void removeIntakeQuestion(p.id, question.id)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            {t.removeQuestion}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-blue-100 bg-white p-4 text-sm text-gray-500">
                        {t.noIntakeQuestionsYet}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.65fr_auto_auto]">
                    <input
                      value={intakeForm.prompt}
                      onChange={(e) => updateIntakeForm(p.id, { prompt: e.target.value })}
                      placeholder={t.intakeQuestionPrompt}
                      className="min-h-11 min-w-0 rounded-xl border border-blue-100 bg-white px-3 text-sm text-gray-900"
                    />
                    <input
                      value={intakeForm.helpText}
                      onChange={(e) => updateIntakeForm(p.id, { helpText: e.target.value })}
                      placeholder={t.intakeQuestionHelp}
                      className="min-h-11 min-w-0 rounded-xl border border-blue-100 bg-white px-3 text-sm text-gray-900"
                    />
                    <select
                      value={intakeForm.type}
                      onChange={(e) => updateIntakeForm(p.id, { type: e.target.value as IntakeForm['type'] })}
                      className="min-h-11 min-w-0 rounded-xl border border-blue-100 bg-white px-3 text-sm text-gray-900"
                    >
                      <option value="TEXT">{t.intakeTypeText}</option>
                      <option value="TEXTAREA">{t.intakeTypeTextarea}</option>
                      <option value="YES_NO">{t.intakeTypeYesNo}</option>
                    </select>
                    <label className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={intakeForm.required}
                        onChange={(e) => updateIntakeForm(p.id, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-blue-200 text-blue-600"
                      />
                      {t.required}
                    </label>
                    <button
                      type="button"
                      disabled={busy === `intake-${p.id}`}
                      onClick={() => void saveIntakeQuestion(p.id)}
                      className="min-h-11 min-w-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:col-span-2 xl:col-span-1"
                    >
                      {busy === `intake-${p.id}` ? t.savingEllipsis : t.saveQuestion}
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.aftercareLibrary}</h3>
                      <p className="text-xs text-gray-500">{t.aftercareLibraryHint}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {p.aftercareTemplates?.length ? (
                      p.aftercareTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-white p-3 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{template.title}</p>
                            {template.messageBody && (
                              <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-gray-500">
                                {template.messageBody}
                              </p>
                            )}
                            {template.documentUrl && (
                              <p className="mt-1 text-xs text-emerald-700">
                                {template.documentName || t.aftercareDocumentReference}: {template.documentUrl}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={busy === template.id}
                            onClick={() => void removeAftercareTemplate(template.id)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            {t.archiveTemplate}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-emerald-100 bg-white p-4 text-sm text-gray-500">
                        {t.noAftercareTemplatesYet}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <input
                      value={aftercareForm.title}
                      onChange={(e) => updateAftercareForm(p.id, { title: e.target.value })}
                      placeholder={t.aftercareTemplateTitle}
                      className="min-h-11 rounded-xl border border-emerald-100 bg-white px-3 text-sm text-gray-900"
                    />
                    <input
                      value={aftercareForm.documentName}
                      onChange={(e) => updateAftercareForm(p.id, { documentName: e.target.value })}
                      placeholder={t.aftercareDocumentName}
                      className="min-h-11 rounded-xl border border-emerald-100 bg-white px-3 text-sm text-gray-900"
                    />
                    <textarea
                      value={aftercareForm.messageBody}
                      onChange={(e) => updateAftercareForm(p.id, { messageBody: e.target.value })}
                      placeholder={t.aftercareMessageBody}
                      rows={3}
                      className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-gray-900 lg:col-span-2"
                    />
                    <input
                      value={aftercareForm.documentUrl}
                      onChange={(e) => updateAftercareForm(p.id, { documentUrl: e.target.value })}
                      placeholder={t.aftercareDocumentUrl}
                      className="min-h-11 rounded-xl border border-emerald-100 bg-white px-3 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      disabled={busy === `aftercare-${p.id}`}
                      onClick={() => void saveAftercareTemplate(p.id)}
                      className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {busy === `aftercare-${p.id}` ? t.savingEllipsis : t.saveAftercareTemplate}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">{t.aftercarePlaceholdersHint}</p>
                </div>

                <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.billOfMaterials}</h3>
                      <p className="text-xs text-gray-500">{t.materialCostHint}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {p.materials?.length ? (
                      p.materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{material.stockItem.name}</p>
                            <p className="text-xs text-gray-500">
                              {material.quantityPerVisit} {material.stockItem.unit} ·{' '}
                              {formatMoney(material.unitCostCents, p.currency)} / {material.stockItem.unit} ·{' '}
                              {t.stockOnHand}: {material.stockItem.quantityOnHand}
                            </p>
                            {material.note && <p className="mt-1 text-xs text-gray-500">{material.note}</p>}
                          </div>
                          <button
                            type="button"
                            disabled={busy === material.id}
                            onClick={() => void removeMaterial(p.id, material.id)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            {t.removeMaterial}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                        {t.noMaterialsYet}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_0.6fr_0.7fr_1fr_auto]">
                    <select
                      value={form.stockItemId}
                      onChange={(e) => updateForm(p.id, { stockItemId: e.target.value })}
                      className="min-h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900"
                    >
                      <option value="">{t.materialItem}</option>
                      {stockItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantityOnHand} {item.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.quantityPerVisit}
                      onChange={(e) => updateForm(p.id, { quantityPerVisit: e.target.value })}
                      inputMode="numeric"
                      placeholder={t.quantityPerVisit}
                      className="min-h-11 min-w-0 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <input
                      value={form.unitCost}
                      onChange={(e) => updateForm(p.id, { unitCost: e.target.value })}
                      inputMode="decimal"
                      placeholder={t.unitCost}
                      className="min-h-11 min-w-0 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <input
                      value={form.note}
                      onChange={(e) => updateForm(p.id, { note: e.target.value })}
                      placeholder={t.note}
                      className="min-h-11 min-w-0 rounded-xl border border-gray-200 px-3 text-sm text-gray-900"
                    />
                    <button
                      type="button"
                      disabled={busy === p.id || stockItems.length === 0}
                      onClick={() => void saveMaterial(p.id)}
                      className="min-h-11 min-w-0 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 sm:col-span-2 xl:col-span-1"
                    >
                      {busy === p.id ? t.savingEllipsis : t.saveMaterial}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        {procedures.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            {t.noProceduresEmpty}
          </div>
        )}
      </div>
    </div>
  )
}
