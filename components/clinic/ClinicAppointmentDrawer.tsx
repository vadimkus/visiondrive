'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { FOLLOW_UP_WEEK_OPTIONS } from '@/lib/clinic/follow-up'
import type { PatientCategory, PatientTag } from '@/lib/clinic/patient-tags'
import { useClinicLocale } from '@/lib/clinic/clinic-locale'
import type { ClinicStrings } from '@/lib/clinic/strings'

type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'

type Payment = {
  id: string
  amountCents: number
  currency: string
  method: string
  status: string
  paidAt: string
}

type Visit = {
  id: string
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
  nextSteps: string | null
  payments: Payment[]
}

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: AppointmentStatus
  titleOverride: string | null
  internalNotes: string | null
  bufferAfterMinutes: number
  overrideReason: string | null
  cancelReason: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    middleName: string | null
    phone: string | null
    email: string | null
    category: PatientCategory | null
    tags: PatientTag[]
    internalNotes: string | null
  }
  procedure: {
    id: string
    name: string
    defaultDurationMin: number
    basePriceCents: number
    currency: string
  } | null
  visits: Visit[]
  events: {
    id: string
    type: string
    message: string | null
    createdAt: string
    createdBy: { name: string | null; email: string } | null
  }[]
  reminderDeliveries: {
    id: string
    kind: string
    status: string
    scheduledFor: string
    preparedAt: string | null
    whatsappUrl: string | null
    error: string | null
    body: string
  }[]
  reviews: {
    id: string
    status: string
    rating: number | null
    requestedAt: string | null
    repliedAt: string | null
  }[]
  followUpAutomation: {
    nextAppointment: {
      id: string
      startsAt: string
      procedure: { name: string } | null
      titleOverride: string | null
    } | null
    rebookingReminderScheduled: boolean
  }
}

function money(cents: number, currency = 'AED') {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

function statusLabel(t: ClinicStrings, status: AppointmentStatus) {
  switch (status) {
    case 'CONFIRMED':
      return t.appointmentStatusConfirmed
    case 'ARRIVED':
      return t.appointmentStatusArrived
    case 'COMPLETED':
      return t.appointmentStatusCompleted
    case 'CANCELLED':
      return t.appointmentStatusCancelled
    case 'NO_SHOW':
      return t.appointmentStatusNoShow
    case 'SCHEDULED':
      return t.appointmentStatusScheduled
  }
}

function statusClasses(status: AppointmentStatus) {
  if (status === 'CONFIRMED') return 'bg-blue-50 text-blue-800 border-blue-100'
  if (status === 'ARRIVED') return 'bg-emerald-50 text-emerald-800 border-emerald-100'
  if (status === 'COMPLETED') return 'bg-gray-100 text-gray-700 border-gray-200'
  if (status === 'CANCELLED' || status === 'NO_SHOW') return 'bg-red-50 text-red-800 border-red-100'
  return 'bg-orange-50 text-orange-800 border-orange-100'
}

function categoryLabel(t: ClinicStrings, category: PatientCategory) {
  if (category === 'VIP') return t.categoryVip
  if (category === 'REGULAR') return t.categoryRegular
  if (category === 'NEW') return t.categoryNew
  if (category === 'SENSITIVE') return t.categorySensitive
  return t.categoryHighRisk
}

function tagLabel(t: ClinicStrings, tag: PatientTag) {
  if (tag === 'vip') return t.tagVip
  if (tag === 'regular') return t.tagRegular
  if (tag === 'new') return t.tagNew
  if (tag === 'sensitive') return t.tagSensitive
  if (tag === 'high-risk') return t.tagHighRisk
  if (tag === 'follow-up-due') return t.tagFollowUpDue
  return t.tagLatePayer
}

export function ClinicAppointmentDrawer({
  appointmentId,
  onClose,
  onChanged,
}: {
  appointmentId: string | null
  onClose: () => void
  onChanged: () => void
}) {
  const { locale, t } = useClinicLocale()
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-GB'
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!appointmentId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/clinic/appointments/${appointmentId}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.failedToLoad)
      }
      setAppointment(data.appointment)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.failedToLoad)
    } finally {
      setLoading(false)
    }
  }, [appointmentId, t.failedToLoad])

  useEffect(() => {
    if (!appointmentId) {
      setAppointment(null)
      setNotice('')
      return
    }
    setNotice('')
    void load()
  }, [appointmentId, load])

  const payment = useMemo(() => {
    const payments = appointment?.visits.flatMap((visit) => visit.payments) ?? []
    const paid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amountCents, 0)
    const refunded = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amountCents, 0)
    const expected = appointment?.procedure?.basePriceCents ?? 0
    return {
      paid: paid - refunded,
      due: Math.max(0, expected - (paid - refunded)),
      currency: appointment?.procedure?.currency || payments[0]?.currency || 'AED',
    }
  }, [appointment])

  async function patchStatus(status: AppointmentStatus) {
    if (!appointmentId) return
    setBusy(status)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/appointments/${appointmentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setBusy(null)
    }
  }

  async function runAction(action: string, extra?: Record<string, unknown>) {
    if (!appointmentId) return
    setBusy(action)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/appointments/${appointmentId}/actions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      if (
        action === 'send_reminder' ||
        action === 'no_show_follow_up' ||
        action === 'send_review_request'
      ) {
        if (data.reminderText && typeof navigator !== 'undefined') {
          await navigator.clipboard?.writeText(data.reminderText).catch(() => undefined)
        }
        if (data.whatsappUrl && typeof window !== 'undefined') {
          window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
        }
      }
      if (action === 'schedule_rebooking_follow_up') {
        if (data.skipped && data.futureAppointment) {
          const nextAt = new Date(data.futureAppointment.startsAt).toLocaleString(dateLocale, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
          setNotice(`${t.nextAppointmentAlreadyScheduled} ${nextAt}`)
        } else {
          setNotice(t.rebookingReminderScheduled)
        }
      }
      if (action === 'send_review_request') {
        setNotice(data.alreadyRequested ? t.reviewRequestAlreadySent : t.reviewRequestPrepared)
      }
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setBusy(null)
    }
  }

  if (!appointmentId) return null

  const start = appointment ? new Date(appointment.startsAt) : null
  const end = appointment?.endsAt ? new Date(appointment.endsAt) : null
  const occupiedUntil =
    end && appointment
      ? new Date(end.getTime() + appointment.bufferAfterMinutes * 60 * 1000)
      : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label={t.close} />
      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t.openAppointment}</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {appointment
                ? `${appointment.patient.lastName}, ${appointment.patient.firstName}`
                : t.loading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100"
            aria-label={t.close}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {loading && <p className="text-sm text-gray-500">{t.loading}</p>}
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {notice && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

          {appointment && (
            <>
              <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                      statusClasses(appointment.status)
                    )}
                  >
                    {statusLabel(t, appointment.status)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {start?.toLocaleString(dateLocale, {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">{t.procedureOptional}</p>
                    <p className="font-medium text-gray-900">
                      {appointment.procedure?.name || appointment.titleOverride || t.appointmentDefault}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t.appointmentBuffer}</p>
                    <p className="font-medium text-gray-900">
                      {appointment.bufferAfterMinutes} {t.minutesAbbr}
                    </p>
                  </div>
                  {occupiedUntil && (
                    <div className="col-span-2">
                      <p className="text-gray-500">{t.occupiedUntil}</p>
                      <p className="font-medium text-gray-900">
                        {occupiedUntil.toLocaleTimeString(dateLocale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                  {appointment.overrideReason && (
                    <div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-amber-900 text-xs font-semibold">
                        {t.appointmentOverrideReason}
                      </p>
                      <p className="mt-1 text-sm text-amber-950">{appointment.overrideReason}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.quickStatus}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ActionButton busy={busy === 'CONFIRMED'} onClick={() => patchStatus('CONFIRMED')}>
                    {t.confirmAppointment}
                  </ActionButton>
                  <ActionButton busy={busy === 'ARRIVED'} onClick={() => patchStatus('ARRIVED')}>
                    {t.markArrived}
                  </ActionButton>
                  <ActionButton busy={busy === 'COMPLETED'} onClick={() => patchStatus('COMPLETED')}>
                    {t.markCompleted}
                  </ActionButton>
                  <ActionButton busy={busy === 'NO_SHOW'} onClick={() => patchStatus('NO_SHOW')}>
                    {t.markNoShow}
                  </ActionButton>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.visitSnapshot}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ActionButton busy={busy === 'start_visit'} onClick={() => runAction('start_visit')}>
                    {t.startVisit}
                  </ActionButton>
                  <ActionButton busy={busy === 'complete_visit'} onClick={() => runAction('complete_visit')}>
                    {t.completeVisit}
                  </ActionButton>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  {appointment.visits[0]
                    ? `${appointment.visits[0].status} · ${new Date(appointment.visits[0].visitAt).toLocaleString(dateLocale)}`
                    : t.noHistory}
                </p>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.paymentSnapshot}</h3>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">{t.paid}</p>
                    <p className="font-semibold text-gray-900">{money(payment.paid, payment.currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t.due}</p>
                    <p className="font-semibold text-gray-900">{money(payment.due, payment.currency)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.reminder}</h3>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <ActionButton busy={busy === 'send_reminder'} onClick={() => runAction('send_reminder')}>
                    {t.whatsappReminder}
                  </ActionButton>
                  <ActionButton busy={busy === 'schedule_reminder'} onClick={() => runAction('schedule_reminder')}>
                    {t.scheduleReminder24h}
                  </ActionButton>
                  <ActionButton busy={busy === 'no_show_follow_up'} onClick={() => runAction('no_show_follow_up')}>
                    {t.noShowFollowUp}
                  </ActionButton>
                </div>
                {appointment.reminderDeliveries.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {appointment.reminderDeliveries.slice(0, 3).map((delivery) => (
                      <div key={delivery.id} className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                        <p className="font-semibold text-gray-900">
                          {delivery.kind.replaceAll('_', ' ')} · {delivery.status}
                        </p>
                        <p>
                          {new Date(delivery.scheduledFor).toLocaleString(dateLocale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        {delivery.error && <p className="mt-1 text-red-700">{delivery.error}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{t.followUpAutomation}</h3>
                  {appointment.followUpAutomation.rebookingReminderScheduled && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {t.rebookingReminderScheduled}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">{t.rebookingReminderHint}</p>
                {appointment.followUpAutomation.nextAppointment ? (
                  <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                    {t.nextAppointmentAlreadyScheduled}{' '}
                    {new Date(appointment.followUpAutomation.nextAppointment.startsAt).toLocaleString(dateLocale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-gray-600">{t.noFutureAppointmentForRebooking}</p>
                )}

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t.repeatBooking}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {FOLLOW_UP_WEEK_OPTIONS.map((weeks) => (
                        <ActionButton
                          key={weeks}
                          busy={busy === 'create_follow_up'}
                          onClick={() => runAction('create_follow_up', { weeks })}
                        >
                          +{weeks}w
                        </ActionButton>
                      ))}
                    </div>
                  </div>

                  {!appointment.followUpAutomation.nextAppointment &&
                  !appointment.followUpAutomation.rebookingReminderScheduled ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t.rebookingReminder}
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {FOLLOW_UP_WEEK_OPTIONS.map((weeks) => (
                          <ActionButton
                            key={weeks}
                            busy={busy === 'schedule_rebooking_follow_up'}
                            onClick={() => runAction('schedule_rebooking_follow_up', { weeks })}
                          >
                            +{weeks}w
                          </ActionButton>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{t.reputation}</h3>
                    <p className="mt-1 text-xs text-gray-500">{t.reviewRequestHint}</p>
                  </div>
                  {appointment.status === 'COMPLETED' ? (
                    <ActionButton
                      busy={busy === 'send_review_request'}
                      onClick={() => runAction('send_review_request')}
                    >
                      {t.sendReviewRequest}
                    </ActionButton>
                  ) : (
                    <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      {t.completeVisitBeforeReview}
                    </p>
                  )}
                </div>
                {appointment.reviews.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {appointment.reviews.map((review) => (
                      <div key={review.id} className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                        <p className="font-semibold text-gray-900">
                          {review.status}
                          {review.rating ? ` · ${review.rating}/5` : ''}
                        </p>
                        {review.requestedAt && (
                          <p>
                            {new Date(review.requestedAt).toLocaleString(dateLocale, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.patientContext}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>{appointment.patient.phone || t.emptyValue}</p>
                  <p>{appointment.patient.email || t.emptyValue}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {appointment.patient.category && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                        {categoryLabel(t, appointment.patient.category)}
                      </span>
                    )}
                    {appointment.patient.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {tagLabel(t, tag)}
                      </span>
                    ))}
                  </div>
                  {appointment.patient.internalNotes && (
                    <p className="rounded-xl bg-amber-50 p-2 text-amber-900">
                      {appointment.patient.internalNotes}
                    </p>
                  )}
                </div>
                <Link
                  href={`/clinic/patients/${appointment.patient.id}`}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-orange-600"
                >
                  {t.viewPatientChart}
                </Link>
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.appointmentHistory}</h3>
                <div className="mt-3 divide-y divide-gray-100">
                  {appointment.events.length ? (
                    appointment.events.map((event) => (
                      <div key={event.id} className="py-2">
                        <p className="text-sm font-medium text-gray-900">{event.message || event.type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleString(dateLocale)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">{t.noAppointmentEvents}</p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function ActionButton({
  busy,
  onClick,
  children,
}: {
  busy: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
    >
      {children}
    </button>
  )
}
