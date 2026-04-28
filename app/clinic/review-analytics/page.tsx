'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, MessageCircleReply, RefreshCw, Send, Star, Upload } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type ReviewAnalytics = {
  range: '30d' | '90d' | 'all'
  totals: {
    total: number
    requested: number
    replied: number
    published: number
    archived: number
    rated: number
    averageRating: number | null
    replyRatePct: number
    publishRatePct: number
    negativeCount: number
  }
  ratingDistribution: Array<{ rating: number; count: number }>
  negativeQueue: Array<{
    id: string
    status: string
    rating: number | null
    privateNote: string | null
    publicComment: string | null
    requestedAt: string | null
    repliedAt: string | null
    publishedAt: string | null
    visitAt: string | null
    serviceName: string
    patient: { id: string; firstName: string; lastName: string; phone: string | null }
  }>
}

export default function ClinicReviewAnalyticsPage() {
  const { locale, t } = useClinicLocale()
  const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [range, setRange] = useState<'30d' | '90d' | 'all'>('90d')
  const [overview, setOverview] = useState<ReviewAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/review-analytics/overview?range=${range}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setOverview(data)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [range, t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !overview) return <ClinicSpinner label={t.loading} />

  const maxRatingCount = Math.max(1, ...(overview?.ratingDistribution ?? []).map((row) => row.count))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{t.reviewAnalytics}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              {t.reviewAnalyticsIntro}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['30d', t.financeLast30Days],
              ['90d', t.reviewAnalyticsLast90Days],
              ['all', t.reviewAnalyticsAllTime],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value as '30d' | '90d' | 'all')}
                className={`min-h-11 rounded-2xl px-4 text-sm font-semibold ${
                  range === value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'border border-orange-100 bg-white text-orange-800 hover:bg-orange-50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold text-orange-800 hover:bg-orange-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t.refresh}
            </button>
          </div>
        </div>
      </section>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Send}
          label={t.requestedReviews}
          value={String(overview?.totals.requested ?? 0)}
          hint={`${t.reviews}: ${overview?.totals.total ?? 0}`}
        />
        <MetricCard
          icon={MessageCircleReply}
          label={t.repliedReviews}
          value={`${(overview?.totals.replyRatePct ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%`}
          hint={`${overview?.totals.replied ?? 0} ${t.reviewAnalyticsReplies}`}
        />
        <MetricCard
          icon={Upload}
          label={t.publishedReviews}
          value={`${(overview?.totals.publishRatePct ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}%`}
          hint={`${overview?.totals.published ?? 0} ${t.reviewAnalyticsPublishedItems}`}
        />
        <MetricCard
          icon={Star}
          label={t.reviewAnalyticsAverageRating}
          value={overview?.totals.averageRating ? `${overview.totals.averageRating}/5` : t.emptyValue}
          hint={`${overview?.totals.rated ?? 0} ${t.reviewAnalyticsRated}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
            <h2 className="text-lg font-semibold text-gray-950">{t.reviewAnalyticsRatingMix}</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(overview?.ratingDistribution ?? []).slice().reverse().map((row) => (
              <div key={row.rating} className="grid grid-cols-[40px_1fr_44px] items-center gap-3 text-sm">
                <span className="font-semibold text-gray-800">{row.rating}★</span>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${(row.count / maxRatingCount) * 100}%` }}
                  />
                </div>
                <span className="text-right tabular-nums text-gray-600">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-semibold">{t.reviewAnalyticsNegativeQueue}</h2>
          </div>
          <p className="mt-2 text-sm text-amber-900">{t.reviewAnalyticsNegativeQueueHint}</p>
          <p className="mt-5 text-4xl font-semibold tabular-nums">{overview?.totals.negativeCount ?? 0}</p>
          <p className="mt-1 text-sm text-amber-900">{t.reviewAnalyticsNegativeTotal}</p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{t.reviewAnalyticsPrivateQueue}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.reviewAnalyticsPrivateQueueHint}</p>
          </div>
          <Link href="/clinic/reputation" className="text-sm font-semibold text-orange-700 hover:text-orange-800">
            {t.reputation}
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {(overview?.negativeQueue ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
              {t.reviewAnalyticsNoNegativeQueue}
            </p>
          ) : (
            overview?.negativeQueue.map((review) => (
              <article key={review.id} className="rounded-3xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                      {review.rating ?? t.emptyValue}/5 · {review.serviceName}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-950">
                      {review.patient.lastName}, {review.patient.firstName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {review.visitAt
                        ? new Date(review.visitAt).toLocaleString(dateLocale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : t.emptyValue}
                    </p>
                  </div>
                  <Link
                    href="/clinic/reputation"
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {t.reviewAnalyticsOpenReview}
                  </Link>
                </div>
                {review.privateNote && (
                  <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-gray-700">{review.privateNote}</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Star
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-orange-600" aria-hidden />
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
