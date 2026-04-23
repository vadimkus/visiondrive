'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewProcedurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    defaultDurationMin: '60',
    basePriceCents: '0',
    currency: 'AED',
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
          basePriceCents,
          currency: form.currency,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
        return
      }
      router.push('/clinic/procedures')
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link href="/clinic/procedures" className="text-sm text-orange-600 hover:text-orange-700">
          ← Procedures
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">New procedure</h1>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Base price ({form.currency})</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.basePriceCents}
            onChange={(e) => setForm({ ...form, basePriceCents: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Enter amount in {form.currency} (stored as cents internally).</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 uppercase"
            maxLength={8}
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Create procedure'}
        </button>
      </form>
    </div>
  )
}
