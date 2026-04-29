'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  ChevronRight,
  FileSpreadsheet,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'
import clsx from 'clsx'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import { PATIENT_CATEGORIES, PATIENT_TAGS, type PatientCategory, type PatientTag } from '@/lib/clinic/patient-tags'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicEmptyState } from '@/components/clinic/ClinicEmptyState'

type Patient = {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
  phone: string | null
  email: string | null
  category: PatientCategory | null
  tags: PatientTag[]
  clientBalance: ClientBalance
  createdAt?: string
}

type SortMode = 'nameAsc' | 'nameDesc' | 'newest'

type ClientBalance = {
  currency: string
  dueCents: number
  creditCents: number
  status: 'CLEAR' | 'DEBT' | 'CREDIT'
}

const PATIENT_ACCENTS = [
  {
    avatar: 'from-rose-500 to-orange-400',
    ring: 'ring-rose-100',
    chip: 'bg-rose-50 text-rose-700 ring-rose-100',
    border: 'hover:border-rose-200',
  },
  {
    avatar: 'from-sky-500 to-cyan-400',
    ring: 'ring-sky-100',
    chip: 'bg-sky-50 text-sky-700 ring-sky-100',
    border: 'hover:border-sky-200',
  },
  {
    avatar: 'from-violet-500 to-fuchsia-400',
    ring: 'ring-violet-100',
    chip: 'bg-violet-50 text-violet-700 ring-violet-100',
    border: 'hover:border-violet-200',
  },
  {
    avatar: 'from-emerald-500 to-teal-400',
    ring: 'ring-emerald-100',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    border: 'hover:border-emerald-200',
  },
  {
    avatar: 'from-amber-500 to-yellow-400',
    ring: 'ring-amber-100',
    chip: 'bg-amber-50 text-amber-800 ring-amber-100',
    border: 'hover:border-amber-200',
  },
  {
    avatar: 'from-indigo-500 to-blue-400',
    ring: 'ring-indigo-100',
    chip: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    border: 'hover:border-indigo-200',
  },
] as const

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function patientAccent(patient: Patient) {
  const index = hashString(`${patient.id}${patient.firstName}${patient.lastName}`) % PATIENT_ACCENTS.length
  return PATIENT_ACCENTS[index] ?? PATIENT_ACCENTS[0]
}

function patientDisplayName(patient: Patient) {
  return [patient.lastName, patient.firstName, patient.middleName].filter(Boolean).join(' ')
}

function patientInitials(patient: Patient) {
  const first = patient.firstName.trim().charAt(0)
  const last = patient.lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || 'P'
}

function categoryLabel(t: ReturnType<typeof useClinicLocale>['t'], category: PatientCategory) {
  if (category === 'VIP') return t.categoryVip
  if (category === 'REGULAR') return t.categoryRegular
  if (category === 'NEW') return t.categoryNew
  if (category === 'SENSITIVE') return t.categorySensitive
  return t.categoryHighRisk
}

function tagLabel(t: ReturnType<typeof useClinicLocale>['t'], tag: PatientTag) {
  if (tag === 'vip') return t.tagVip
  if (tag === 'regular') return t.tagRegular
  if (tag === 'new') return t.tagNew
  if (tag === 'sensitive') return t.tagSensitive
  if (tag === 'high-risk') return t.tagHighRisk
  if (tag === 'follow-up-due') return t.tagFollowUpDue
  return t.tagLatePayer
}

function formatDob(iso: string, locale: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatAge(iso: string, t: ReturnType<typeof useClinicLocale>['t']) {
  const dob = new Date(iso)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const hasBirthdayPassed =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate())
  if (!hasBirthdayPassed) age -= 1
  return age >= 0 ? `${age} ${t.ageYears}` : null
}

function formatMoney(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function balanceLabel(t: ReturnType<typeof useClinicLocale>['t'], balance: ClientBalance) {
  if (balance.status === 'DEBT') return `${t.balanceDebt}: ${formatMoney(balance.dueCents, balance.currency)}`
  if (balance.status === 'CREDIT') return `${t.balanceCredit}: ${formatMoney(balance.creditCents, balance.currency)}`
  return t.balanceClear
}

function balanceClass(balance: ClientBalance) {
  if (balance.status === 'DEBT') return 'bg-red-50 text-red-700'
  if (balance.status === 'CREDIT') return 'bg-emerald-50 text-emerald-700'
  return 'bg-gray-100 text-gray-600'
}

export default function ClinicPatientsPage() {
  const router = useRouter()
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [sort, setSort] = useState<SortMode>('nameAsc')
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (debounced) params.set('q', debounced)
        if (category) params.set('category', category)
        if (tag) params.set('tag', tag)
        const qs = params.toString() ? `?${params.toString()}` : ''
        const res = await fetch(`/api/clinic/patients${qs}`, { credentials: 'include' })
        if (res.status === 401) {
          router.replace('/login')
          return
        }
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || t.failedToLoad)
          return
        }
        if (!cancelled) setPatients(data.patients || [])
      } catch {
        if (!cancelled) setError(t.networkError)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [category, debounced, router, tag, t.networkError, t.failedToLoad])

  const sorted = useMemo(() => {
    const list = [...patients]
    if (sort === 'nameAsc') {
      list.sort((a, b) =>
        a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
      )
    } else if (sort === 'nameDesc') {
      list.sort((a, b) =>
        b.lastName.localeCompare(a.lastName) || b.firstName.localeCompare(a.firstName)
      )
    } else if (sort === 'newest') {
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })
    }
    return list
  }, [patients, sort])

  if (loading && patients.length === 0 && !error) {
    return <ClinicSpinner label={t.loading} />
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.patients}</h1>
            <p className="text-gray-600 text-sm mt-1">{t.searchPatientsHint}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Link
              href="/clinic/patients/import"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-orange-200 bg-white px-4 text-sm font-semibold text-orange-700 hover:bg-orange-50 sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" aria-hidden />
              {t.importPatients}
            </Link>
            <Link
              href="/clinic/patients/new"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden />
              {t.addPatient}
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPatients}
            className="w-full ps-12 pe-4 py-4 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 outline-none min-h-11"
            autoCapitalize="words"
            autoCorrect="off"
            aria-label={t.searchPatients}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-sm text-gray-600">
            <span className="mb-1 block">{t.sortBy}</span>
            <select
              id="patient-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm min-h-11"
            >
              <option value="nameAsc">{t.sortNameAsc}</option>
              <option value="nameDesc">{t.sortNameDesc}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </label>
          <label className="text-sm text-gray-600">
            <span className="mb-1 block">{t.patientCategory}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm min-h-11"
            >
              <option value="">{t.allCategories}</option>
              {PATIENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel(t, value)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-600">
            <span className="mb-1 block">{t.patientTags}</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm min-h-11"
            >
              <option value="">{t.allTags}</option>
              {PATIENT_TAGS.map((value) => (
                <option key={value} value={value}>
                  {tagLabel(t, value)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      {loading && patients.length > 0 && (
        <p className="text-xs text-gray-400" role="status">
          {t.loading}
        </p>
      )}

      {!loading && sorted.length === 0 && !error && (
        <ClinicEmptyState
          title={debounced ? t.noMatches : t.noPatients}
          action={
            <Link
              href="/clinic/patients/new"
              className="inline-flex w-full items-center justify-center min-h-11 rounded-xl bg-orange-500 text-white text-sm font-semibold"
            >
              {t.addPatient}
            </Link>
          }
        />
      )}

      {sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((p) => {
            const accent = patientAccent(p)
            const age = formatAge(p.dateOfBirth, t)
            const tagLabels = Array.from(new Set(p.tags.map((item) => tagLabel(t, item))))
            return (
              <Link
                key={p.id}
                href={`/clinic/patients/${p.id}`}
                className={clsx(
                  'group block rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 sm:p-5',
                  accent.border
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div
                      className={clsx(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-black tracking-wide text-white shadow-sm ring-4 sm:h-16 sm:w-16 sm:text-lg',
                        accent.avatar,
                        accent.ring
                      )}
                      aria-hidden
                    >
                      {patientInitials(p)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-lg font-bold text-gray-950 sm:text-xl">
                          {patientDisplayName(p)}
                        </h2>
                        {p.category && (
                          <span
                            className={clsx(
                              'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1',
                              accent.chip
                            )}
                          >
                            {categoryLabel(t, p.category)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-gray-50 px-3 font-medium ring-1 ring-gray-100">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                          {formatDob(p.dateOfBirth, dateLocale)}
                          {age ? <span className="text-gray-400">({age})</span> : null}
                        </span>
                        {p.phone && (
                          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-gray-50 px-3 font-medium ring-1 ring-gray-100">
                            <Phone className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                            {p.phone}
                          </span>
                        )}
                        {p.email && (
                          <span className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full bg-gray-50 px-3 font-medium ring-1 ring-gray-100">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                            <span className="truncate">{p.email}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tagLabels.slice(0, 4).map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600"
                          >
                            {label}
                          </span>
                        ))}
                        <span
                          className={clsx(
                            'rounded-full px-2.5 py-1 text-[11px] font-bold',
                            balanceClass(p.clientBalance)
                          )}
                        >
                          {balanceLabel(t, p.clientBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700 lg:min-w-36 lg:justify-end lg:bg-transparent lg:px-0">
                    <span className="inline-flex items-center gap-2 lg:hidden">
                      <UserRound className="h-4 w-4 text-gray-400" aria-hidden />
                      {t.profileHeading}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
