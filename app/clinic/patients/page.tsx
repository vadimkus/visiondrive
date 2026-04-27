'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
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
  createdAt?: string
}

type SortMode = 'nameAsc' | 'nameDesc' | 'newest'

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.patients}</h1>
            <p className="text-gray-600 text-sm mt-1">{t.searchPatientsHint}</p>
          </div>
          <Link
            href="/clinic/patients/new"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden />
            {t.addPatient}
          </Link>
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.patients}</th>
                  <th className="px-4 py-3 font-medium">{t.dobLabel}</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">{t.phoneLabel}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clinic/patients/${p.id}`}
                        className="font-medium text-gray-900 hover:text-orange-600 min-h-11 inline-flex items-center"
                      >
                        {p.lastName}, {p.firstName}
                        {p.middleName ? ` ${p.middleName}` : ''}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p.category && (
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                            {categoryLabel(t, p.category)}
                          </span>
                        )}
                        {p.tags.slice(0, 3).map((item) => (
                          <span key={item} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                            {tagLabel(t, item)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDob(p.dateOfBirth, dateLocale)}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
