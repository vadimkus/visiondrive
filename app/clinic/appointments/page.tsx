'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: string
  titleOverride: string | null
  internalNotes: string | null
  patient: { id: string; firstName: string; lastName: string }
  procedure: { id: string; name: string } | null
}

function startOfWeek(d: Date) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = (day + 6) % 7
  x.setDate(x.getDate() - diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function ClinicAppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [range, setRange] = useState<{ from: string; to: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const from = startOfWeek(new Date())
      const to = new Date(from)
      to.setDate(to.getDate() + 7)
      try {
        const qs = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        })
        const res = await fetch(`/api/clinic/appointments?${qs}`, { credentials: 'include' })
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
          setAppointments(data.appointments || [])
          setRange(data.range || null)
        }
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-gray-600 text-sm mt-1">
            This week (Mon–Sun){' '}
            {range && (
              <span className="text-gray-400">
                · {new Date(range.from).toLocaleDateString('en-GB')} –{' '}
                {new Date(range.to).toLocaleDateString('en-GB')}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/clinic/appointments/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          New appointment
        </Link>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {appointments.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">No appointments in this range.</p>
        ) : (
          appointments.map((a) => (
            <div key={a.id} className="p-4 text-sm">
              <p className="font-medium text-gray-900">
                {new Date(a.startsAt).toLocaleString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-gray-800">
                {a.patient.lastName}, {a.patient.firstName}
              </p>
              <p className="text-gray-600">
                {a.procedure?.name || a.titleOverride || 'Appointment'}
                <span className="text-gray-400"> · {a.status}</span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
