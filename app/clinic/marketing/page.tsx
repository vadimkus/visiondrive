'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Copy, Megaphone, MessageCircle, RefreshCw, Sparkles, UserRound } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { MarketingSegmentKey } from '@/lib/clinic/marketing-automation'

type MarketingData = {
  segment: MarketingSegmentKey
  days: number
  tag: string | null
  procedureId: string | null
  segments: MarketingSegmentKey[]
  availableTags: string[]
  procedures: Array<{ id: string; name: string }>
  summary: { matchingPatients: number; withWhatsapp: number; missingWhatsapp: number }
  rows: Array<{
    patientId: string
    patientName: string
    firstName: string
    phone: string | null
    email: string | null
    reason: string
    message: string
    whatsappUrl: string | null
    actionHref: string
    lastVisitAt: string | null
    lastProcedureName: string | null
    daysSinceLastVisit: number | null
    packageRemainingSessions: number | null
    daysUntilBirthday: number | null
  }>
}

const copy = {
  en: {
    title: 'Marketing automation',
    badge: 'Manual campaigns',
    intro: 'Build patient segments from live data, preview WhatsApp copy, and send reactivation or repeat-booking messages manually.',
    segment: 'Segment',
    tag: 'Tag',
    service: 'Service',
    days: 'Days',
    allTags: 'Any tag',
    allServices: 'Any service',
    refresh: 'Refresh',
    matching: 'Matching patients',
    withWhatsapp: 'With WhatsApp',
    missingWhatsapp: 'Missing phone',
    preview: 'Campaign preview',
    noRows: 'No matching patients for this segment.',
    copyMessage: 'Copy message',
    copied: 'Copied',
    openWhatsapp: 'Open WhatsApp',
    openPatient: 'Open patient',
    noPhone: 'No WhatsApp phone',
    reason: 'Reason',
    segment_tag: 'By tag',
    segment_service: 'By service',
    segment_last_visit: 'Last visit',
    segment_package_balance: 'Package balance',
    segment_birthday: 'Birthday',
    segment_dormant: 'Dormant',
    segment_no_show: 'No-show recovery',
    guardrail: 'Nothing is auto-sent. Each message should be reviewed before WhatsApp opens.',
  },
  ru: {
    title: 'Маркетинг-автоматизация',
    badge: 'Ручные кампании',
    intro: 'Собирайте сегменты пациентов из живых данных, проверяйте WhatsApp-текст и отправляйте реактивацию или повторную запись вручную.',
    segment: 'Сегмент',
    tag: 'Тег',
    service: 'Услуга',
    days: 'Дни',
    allTags: 'Любой тег',
    allServices: 'Любая услуга',
    refresh: 'Обновить',
    matching: 'Пациентов в сегменте',
    withWhatsapp: 'С WhatsApp',
    missingWhatsapp: 'Нет телефона',
    preview: 'Предпросмотр кампании',
    noRows: 'Нет пациентов для этого сегмента.',
    copyMessage: 'Скопировать',
    copied: 'Скопировано',
    openWhatsapp: 'Открыть WhatsApp',
    openPatient: 'Открыть пациента',
    noPhone: 'Нет телефона WhatsApp',
    reason: 'Причина',
    segment_tag: 'По тегу',
    segment_service: 'По услуге',
    segment_last_visit: 'Последний визит',
    segment_package_balance: 'Баланс пакета',
    segment_birthday: 'День рождения',
    segment_dormant: 'Спящие клиенты',
    segment_no_show: 'Возврат no-show',
    guardrail: 'Ничего не отправляется автоматически. Каждый текст нужно проверить перед открытием WhatsApp.',
  },
} as const

export default function MarketingAutomationPage() {
  const { locale } = useClinicLocale()
  const c = copy[locale]
  const [segment, setSegment] = useState<MarketingSegmentKey>('dormant')
  const [tag, setTag] = useState('')
  const [procedureId, setProcedureId] = useState('')
  const [days, setDays] = useState(90)
  const [data, setData] = useState<MarketingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const params = useMemo(() => {
    const query = new URLSearchParams({
      segment,
      locale,
      days: String(days),
    })
    if (tag) query.set('tag', tag)
    if (procedureId) query.set('procedureId', procedureId)
    return query
  }, [days, locale, procedureId, segment, tag])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/marketing/segments?${params.toString()}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Could not load marketing segment')
        return
      }
      setData(json)
    } catch {
      setError('Could not load marketing segment')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    void load()
  }, [load])

  const copyMessage = async (patientId: string, message: string) => {
    await navigator.clipboard.writeText(message)
    setCopiedId(patientId)
    window.setTimeout(() => setCopiedId(''), 1600)
  }

  if (loading && !data) return <ClinicSpinner label="Marketing..." />

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-800">
              <Megaphone className="h-3.5 w-3.5" />
              {c.badge}
            </div>
            <h1 className="text-2xl font-semibold text-gray-950 md:text-3xl">{c.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{c.intro}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            {c.refresh}
          </button>
        </div>
      </header>

      <ClinicAlert variant="warning">{c.guardrail}</ClinicAlert>
      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{c.segment}</span>
            <select
              value={segment}
              onChange={(event) => setSegment(event.target.value as MarketingSegmentKey)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
            >
              {(data?.segments ?? ['tag', 'service', 'last_visit', 'package_balance', 'birthday', 'dormant', 'no_show']).map((item) => (
                <option key={item} value={item}>
                  {c[`segment_${item}`]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{c.tag}</span>
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
            >
              <option value="">{c.allTags}</option>
              {(data?.availableTags ?? []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{c.service}</span>
            <select
              value={procedureId}
              onChange={(event) => setProcedureId(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-base"
            >
              <option value="">{c.allServices}</option>
              {(data?.procedures ?? []).map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-gray-600">{c.days}</span>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(event) => setDays(Number(event.target.value) || 1)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-base"
            />
          </label>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={c.matching} value={data?.summary.matchingPatients ?? 0} />
        <MetricCard label={c.withWhatsapp} value={data?.summary.withWhatsapp ?? 0} />
        <MetricCard label={c.missingWhatsapp} value={data?.summary.missingWhatsapp ?? 0} />
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-fuchsia-600" />
          <h2 className="text-lg font-semibold text-gray-950">{c.preview}</h2>
        </div>

        {data?.rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
            {c.noRows}
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data?.rows.map((row) => (
              <article key={row.patientId} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-white p-3 text-fuchsia-700 shadow-sm">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-950">{row.patientName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {c.reason}: {row.reason}
                      </p>
                    </div>
                  </div>
                  <Link href={row.actionHref} className="text-xs font-semibold text-orange-700 hover:text-orange-800">
                    {c.openPatient}
                  </Link>
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-relaxed text-gray-800">
                  {row.message}
                </pre>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void copyMessage(row.patientId, row.message)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedId === row.patientId ? c.copied : c.copyMessage}
                  </button>
                  {row.whatsappUrl ? (
                    <a
                      href={row.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {c.openWhatsapp}
                    </a>
                  ) : (
                    <span className="inline-flex min-h-10 flex-1 items-center justify-center rounded-2xl bg-gray-100 px-3 text-sm font-semibold text-gray-500">
                      {c.noPhone}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}
