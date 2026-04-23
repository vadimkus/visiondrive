'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, ListOrdered, Calendar, ArrowRight } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'

type Stats = {
  patientCount: number
  procedureCount: number
  appointmentToday: number
  appointmentUpcoming: number
}

export default function ClinicDashboardPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        const me = await res.json()
        if (!res.ok || !me.success || me.user?.portal !== 'clinic') {
          router.replace('/login')
          return
        }
        const sRes = await fetch('/api/clinic/stats', { credentials: 'include' })
        if (sRes.status === 401) {
          router.replace('/login')
          return
        }
        const data = await sRes.json()
        if (!cancelled) setStats(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t.dashboard}</h1>
        <p className="text-gray-600 mt-1 text-[15px]">
          Overview for your practice. Data is scoped to your organization only.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
            <Users className="w-5 h-5 text-orange-500 mb-2" aria-hidden />
            <p className="text-2xl font-semibold text-gray-900">{stats.patientCount}</p>
            <p className="text-sm text-gray-500">{t.patients}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
            <ListOrdered className="w-5 h-5 text-orange-500 mb-2" aria-hidden />
            <p className="text-2xl font-semibold text-gray-900">{stats.procedureCount}</p>
            <p className="text-sm text-gray-500">{t.procedures}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
            <Calendar className="w-5 h-5 text-orange-500 mb-2" aria-hidden />
            <p className="text-2xl font-semibold text-gray-900">{stats.appointmentToday}</p>
            <p className="text-sm text-gray-500">Appointments today</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
            <Calendar className="w-5 h-5 text-orange-500 mb-2" aria-hidden />
            <p className="text-2xl font-semibold text-gray-900">{stats.appointmentUpcoming}</p>
            <p className="text-sm text-gray-500">Upcoming scheduled</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-900">Quick actions</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/clinic/patients/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            {t.addPatient}
            <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/clinic/appointments/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {t.newAppointment}
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Documentation: <code className="bg-gray-100 px-1 rounded">docs/clinic/</code> in the VisionDrive repo.
      </p>
    </div>
  )
}
