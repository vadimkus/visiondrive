'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

type PatientDetail = {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  phone: string | null
  email: string | null
  internalNotes: string | null
  appointments: {
    id: string
    startsAt: string
    endsAt: string | null
    status: string
    titleOverride: string | null
    procedure: { id: string; name: string } | null
  }[]
}

function ageFromDob(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id || '')
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/clinic/patients/${id}`, { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Not found')
          return
        }
        if (!cancelled) setPatient(data.patient)
      } catch {
        setError('Network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <p className="text-red-600">{error || 'Not found'}</p>
        <Link href="/clinic/patients" className="text-orange-600 text-sm">
          ← Patients
        </Link>
      </div>
    )
  }

  const age = ageFromDob(patient.dateOfBirth)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/clinic/patients" className="text-sm text-orange-600 hover:text-orange-700">
        ← Patients
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {patient.lastName}, {patient.firstName}
          {patient.middleName ? ` ${patient.middleName}` : ''}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          DOB{' '}
          {new Date(patient.dateOfBirth).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {age != null ? ` · ${age} years` : ''}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-2 text-sm">
        <p>
          <span className="text-gray-500">Phone:</span> {patient.phone || '—'}
        </p>
        <p>
          <span className="text-gray-500">Email:</span> {patient.email || '—'}
        </p>
      </div>

      {patient.internalNotes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 text-sm">
          <p className="font-medium text-amber-900 mb-1">Internal notes (staff only)</p>
          <p className="text-amber-950 whitespace-pre-wrap">{patient.internalNotes}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent appointments</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {patient.appointments.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No appointments yet.</p>
          ) : (
            patient.appointments.map((a) => (
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
                <p className="text-gray-600">
                  {a.procedure?.name || a.titleOverride || 'Appointment'}
                  <span className="text-gray-400"> · {a.status}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
