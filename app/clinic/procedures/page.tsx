'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

type Procedure = {
  id: string
  name: string
  defaultDurationMin: number
  basePriceCents: number
  currency: string
  active: boolean
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

export default function ClinicProceduresPage() {
  const router = useRouter()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/clinic/procedures', { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load')
          return
        }
        if (!cancelled) setProcedures(data.procedures || [])
      } catch {
        setError('Network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Procedures</h1>
          <p className="text-gray-600 text-sm mt-1">Catalog · alphabetical</p>
        </div>
        <Link
          href="/clinic/procedures/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Add procedure
        </Link>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Base price</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...procedures]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.defaultDurationMin} min</td>
                  <td className="px-4 py-3 text-gray-600">{formatMoney(p.basePriceCents, p.currency)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.active ? (
                      <span className="text-green-700">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            {procedures.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No procedures yet. Add your service catalog.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
