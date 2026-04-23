'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Search } from 'lucide-react'

type Patient = {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  phone: string | null
  email: string | null
}

function formatDob(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ClinicPatientsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 320)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : ''
        const res = await fetch(`/api/clinic/patients${qs}`, { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load')
          return
        }
        if (!cancelled) {
          setPatients(data.patients || [])
          setError('')
        }
      } catch {
        if (!cancelled) setError('Network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced, router])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <p className="text-gray-600 text-sm mt-1">
              Search by name, phone, or email — quick access on iPad when someone returns.
            </p>
          </div>
          <Link
            href="/clinic/patients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add patient
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients…"
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none"
            autoCapitalize="words"
            autoCorrect="off"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Date of birth</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                      {debounced
                        ? 'No matches. Try another spelling or add a new patient.'
                        : 'No patients yet. Add your first patient to get started.'}
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <Link
                          href={`/clinic/patients/${p.id}`}
                          className="font-medium text-gray-900 hover:text-orange-600"
                        >
                          {p.lastName}, {p.firstName}
                          {p.middleName ? ` ${p.middleName}` : ''}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDob(p.dateOfBirth)}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.phone || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
