'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Gift, MessageCircle, RefreshCw, Sparkles, Star, Trophy, UserRound } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type LoyaltyRow = {
  patientId: string
  patientName: string
  phone: string | null
  totalPoints: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP'
  paidSpendCents: number
  completedVisits: number
  packagePurchases: number
  referralCount: number
  message: string
  whatsappUrl: string | null
  actionHref: string
}

type LoyaltyData = {
  summary: { members: number; totalPoints: number; vip: number; gold: number; withWhatsapp: number }
  rows: LoyaltyRow[]
}

const copy = {
  en: {
    title: 'Loyalty & client points',
    badge: 'Repeat rewards',
    intro: 'Reward repeat visits, package purchases, spend, and referrals without adding a heavy loyalty system.',
    guardrail: 'Points are derived from existing records. Review rewards manually before promising discounts or gifts.',
    refresh: 'Refresh',
    members: 'Members',
    totalPoints: 'Total points',
    vip: 'VIP',
    gold: 'Gold',
    withWhatsapp: 'With WhatsApp',
    leaderboard: 'Client points leaderboard',
    noRows: 'No loyalty points yet. Completed visits, paid spend, packages, or referrals will appear here.',
    spend: 'Spend',
    visits: 'Visits',
    packages: 'Packages',
    referrals: 'Referrals',
    copyMessage: 'Copy reward message',
    copied: 'Copied',
    openWhatsapp: 'Open WhatsApp',
    openPatient: 'Open patient',
    noPhone: 'No WhatsApp phone',
  },
  ru: {
    title: 'Лояльность и баллы клиентов',
    badge: 'Награды за повторные визиты',
    intro: 'Поощряйте повторные визиты, покупку пакетов, выручку и рекомендации без тяжёлой loyalty-системы.',
    guardrail: 'Баллы считаются из существующих записей. Перед обещанием скидки или подарка проверьте вручную.',
    refresh: 'Обновить',
    members: 'Участники',
    totalPoints: 'Всего баллов',
    vip: 'VIP',
    gold: 'Gold',
    withWhatsapp: 'С WhatsApp',
    leaderboard: 'Рейтинг баллов клиентов',
    noRows: 'Баллов пока нет. Завершённые визиты, оплаты, пакеты или рекомендации появятся здесь.',
    spend: 'Выручка',
    visits: 'Визиты',
    packages: 'Пакеты',
    referrals: 'Рекомендации',
    copyMessage: 'Скопировать сообщение',
    copied: 'Скопировано',
    openWhatsapp: 'Открыть WhatsApp',
    openPatient: 'Открыть пациента',
    noPhone: 'Нет телефона WhatsApp',
  },
} as const

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function ClinicLoyaltyPage() {
  const { locale } = useClinicLocale()
  const c = copy[locale]
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const [data, setData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/loyalty/overview?locale=${locale}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || c.noRows)
        return
      }
      setData(json)
    } catch {
      setError(c.noRows)
    } finally {
      setLoading(false)
    }
  }, [c.noRows, locale])

  useEffect(() => {
    void load()
  }, [load])

  const copyMessage = async (patientId: string, message: string) => {
    await navigator.clipboard.writeText(message)
    setCopiedId(patientId)
    window.setTimeout(() => setCopiedId(''), 1600)
  }

  if (loading && !data) return <ClinicSpinner label={c.title} />

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <header className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-xl shadow-orange-100/50 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <Trophy className="h-3.5 w-3.5" />
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

      <section className="grid gap-4 md:grid-cols-5">
        <Metric label={c.members} value={String(data?.summary.members ?? 0)} />
        <Metric label={c.totalPoints} value={(data?.summary.totalPoints ?? 0).toLocaleString(numberLocale)} />
        <Metric label={c.vip} value={String(data?.summary.vip ?? 0)} />
        <Metric label={c.gold} value={String(data?.summary.gold ?? 0)} />
        <Metric label={c.withWhatsapp} value={String(data?.summary.withWhatsapp ?? 0)} />
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-950">{c.leaderboard}</h2>
        </div>

        {data?.rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">{c.noRows}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data?.rows.map((row) => (
              <article key={row.patientId} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-white p-3 text-amber-700 shadow-sm">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-950">{row.patientName}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {row.totalPoints.toLocaleString(numberLocale)} pts · {row.tier}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <Star className="h-3.5 w-3.5" />
                    {row.tier}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-4">
                  <Mini label={c.spend} value={money(row.paidSpendCents, numberLocale)} />
                  <Mini label={c.visits} value={String(row.completedVisits)} />
                  <Mini label={c.packages} value={String(row.packagePurchases)} />
                  <Mini label={c.referrals} value={String(row.referralCount)} />
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
                  <Link
                    href={row.actionHref}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-semibold text-orange-700"
                  >
                    <Gift className="h-4 w-4" />
                    {c.openPatient}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <p className="mt-1 font-semibold text-gray-950">{value}</p>
    </div>
  )
}
