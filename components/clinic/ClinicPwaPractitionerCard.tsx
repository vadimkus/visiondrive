'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  Download,
  FileText,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type TodayAppointment = {
  id: string
  startsAt: string
  status: string
  titleOverride: string | null
  patient: { id: string; firstName: string; lastName: string }
  procedure: { name: string } | null
}

function todayRange() {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + 1)
  return { from, to }
}

function appointmentLabel(item: TodayAppointment) {
  return item.procedure?.name ?? item.titleOverride ?? 'Appointment'
}

const DRAFT_KEY = 'clinic:pwa-offline-note-draft'

export function ClinicPwaPractitionerCard() {
  const { locale, t } = useClinicLocale()
  const [online, setOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [appointments, setAppointments] = useState<TodayAppointment[]>([])
  const [loadingAgenda, setLoadingAgenda] = useState(true)
  const [draft, setDraft] = useState('')

  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'

  useEffect(() => {
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/clinic-push-sw.js').catch(() => {})
    }
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    try {
      setDraft(window.localStorage.getItem(DRAFT_KEY) ?? '')
    } catch {
      setDraft('')
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, draft)
    } catch {
      /* ignore */
    }
  }, [draft])

  const loadAgenda = async () => {
    setLoadingAgenda(true)
    try {
      const { from, to } = todayRange()
      const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })
      const res = await fetch(`/api/clinic/appointments?${params}`, { credentials: 'include' })
      if (!res.ok) {
        setAppointments([])
        return
      }
      const data = await res.json()
      setAppointments(Array.isArray(data.appointments) ? data.appointments.slice(0, 5) : [])
    } catch {
      setAppointments([])
    } finally {
      setLoadingAgenda(false)
    }
  }

  useEffect(() => {
    void loadAgenda()
  }, [])

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice.catch(() => null)
    setInstallPrompt(null)
  }

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    [appointments]
  )

  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 p-4 text-white shadow-xl shadow-orange-200/40 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex-1 space-y-3 md:space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-100">
                {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {online ? t.pwaOnline : t.pwaOffline}
              </div>
              <h2 className="mt-3 text-xl font-semibold">{t.pwaPractitionerMode}</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-orange-50/75">{t.pwaPractitionerModeHint}</p>
            </div>
            {installPrompt && (
              <button
                type="button"
                onClick={() => void install()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-gray-950 hover:bg-orange-50"
              >
                <Download className="h-4 w-4" aria-hidden />
                {t.pwaInstall}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/clinic/appointments"
              className="flex min-h-[4.75rem] flex-col justify-between rounded-2xl bg-white/10 p-2.5 text-xs font-semibold leading-tight hover:bg-white/15 sm:p-3 sm:text-sm"
            >
              <CalendarClock className="h-4 w-4 text-orange-200" />
              <span>{t.pwaOpenToday}</span>
            </Link>
            <Link
              href="/clinic/appointments/new"
              className="flex min-h-[4.75rem] flex-col justify-between rounded-2xl bg-white/10 p-2.5 text-xs font-semibold leading-tight hover:bg-white/15 sm:p-3 sm:text-sm"
            >
              <Plus className="h-4 w-4 text-orange-200" />
              <span>{t.newAppointment}</span>
            </Link>
            <Link
              href="/clinic/patients"
              className="flex min-h-[4.75rem] flex-col justify-between rounded-2xl bg-white/10 p-2.5 text-xs font-semibold leading-tight hover:bg-white/15 sm:p-3 sm:text-sm"
            >
              <FileText className="h-4 w-4 text-orange-200" />
              <span>{t.pwaOpenPatientCard}</span>
            </Link>
          </div>
        </div>

        <div className="grid flex-1 gap-3 xl:grid-cols-2">
          <div className="min-w-0 rounded-3xl bg-white p-4 text-gray-900">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 text-sm font-semibold leading-snug">{t.pwaTodayAgenda}</p>
              <button
                type="button"
                onClick={() => void loadAgenda()}
                className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label={t.refresh}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {loadingAgenda ? (
                <p className="text-sm text-gray-500">{t.loading}</p>
              ) : sortedAppointments.length === 0 ? (
                <p className="text-sm text-gray-500">{t.pwaNoTodayAppointments}</p>
              ) : (
                sortedAppointments.map((item) => (
                  <Link
                    key={item.id}
                    href={`/clinic/appointments?appointmentId=${item.id}`}
                    className="block rounded-2xl border border-gray-100 p-3 hover:bg-orange-50"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(item.startsAt).toLocaleTimeString(dateLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {item.patient.lastName}, {item.patient.firstName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {appointmentLabel(item)} · {item.status}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-3xl bg-white p-4 text-gray-900">
            <p className="text-sm font-semibold leading-snug">{t.pwaOfflineDraft}</p>
            <p className="mt-1 text-xs text-gray-500">{t.pwaOfflineDraftHint}</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.pwaOfflineDraftPlaceholder}
              className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 md:min-h-28"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDraft('')}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                {t.pwaClearDraft}
              </button>
              <Link
                href="/clinic/patients"
                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-orange-50 px-3 text-xs font-semibold text-orange-800 hover:bg-orange-100"
              >
                {t.pwaAttachLater}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
