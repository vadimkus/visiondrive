'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

export default function NewPatientPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    internalNotes: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/clinic/patients', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName || undefined,
          dateOfBirth: form.dateOfBirth,
          phone: form.phone || undefined,
          email: form.email || undefined,
          internalNotes: form.internalNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      router.push(`/clinic/patients/${data.patient.id}`)
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
        <Link href="/clinic/patients" className="text-sm text-orange-600 hover:text-orange-700">
          {t.backPatients}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t.newPatientTitle}</h1>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName}</label>
            <input
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName}</label>
            <input
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.middleName}</label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.middleName}
            onChange={(e) => setForm({ ...form, middleName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.dateOfBirth}</label>
          <input
            required
            type="date"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
          <input
            type="tel"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.emailLabel}</label>
          <input
            type="email"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.internalNotesStaffOnly}</label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
            value={form.internalNotes}
            onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? t.savingEllipsis : t.createPatient}
        </button>
      </form>
    </div>
  )
}
