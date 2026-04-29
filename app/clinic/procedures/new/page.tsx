'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

export default function NewProcedurePage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    defaultDurationMin: '60',
    bufferAfterMinutes: '0',
    basePriceCents: '0',
    currency: 'AED',
    bookingPolicyType: 'NONE',
    depositAmount: '0',
    depositPercent: '0',
    cancellationWindowHours: '24',
    lateCancelFee: '0',
    noShowFee: '0',
    bookingPolicyText: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const basePriceCents = Math.round(parseFloat(form.basePriceCents || '0') * 100)
      const res = await fetch('/api/clinic/procedures', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          defaultDurationMin: parseInt(form.defaultDurationMin, 10),
          bufferAfterMinutes: parseInt(form.bufferAfterMinutes, 10),
          basePriceCents,
          currency: form.currency,
          bookingPolicyType: form.bookingPolicyType,
          depositAmountCents: Math.round(parseFloat(form.depositAmount || '0') * 100),
          depositPercent: parseInt(form.depositPercent || '0', 10),
          cancellationWindowHours: parseInt(form.cancellationWindowHours || '24', 10),
          lateCancelFeeCents: Math.round(parseFloat(form.lateCancelFee || '0') * 100),
          noShowFeeCents: Math.round(parseFloat(form.noShowFee || '0') * 100),
          bookingPolicyText: form.bookingPolicyText || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      router.push('/clinic/procedures')
      router.refresh()
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/clinic/procedures" className="text-sm text-orange-600 hover:text-orange-700">
          ← {t.procedures}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.newProcedureTitle}</h1>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.procedureName}</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.durationMinutes}</label>
          <input
            required
            type="number"
            min={5}
            max={1440}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.defaultDurationMin}
            onChange={(e) => setForm({ ...form, defaultDurationMin: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.procedureBufferAfter}</label>
          <input
            required
            type="number"
            min={0}
            max={60}
            step={5}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.bufferAfterMinutes}
            onChange={(e) => setForm({ ...form, bufferAfterMinutes: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">{t.procedureBufferAfterHint}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.basePrice} ({form.currency})
          </label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.basePriceCents}
            onChange={(e) => setForm({ ...form, basePriceCents: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t.priceHintCents.replace('{currency}', form.currency)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.currency}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 uppercase"
            maxLength={8}
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-orange-950">{t.bookingPolicy}</h2>
            <p className="mt-1 text-xs text-orange-800">{t.bookingPolicyHint}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.bookingPolicyType}</label>
            <select
              className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-gray-900"
              value={form.bookingPolicyType}
              onChange={(e) => setForm({ ...form, bookingPolicyType: e.target.value })}
            >
              <option value="NONE">{t.bookingPolicyNone}</option>
              <option value="DEPOSIT">{t.bookingPolicyDeposit}</option>
              <option value="FULL_PREPAY">{t.bookingPolicyFullPrepay}</option>
              <option value="CARD_ON_FILE">{t.bookingPolicyCardOnFile}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bookingPolicyDepositAmount} ({form.currency})
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.bookingPolicyDepositPercent}</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
                value={form.depositPercent}
                onChange={(e) => setForm({ ...form, depositPercent: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.bookingPolicyCancellationWindow}</label>
              <input
                type="number"
                min={0}
                max={720}
                className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
                value={form.cancellationWindowHours}
                onChange={(e) => setForm({ ...form, cancellationWindowHours: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bookingPolicyLateCancelFee} ({form.currency})
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
                value={form.lateCancelFee}
                onChange={(e) => setForm({ ...form, lateCancelFee: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.bookingPolicyNoShowFee} ({form.currency})
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
                value={form.noShowFee}
                onChange={(e) => setForm({ ...form, noShowFee: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.bookingPolicyText}</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-orange-100 px-3 py-2.5 text-gray-900"
              placeholder={t.bookingPolicyTextPlaceholder}
              value={form.bookingPolicyText}
              onChange={(e) => setForm({ ...form, bookingPolicyText: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? t.savingEllipsis : t.createProcedure}
        </button>
      </form>
    </div>
  )
}
