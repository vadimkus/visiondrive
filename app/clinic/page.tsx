'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  ListOrdered,
  Calendar,
  CalendarClock,
  ArrowRight,
  Package,
  Send,
  Sparkles,
  Link as LinkIcon,
  BarChart3,
  Target,
  Gauge,
  MessageCircleReply,
  MapPin,
  ClipboardList,
  Activity,
  Clock3,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicStrings } from '@/lib/clinic/strings'
import {
  bookingChannelLabel,
  bookingChannelWhatsappText,
  buildBookingChannelUrl,
  type BookingChannel,
} from '@/lib/clinic/booking-channel-links'
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
  practiceName: string | null
  bookingProcedures: Array<{ id: string; name: string }>
  publicBookingEnabled: boolean
}

export default function ClinicDashboardPage() {
  const router = useRouter()
  const { t } = useClinicLocale()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingToggleBusy, setBookingToggleBusy] = useState(false)
  const [copiedLink, setCopiedLink] = useState('')

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

  function absoluteBookingUrl(path: string) {
    if (typeof window === 'undefined') return path
    return new URL(path, window.location.origin).toString()
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedLink(label)
      window.setTimeout(() => setCopiedLink(''), 1800)
    } catch {
      setError(t.copyFailed)
    }
  }

  function channelUrl(channel: BookingChannel, procedureId?: string | null) {
    if (!stats?.bookingUrl) return ''
    return absoluteBookingUrl(
      buildBookingChannelUrl({
        baseUrl: stats.bookingUrl,
        channel,
        procedureId,
      })
    )
  }

  if (loading) {
    return <ClinicSpinner label={t.loading} className="min-h-[40vh]" />
  }

  const metrics = stats
    ? [
        { href: '/clinic/patients', label: t.patients, value: stats.patientCount, icon: Users, tone: 'orange' },
        { href: '/clinic/procedures', label: t.procedures, value: stats.procedureCount, icon: ListOrdered, tone: 'violet' },
        { href: '/clinic/appointments', label: t.appointmentsToday, value: stats.appointmentToday, icon: Clock3, tone: 'emerald' },
        { href: '/clinic/appointments', label: t.upcomingScheduled, value: stats.appointmentUpcoming, icon: Calendar, tone: 'sky' },
        {
          href: stats.lowStockCount > 0 ? '/clinic/inventory?lowStock=1' : '/clinic/inventory',
          label: t.lowStockAlerts,
          value: stats.lowStockCount,
          icon: Package,
          tone: stats.lowStockCount > 0 ? 'amber' : 'slate',
        },
      ]
    : []

  const primaryActions = [
    { href: '/clinic/appointments/new', label: t.newAppointment, icon: CalendarClock, primary: true },
    { href: '/clinic/patients/new', label: t.addPatient, icon: Users },
    { href: '/clinic/waitlist', label: t.smartWaitlist, icon: ClipboardList },
    { href: '/clinic/whatsapp-assistant', label: t.whatsappAssistant, icon: Zap },
  ]

  const intelligenceActions = [
    { href: '/clinic/service-analytics', label: t.serviceAnalytics, icon: BarChart3 },
    { href: '/clinic/revenue-plan', label: t.revenuePlan, icon: Target },
    { href: '/clinic/occupancy', label: t.occupancyReport, icon: Gauge },
    { href: '/clinic/service-areas', label: t.serviceAreas, icon: MapPin },
    { href: '/clinic/review-analytics', label: t.reviewAnalytics, icon: MessageCircleReply },
  ]

  return (
    <>
      <section className="space-y-5 lg:hidden">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-orange-400/40 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-100">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t.dashboardSoloCockpit}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{t.dashboard}</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
              {t.dashboardSoloCockpitHint}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                href="/clinic/appointments/new"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 active:scale-[0.98]"
              >
                {t.newAppointment}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/clinic/waitlist"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-orange-400 px-4 text-sm font-semibold text-slate-950 active:scale-[0.98]"
              >
                {t.smartWaitlist}
              </Link>
            </div>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <ClinicPwaPractitionerCard />

        {stats?.bookingUrl && (
          <BookingChannelLinksCard
            bookingEnabled={stats.publicBookingEnabled}
            copiedLink={copiedLink}
            channelUrl={channelUrl}
            copyText={copyText}
            practiceName={stats.practiceName}
            procedures={stats.bookingProcedures}
            t={t}
          />
        )}

        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {metrics.slice(0, 4).map((metric) => (
              <MobileMetric key={metric.label} {...metric} />
            ))}
          </div>
        )}

        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-950">{t.quickActions}</p>
            <span className="text-xs text-slate-400">{t.dashboardTapTargetHint}</span>
          </div>
          <div className="grid gap-2">
            {primaryActions.map((action) => (
              <ActionRow key={action.href} {...action} />
            ))}
            {stats?.bookingUrl && (
              <Link
                href={stats.bookingUrl}
                className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 active:scale-[0.99]"
              >
                <span className="inline-flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-slate-500" aria-hidden />
                  {t.publicBookingLink}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        <p className="px-1 text-xs text-slate-500">{t.docsFooter}</p>
      </section>

      <section className="hidden max-w-[92rem] space-y-8 lg:block">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <span>{t.practiceConsole}</span>
              <span>/</span>
              <span className="font-medium text-slate-900">{t.dashboard}</span>
            </div>
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-950">{t.dashboard}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{t.dashboardIntro}</p>
          </div>
          <div className="flex items-center gap-3">
            {stats?.bookingUrl && (
              <button
                type="button"
                onClick={() => void togglePublicBooking()}
                disabled={bookingToggleBusy}
                className={clsx(
                  'inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-sm transition disabled:opacity-60',
                  stats.publicBookingEnabled
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border border-white/80 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                {stats.publicBookingEnabled ? t.publicBookingOn : t.publicBookingOff}
              </button>
            )}
            <Link
              href="/clinic/appointments/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5"
            >
              {t.newAppointment}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {stats && (
          <div className="grid grid-cols-5 gap-4">
            {metrics.map((metric) => (
              <DesktopMetric key={metric.label} {...metric} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">{t.dashboardCommandCenter}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{t.dashboardCommandCenterHint}</h2>
                </div>
                <Activity className="h-6 w-6 text-orange-500" aria-hidden />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {primaryActions.map((action) => (
                  <CommandAction key={action.href} {...action} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold">{t.dashboardOperatingPosture}</p>
                <p className="text-xs text-slate-400">{t.dashboardOperatingPostureHint}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <StatusLine label={t.publicBookingLink} active={stats?.publicBookingEnabled === true} />
              <StatusLine label={t.lowStockAlerts} active={(stats?.lowStockCount ?? 0) === 0} />
              <StatusLine label={t.smartWaitlist} active />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[0.85fr_1.15fr] gap-6">
          <ClinicPwaPractitionerCard />

          <div className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{t.dashboardAnalyticsLabel}</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">{t.dashboardDeepFocusModules}</h2>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-400" aria-hidden />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {intelligenceActions.map((action) => (
                <CommandAction key={action.href} {...action} compact />
              ))}
              {stats?.bookingUrl && (
                <CommandAction href={stats.bookingUrl} label={t.publicBookingLink} icon={LinkIcon} compact />
              )}
            </div>
          </div>
        </div>

        {stats?.bookingUrl && (
          <BookingChannelLinksCard
            bookingEnabled={stats.publicBookingEnabled}
            copiedLink={copiedLink}
            channelUrl={channelUrl}
            copyText={copyText}
            practiceName={stats.practiceName}
            procedures={stats.bookingProcedures}
            t={t}
            desktop
          />
        )}

        <p className="text-xs text-slate-500">{t.docsFooter}</p>
      </section>
    </>
  )
}

type DashboardAction = {
  href: string
  label: string
  icon: typeof CalendarClock
  primary?: boolean
  compact?: boolean
}

function BookingChannelLinksCard({
  bookingEnabled,
  copiedLink,
  channelUrl,
  copyText,
  practiceName,
  procedures,
  t,
  desktop = false,
}: {
  bookingEnabled: boolean
  copiedLink: string
  channelUrl: (channel: BookingChannel, procedureId?: string | null) => string
  copyText: (value: string, label: string) => Promise<void>
  practiceName: string | null
  procedures: Array<{ id: string; name: string }>
  t: ClinicStrings
  desktop?: boolean
}) {
  const channels: BookingChannel[] = ['google', 'instagram', 'whatsapp']
  const primaryProcedure = procedures[0] ?? null

  return (
    <section
      className={clsx(
        'rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur',
        desktop && 'p-6'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{t.bookingChannelLinks}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{t.bookingChannelLinksHint}</p>
          {!bookingEnabled && <p className="mt-2 text-xs font-semibold text-amber-700">{t.bookingChannelEnableFirst}</p>}
        </div>
        {copiedLink && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t.copied}: {copiedLink}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {channels.map((channel) => {
          const label = bookingChannelLabel(channel)
          const url = channelUrl(channel)
          const copyValue =
            channel === 'whatsapp'
              ? bookingChannelWhatsappText(url, practiceName)
              : url

          return (
            <button
              key={channel}
              type="button"
              onClick={() => void copyText(copyValue, label)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-orange-200 hover:shadow-sm"
            >
              <span className="font-semibold text-slate-950">{label}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">{url}</span>
            </button>
          )
        })}
      </div>

      {primaryProcedure && (
        <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{t.serviceDirectLinks}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {procedures.slice(0, 3).map((procedure) => (
              <button
                key={procedure.id}
                type="button"
                onClick={() => void copyText(channelUrl('instagram', procedure.id), procedure.name)}
                className="rounded-xl bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800"
              >
                <span className="block truncate">{procedure.name}</span>
                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{t.copyInstagramServiceLink}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ActionRow({ href, label, icon: Icon, primary }: DashboardAction) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex min-h-14 items-center justify-between rounded-2xl px-4 text-sm font-semibold transition active:scale-[0.99]',
        primary ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15' : 'border border-slate-200 bg-white text-slate-800'
      )}
    >
      <span className="inline-flex items-center gap-3">
        <Icon className={clsx('h-5 w-5', primary ? 'text-orange-300' : 'text-slate-500')} aria-hidden />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-current opacity-50" aria-hidden />
    </Link>
  )
}

function CommandAction({ href, label, icon: Icon, primary, compact }: DashboardAction) {
  return (
    <Link
      href={href}
      className={clsx(
        'group rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-xl',
        compact ? 'min-h-24' : 'min-h-32',
        primary
          ? 'border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-950/15'
          : 'border-slate-200 bg-white/88 text-slate-950 hover:border-orange-200'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={clsx(
            'flex h-11 w-11 items-center justify-center rounded-2xl',
            primary ? 'bg-white/10 text-orange-300' : 'bg-orange-50 text-orange-600'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold leading-snug">{label}</p>
    </Link>
  )
}

function MobileMetric({
  href,
  label,
  value,
  icon: Icon,
}: {
  href: string
  label: string
  value: number
  icon: typeof Users
  tone: string
}) {
  return (
    <Link href={href} className="rounded-[1.5rem] border border-white/80 bg-white/85 p-4 shadow-sm active:scale-[0.99]">
      <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium leading-snug text-slate-500">{label}</p>
    </Link>
  )
}

function DesktopMetric({
  href,
  label,
  value,
  icon: Icon,
  tone,
}: {
  href: string
  label: string
  value: number
  icon: typeof Users
  tone: string
}) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-50 text-amber-700 ring-amber-100'
      : tone === 'emerald'
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
        : tone === 'sky'
          ? 'bg-sky-50 text-sky-700 ring-sky-100'
          : tone === 'violet'
            ? 'bg-violet-50 text-violet-700 ring-violet-100'
            : 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-white/80 bg-white/82 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70"
    >
      <div className="flex items-center justify-between">
        <span className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl ring-1', toneClass)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Link>
  )
}

function StatusLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={clsx('h-2.5 w-2.5 rounded-full', active ? 'bg-emerald-300' : 'bg-amber-300')} />
    </div>
  )
}
