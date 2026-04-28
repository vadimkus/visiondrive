'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, ListOrdered, Calendar, CalendarClock, ArrowRight, Package, Send, Sparkles, Link as LinkIcon, BarChart3, Target, Gauge } from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicPwaPractitionerCard } from '@/components/clinic/ClinicPwaPractitionerCard'
import clsx from 'clsx'

type Stats = {
  patientCount: number
  procedureCount: number
  appointmentToday: number
  appointmentUpcoming: number
  lowStockCount: number
  bookingUrl: string | null
  publicBookingEnabled: boolean
}

export default function ClinicDashboardPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingToggleBusy, setBookingToggleBusy] = useState(false)

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

  async function togglePublicBooking() {
    if (!stats) return
    setBookingToggleBusy(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/public-booking/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !stats.publicBookingEnabled }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setStats((current) =>
        current ? { ...current, publicBookingEnabled: data.enabled === true } : current
      )
    } catch {
      setError(t.networkError)
    } finally {
      setBookingToggleBusy(false)
    }
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  const statCardClass =
    'group relative overflow-hidden bg-white/90 rounded-3xl border border-white/80 p-4 md:p-5 shadow-sm shadow-orange-100/40 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-200/80 focus-within:ring-2 focus-within:ring-orange-400/40 focus-within:ring-offset-2'

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl shadow-orange-100/50 backdrop-blur md:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t.practiceOsTitle}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">{t.dashboard}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">{t.dashboardIntro}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link
              href="/clinic/appointments/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
            >
              {t.newAppointment}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/clinic/reminders"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <Send className="h-4 w-4" aria-hidden />
              {t.reminders}
            </Link>
            {stats?.bookingUrl && (
              <Link
                href={stats.bookingUrl}
                className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 sm:col-span-1"
              >
                <LinkIcon className="h-4 w-4" aria-hidden />
                {t.publicBookingLink}
              </Link>
            )}
            {stats?.bookingUrl && (
              <button
                type="button"
                onClick={() => void togglePublicBooking()}
                disabled={bookingToggleBusy}
                className={clsx(
                  'col-span-2 inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-sm disabled:opacity-60 sm:col-span-1',
                  stats.publicBookingEnabled
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                {stats.publicBookingEnabled ? t.publicBookingOn : t.publicBookingOff}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <ClinicPwaPractitionerCard />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <Link
            href="/clinic/patients"
            className={clsx(statCardClass, 'block outline-none')}
            aria-label={`${t.patients}: ${stats.patientCount}`}
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
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
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
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
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
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
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/15 transition-colors">
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
                'w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors',
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

      <div className="bg-white/90 rounded-3xl border border-white/80 p-5 shadow-sm shadow-orange-100/40 backdrop-blur space-y-3">
        <p className="text-sm font-medium text-gray-900">{t.quickActions}</p>
        <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 lg:flex lg:flex-wrap">
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
          <Link
            href="/clinic/reminders"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {t.reminders}
          </Link>
          <Link
            href="/clinic/service-analytics"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <BarChart3 className="h-4 w-4" aria-hidden />
            {t.serviceAnalytics}
          </Link>
          <Link
            href="/clinic/revenue-plan"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Target className="h-4 w-4" aria-hidden />
            {t.revenuePlan}
          </Link>
          <Link
            href="/clinic/occupancy"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Gauge className="h-4 w-4" aria-hidden />
            {t.occupancyReport}
          </Link>
          {stats?.bookingUrl && (
            <Link
              href={stats.bookingUrl}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {t.publicBookingLink}
            </Link>
          )}
          {stats?.bookingUrl && (
            <button
              type="button"
              onClick={() => void togglePublicBooking()}
              disabled={bookingToggleBusy}
              className={clsx(
                'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60',
                stats.publicBookingEnabled
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {stats.publicBookingEnabled ? t.publicBookingOn : t.publicBookingOff}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">{t.docsFooter}</p>
    </div>
  )
}
