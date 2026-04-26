'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, ListOrdered, Calendar, CalendarClock, ArrowRight, Package } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import clsx from 'clsx'

type Stats = {
  patientCount: number
  procedureCount: number
  appointmentToday: number
  appointmentUpcoming: number
  lowStockCount: number
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
        if (!cancelled)
          setStats({
            ...data,
            lowStockCount: typeof data.lowStockCount === 'number' ? data.lowStockCount : 0,
          })
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

  const statCardClass =
    'group relative bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-orange-200/80 focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:ring-offset-2'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t.dashboard}</h1>
        <p className="text-gray-600 mt-1 text-[15px] leading-relaxed">{t.dashboardIntro}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Link
            href="/clinic/patients"
            className={clsx(statCardClass, 'block outline-none')}
            aria-label={`${t.patients}: ${stats.patientCount}`}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
              <Users className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{stats.patientCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t.patients}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/clinic/procedures"
            className={clsx(statCardClass, 'block outline-none')}
            aria-label={`${t.procedures}: ${stats.procedureCount}`}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
              <ListOrdered className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{stats.procedureCount}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t.procedures}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/clinic/appointments"
            className={clsx(statCardClass, 'block outline-none')}
            aria-label={`${t.appointmentsToday}: ${stats.appointmentToday}`}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
              <CalendarClock className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{stats.appointmentToday}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t.appointmentsToday}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/clinic/appointments"
            className={clsx(statCardClass, 'block outline-none')}
            aria-label={`${t.upcomingScheduled}: ${stats.appointmentUpcoming}`}
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
              <Calendar className="w-5 h-5 text-orange-600" aria-hidden />
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{stats.appointmentUpcoming}</p>
            <p className="text-sm text-gray-500 mt-0.5">{t.upcomingScheduled}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href={stats.lowStockCount > 0 ? '/clinic/inventory?lowStock=1' : '/clinic/inventory'}
            className={clsx(
              statCardClass,
              'block outline-none',
              stats.lowStockCount > 0 && 'border-amber-300/80 bg-amber-50/40'
            )}
            aria-label={`${t.lowStockAlerts}: ${stats.lowStockCount}`}
          >
            <div
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors',
                stats.lowStockCount > 0 ? 'bg-amber-500/15' : 'bg-orange-500/10 group-hover:bg-orange-500/15'
              )}
            >
              <Package
                className={clsx(
                  'w-5 h-5',
                  stats.lowStockCount > 0 ? 'text-amber-700' : 'text-orange-600'
                )}
                aria-hidden
              />
            </div>
            <p
              className={clsx(
                'text-2xl font-semibold tabular-nums',
                stats.lowStockCount > 0 ? 'text-amber-900' : 'text-gray-900'
              )}
            >
              {stats.lowStockCount}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{t.lowStockAlerts}</p>
            <ArrowRight className="w-4 h-4 text-gray-300 absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-900">{t.quickActions}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/clinic/patients/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 shadow-sm hover:shadow transition-shadow"
          >
            {t.addPatient}
            <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180" aria-hidden />
          </Link>
          <Link
            href="/clinic/appointments/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {t.newAppointment}
          </Link>
          <Link
            href="/clinic/inventory/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {t.addStockItem}
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-500">{t.docsFooter}</p>
    </div>
  )
}
