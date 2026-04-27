'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Save, Star } from 'lucide-react'
import { ClinicAlert } from '@/components/clinic/ClinicAlert'
import { ClinicSpinner } from '@/components/clinic/ClinicSpinner'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'

type ReviewStatus = 'REQUESTED' | 'REPLIED' | 'PUBLISHED' | 'ARCHIVED'

type Review = {
  id: string
  status: ReviewStatus
  rating: number | null
  privateNote: string | null
  publicComment: string | null
  requestedAt: string | null
  repliedAt: string | null
  publishedAt: string | null
  patient: { id: string; firstName: string; lastName: string; phone: string | null }
  appointment: {
    id: string
    startsAt: string
    procedure: { name: string } | null
    titleOverride: string | null
  } | null
  reminderDelivery: {
    id: string
    status: string
    whatsappUrl: string | null
    error: string | null
  } | null
}

type Overview = {
  total: number
  requested: number
  replied: number
  published: number
  averageRating: number | null
}

function serviceLabel(review: Review) {
  return review.appointment?.procedure?.name || review.appointment?.titleOverride || 'Appointment'
}

export default function ClinicReputationPage() {
  const { locale, t } = useClinicLocale()
  const isRu = locale === 'ru'
  const dateLocale = isRu ? 'ru-RU' : 'en-GB'
  const copy = useMemo(
    () => ({
      title: isRu ? 'Репутация' : 'Reputation',
      subtitle: isRu
        ? 'Запрашивайте отзывы после визита, фиксируйте ответы и публикуйте только проверенные тексты.'
        : 'Request reviews after visits, capture replies, and publish only vetted feedback.',
      rating: isRu ? 'Оценка' : 'Rating',
      visit: isRu ? 'Визит' : 'Visit',
      saved: isRu ? 'Отзыв сохранен.' : 'Review saved.',
      openWhatsapp: isRu ? 'Открыть WhatsApp' : 'Open WhatsApp',
    }),
    [isRu]
  )

  const [reviews, setReviews] = useState<Review[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clinic/reviews', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.failedToLoad)
        return
      }
      setReviews(data.reviews || [])
      setOverview(data.overview || null)
    } catch {
      setError(t.networkError)
    } finally {
      setLoading(false)
    }
  }, [t.failedToLoad, t.networkError])

  useEffect(() => {
    void load()
  }, [load])

  function updateReview(id: string, patch: Partial<Review>) {
    setReviews((current) =>
      current.map((review) => (review.id === id ? { ...review, ...patch } : review))
    )
  }

  async function saveReview(review: Review, status?: ReviewStatus) {
    setSavingId(review.id)
    setMessage('')
    setError('')
    try {
      const nextStatus = status ?? review.status
      const res = await fetch(`/api/clinic/reviews/${review.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          rating: review.rating,
          privateNote: review.privateNote,
          publicComment: review.publicComment,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.saveFailed)
        return
      }
      setReviews((current) => current.map((item) => (item.id === review.id ? data.review : item)))
      setMessage(copy.saved)
      await load()
    } catch {
      setError(t.networkError)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <ClinicSpinner label={t.loading} />

  const statusLabels: Record<ReviewStatus, string> = {
    REQUESTED: t.reviewStatusRequested,
    REPLIED: t.reviewStatusReplied,
    PUBLISHED: t.reviewStatusPublished,
    ARCHIVED: t.reviewStatusArchived,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm md:p-7">
        <Link href="/clinic" className="text-sm text-orange-700 hover:text-orange-800">
          {t.backDashboard}
        </Link>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{copy.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{copy.subtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            {overview?.averageRating ? `${overview.averageRating}/5` : t.emptyValue}
          </div>
        </div>
      </div>

      {error && <ClinicAlert variant="error">{error}</ClinicAlert>}
      {message && <ClinicAlert variant="success">{message}</ClinicAlert>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label={t.reviews} value={overview?.total ?? 0} />
        <Metric label={t.requestedReviews} value={overview?.requested ?? 0} />
        <Metric label={t.repliedReviews} value={overview?.replied ?? 0} />
        <Metric label={t.publishedReviews} value={overview?.published ?? 0} />
      </div>

      <section className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            {t.noReviewsYet}
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    {statusLabels[review.status]} · {serviceLabel(review)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-950">
                    {review.patient.lastName}, {review.patient.firstName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {copy.visit}:{' '}
                    {review.appointment
                      ? new Date(review.appointment.startsAt).toLocaleString(dateLocale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : t.emptyValue}
                  </p>
                </div>
                {review.reminderDelivery?.whatsappUrl && (
                  <a
                    href={review.reminderDelivery.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {copy.openWhatsapp}
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_1fr]">
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block">{copy.rating}</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={review.rating ?? ''}
                    onChange={(e) =>
                      updateReview(review.id, {
                        rating: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block">{t.privateReviewNote}</span>
                  <textarea
                    rows={3}
                    value={review.privateNote ?? ''}
                    onChange={(e) => updateReview(review.id, { privateNote: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  <span className="mb-1 block">{t.publicReviewComment}</span>
                  <textarea
                    rows={3}
                    value={review.publicComment ?? ''}
                    onChange={(e) => updateReview(review.id, { publicComment: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void saveReview(review)}
                  disabled={savingId === review.id}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {savingId === review.id ? t.savingEllipsis : t.saveReview}
                </button>
                <button
                  type="button"
                  onClick={() => void saveReview(review, 'REPLIED')}
                  disabled={savingId === review.id}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {t.markReviewReplied}
                </button>
                <button
                  type="button"
                  onClick={() => void saveReview(review, 'PUBLISHED')}
                  disabled={savingId === review.id}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                  {t.markReviewPublished}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
    </div>
  )
}
