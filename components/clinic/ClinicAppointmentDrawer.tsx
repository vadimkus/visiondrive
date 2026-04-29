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
  discountCents: number
  discountRuleId: string | null
  discountName: string | null
  discountReason: string | null
  feeCents: number
  processorFeeCents: number
  currency: string
  method: string
  status: string
  reference: string | null
  note: string | null
  paidAt: string
  visitId: string | null
  appointmentId: string | null
  paymentRequestExpiresAt?: string | null
  paymentRequestSentAt?: string | null
  correctionsAsOriginal?: PaymentCorrection[]
}

type PaymentCorrection = {
  id: string
  type: 'REFUND' | 'VOID'
  amountCents: number
  currency: string
  method: string
  reason: string
  note: string | null
  correctedAt: string
  adjustmentPaymentId: string | null
}

type ProductSale = {
  id: string
  soldAt: string
  subtotalCents: number
  discountCents: number
  totalCents: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  note: string | null
  payment: { id: string; status: string; amountCents: number; processorFeeCents: number; method: string; paidAt: string } | null
  lines: Array<{
    id: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
    stockItem: { id: string; name: string; sku: string | null; unit: string }
  }>
}

type ProductStockItem = {
  id: string
  name: string
  sku: string | null
  unit: string
  quantityOnHand: number
  active: boolean
}

type DiscountRule = {
  id: string
  name: string
  type: 'PERCENT' | 'FIXED'
  percentBps: number
  fixedCents: number
  active: boolean
}

type ClientBalance = {
  currency: string
  expectedCents: number
  paidCents: number
  refundedCents: number
  pendingCents: number
  dueCents: number
  creditCents: number
  status: 'CLEAR' | 'DEBT' | 'CREDIT'
}

type Visit = {
  id: string
  visitAt: string
  status: string
  chiefComplaint: string | null
  procedureSummary: string | null
  nextSteps: string | null
  aftercareTemplateId: string | null
  aftercareTitleSnapshot: string | null
  aftercareTextSnapshot: string | null
  aftercareDocumentNameSnapshot: string | null
  aftercareDocumentUrlSnapshot: string | null
  aftercareSentAt: string | null
  productSales: ProductSale[]
  payments: Payment[]
}

type AftercareTemplate = {
  id: string
  title: string
  messageBody: string
  documentName: string | null
  documentUrl: string | null
  active: boolean
  procedure: { id: string; name: string } | null
}

type Appointment = {
  id: string
  startsAt: string
  endsAt: string | null
  status: AppointmentStatus
  titleOverride: string | null
  internalNotes: string | null
  bufferAfterMinutes: number
  travelBufferBeforeMinutes: number
  travelBufferAfterMinutes: number
  locationAddress: string | null
  locationArea: string | null
  locationNotes: string | null
  overrideReason: string | null
  cancelReason: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    middleName: string | null
    phone: string | null
    email: string | null
    homeAddress: string | null
    area: string | null
    accessNotes: string | null
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
  paymentRequirementStatus: 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'WAIVED'
  depositRequiredCents: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  visits: Visit[]
  payments: Payment[]
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
  clientBalance: ClientBalance
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

function refundedCents(payment: Payment) {
  return (payment.correctionsAsOriginal ?? [])
    .filter((correction) => correction.type === 'REFUND')
    .reduce((sum, correction) => sum + correction.amountCents, 0)
}

function refundableCents(payment: Payment) {
  return payment.status === 'PAID' ? Math.max(0, payment.amountCents - refundedCents(payment)) : 0
}

function parseMajorToCents(value: string) {
  const major = Number.parseFloat(value || '0')
  return Number.isFinite(major) ? Math.round(major * 100) : NaN
}

function calculateDiscountFromRule(baseCents: number, rule: DiscountRule | undefined) {
  if (!rule?.active) return 0
  const base = Math.max(0, baseCents)
  if (rule.type === 'FIXED') return Math.min(base, rule.fixedCents)
  return Math.min(base, Math.round((base * rule.percentBps) / 10_000))
}

function drawerWhatsappUrl(phone: string | null | undefined, body: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(body)}` : null
}

function aftercareVisitText(visit: Visit) {
  return [
    visit.aftercareTitleSnapshot,
    visit.aftercareTextSnapshot,
    visit.aftercareDocumentUrlSnapshot
      ? `${visit.aftercareDocumentNameSnapshot || 'Aftercare document'}: ${visit.aftercareDocumentUrlSnapshot}`
      : '',
  ].filter((part): part is string => Boolean(part?.trim())).join('\n\n')
}

function balanceLabel(t: ClinicStrings, balance: ClientBalance) {
  if (balance.status === 'DEBT') return `${t.balanceDebt}: ${money(balance.dueCents, balance.currency)}`
  if (balance.status === 'CREDIT') return `${t.balanceCredit}: ${money(balance.creditCents, balance.currency)}`
  return t.balanceClear
}

function balanceClasses(balance: ClientBalance) {
  if (balance.status === 'DEBT') return 'border-red-200 bg-red-50 text-red-900'
  if (balance.status === 'CREDIT') return 'border-emerald-200 bg-emerald-50 text-emerald-900'
  return 'border-gray-200 bg-gray-50 text-gray-900'
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

function paymentRequirementLabel(t: ClinicStrings, status: Appointment['paymentRequirementStatus']) {
  if (status === 'PAID') return t.paymentRequirementPaid
  if (status === 'WAIVED') return t.paymentRequirementWaived
  if (status === 'PENDING') return t.paymentRequirementPending
  return t.paymentRequirementNotRequired
}

function paymentRequirementClasses(status: Appointment['paymentRequirementStatus']) {
  if (status === 'PAID') return 'border-emerald-100 bg-emerald-50 text-emerald-800'
  if (status === 'WAIVED') return 'border-gray-200 bg-gray-50 text-gray-700'
  if (status === 'PENDING') return 'border-orange-100 bg-orange-50 text-orange-800'
  return 'border-gray-200 bg-white text-gray-600'
}

function isPolicyFeeReference(reference: string | null | undefined) {
  const value = String(reference || '')
  return value.startsWith('LATE_CANCEL:') || value.startsWith('NO_SHOW:')
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
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDiscount, setPaymentDiscount] = useState('')
  const [paymentDiscountRuleId, setPaymentDiscountRuleId] = useState('')
  const [paymentDiscountReason, setPaymentDiscountReason] = useState('')
  const [paymentFee, setPaymentFee] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [paymentStatus, setPaymentStatus] = useState('PAID')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [productItems, setProductItems] = useState<ProductStockItem[]>([])
  const [saleProductId, setSaleProductId] = useState('')
  const [saleQuantity, setSaleQuantity] = useState('1')
  const [saleUnitPrice, setSaleUnitPrice] = useState('')
  const [saleDiscount, setSaleDiscount] = useState('')
  const [saleMethod, setSaleMethod] = useState('CARD')
  const [saleStatus, setSaleStatus] = useState('PAID')
  const [saleNote, setSaleNote] = useState('')
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [aftercareTemplates, setAftercareTemplates] = useState<AftercareTemplate[]>([])
  const [aftercareTemplateId, setAftercareTemplateId] = useState('')

  const load = useCallback(async () => {
    if (!appointmentId) return
    setLoading(true)
    setError('')
    try {
      const [res, inventoryRes, discountRes, aftercareRes] = await Promise.all([
        fetch(`/api/clinic/appointments/${appointmentId}`, { credentials: 'include' }),
        fetch('/api/clinic/inventory', { credentials: 'include' }),
        fetch('/api/clinic/discount-rules', { credentials: 'include' }),
        fetch('/api/clinic/aftercare-templates', { credentials: 'include' }),
      ])
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t.failedToLoad)
      }
      setAppointment(data.appointment)
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        setProductItems((inventoryData.items || []).filter((item: ProductStockItem) => item.active))
      }
      if (discountRes.ok) {
        const discountData = await discountRes.json()
        setDiscountRules((discountData.rules || []).filter((rule: DiscountRule) => rule.active))
      }
      if (aftercareRes.ok) {
        const aftercareData = await aftercareRes.json()
        setAftercareTemplates((aftercareData.templates || []).filter((template: AftercareTemplate) => template.active))
      }
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
      setAftercareTemplateId('')
      return
    }
    setNotice('')
    setAftercareTemplateId('')
    void load()
  }, [appointmentId, load])

  const payment = useMemo(() => {
    const seen = new Set<string>()
    const payments = [
      ...(appointment?.visits.flatMap((visit) => visit.payments) ?? []),
      ...(appointment?.payments ?? []),
    ].filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    const paid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amountCents, 0)
    const refunded = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amountCents, 0)
    const discount = payments.reduce((sum, p) => sum + (p.discountCents || 0), 0)
    const fee = payments.reduce((sum, p) => sum + (p.feeCents || 0), 0)
    const expected = Math.max((appointment?.procedure?.basePriceCents ?? 0) - discount + fee, 0)
    return {
      paid: paid - refunded,
      due: Math.max(0, expected - (paid - refunded)),
      currency: appointment?.procedure?.currency || payments[0]?.currency || 'AED',
      payments,
    }
  }, [appointment])

  const productSales = useMemo(
    () => appointment?.visits.flatMap((visit) => visit.productSales) ?? [],
    [appointment]
  )

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!appointment) return
    const amountCents = parseMajorToCents(paymentAmount)
    const discountCents = parseMajorToCents(paymentDiscount)
    const feeCents = parseMajorToCents(paymentFee)
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      setError(t.enterValidAmount)
      return
    }
    if (!Number.isInteger(discountCents) || discountCents < 0 || !Number.isInteger(feeCents) || feeCents < 0) {
      setError(t.enterValidAmount)
      return
    }
    if (discountCents > 0 && !paymentDiscountReason.trim()) {
      setError(t.discountReasonRequired)
      return
    }

    setBusy('record_payment')
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/patients/${appointment.patient.id}/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          visitId: appointment.visits[0]?.id ?? null,
          amountCents,
          discountCents,
          discountRuleId: paymentDiscountRuleId || null,
          discountReason: paymentDiscountReason.trim() || null,
          feeCents,
          currency: appointment.procedure?.currency ?? 'AED',
          method: paymentMethod,
          status: paymentStatus,
          reference: paymentReference.trim() || null,
          note: paymentNote.trim() || null,
          paidAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      setPaymentAmount('')
      setPaymentDiscount('')
      setPaymentDiscountRuleId('')
      setPaymentDiscountReason('')
      setPaymentFee('')
      setPaymentReference('')
      setPaymentNote('')
      setNotice(t.paymentRecorded)
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setBusy(null)
    }
  }

  async function updatePaymentStatus(paymentItem: Payment, status: 'REFUNDED' | 'VOID') {
    if (!appointment) return
    const remainingRefundable = refundableCents(paymentItem)
    const reason = window.prompt(
      status === 'REFUNDED' ? t.paymentRefundReasonPrompt : t.paymentVoidReasonPrompt
    )
    if (!reason?.trim()) {
      setError(t.paymentCorrectionReasonRequired)
      return
    }
    const amountInput =
      status === 'REFUNDED'
        ? window.prompt(t.paymentRefundAmountPrompt, (remainingRefundable / 100).toFixed(2))
        : null
    const amountCents =
      status === 'REFUNDED'
        ? Math.round(Number.parseFloat(amountInput || '') * 100)
        : paymentItem.amountCents
    if (status === 'REFUNDED' && (!Number.isInteger(amountCents) || amountCents <= 0)) {
      setError(t.enterValidAmount)
      return
    }
    setBusy(`${status}_${paymentItem.id}`)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/patients/${appointment.patient.id}/payments/${paymentItem.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason,
          amountCents: status === 'REFUNDED' ? amountCents : undefined,
          method: paymentItem.method,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      setNotice(status === 'REFUNDED' ? t.paymentRefunded : t.paymentVoided)
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setBusy(null)
    }
  }

  async function recordProductSale(e: React.FormEvent) {
    e.preventDefault()
    if (!appointment) return
    const visitId = appointment.visits[0]?.id
    if (!visitId) {
      setError(t.completeVisitBeforeProductSale)
      return
    }
    const quantity = Number.parseInt(saleQuantity, 10)
    const unitPriceCents = parseMajorToCents(saleUnitPrice)
    const discountCents = parseMajorToCents(saleDiscount)
    if (!saleProductId || !Number.isInteger(quantity) || quantity <= 0) {
      setError(t.productSaleItemRequired)
      return
    }
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0 || !Number.isInteger(discountCents) || discountCents < 0) {
      setError(t.enterValidAmount)
      return
    }

    setBusy('record_product_sale')
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/clinic/patients/${appointment.patient.id}/product-sales`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId,
          appointmentId: appointment.id,
          lines: [{ stockItemId: saleProductId, quantity, unitPriceCents }],
          discountCents,
          currency: appointment.procedure?.currency ?? 'AED',
          paymentMethod: saleMethod,
          paymentStatus: saleStatus,
          note: saleNote.trim() || null,
          soldAt: new Date().toISOString(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.saveFailed)
      setSaleProductId('')
      setSaleQuantity('1')
      setSaleUnitPrice('')
      setSaleDiscount('')
      setSaleNote('')
      setNotice(t.productSaleRecorded)
      await load()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveFailed)
    } finally {
      setBusy(null)
    }
  }

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
        action === 'prepare_deposit_request' ||
        action === 'no_show_follow_up' ||
        action === 'send_review_request' ||
        (action === 'complete_visit' && data.aftercare)
      ) {
        const messageText = data.reminderText || data.aftercare?.text
        if (messageText && typeof navigator !== 'undefined') {
          await navigator.clipboard?.writeText(messageText).catch(() => undefined)
        }
        const url = data.whatsappUrl || data.aftercare?.whatsappUrl
        if (url && typeof window !== 'undefined') {
          window.open(url, '_blank', 'noopener,noreferrer')
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
      if (action === 'prepare_deposit_request') {
        setNotice(t.depositRequestPrepared)
      }
      if (action === 'mark_deposit_paid') {
        setNotice(data.alreadyPaid ? t.depositAlreadyPaid : t.depositMarkedPaid)
      }
      if (action === 'enforce_policy_fee') {
        setNotice(data.alreadyCreated ? t.policyFeeAlreadyCreated : t.policyFeeEnforced)
      }
      if (action === 'waive_policy_fee') {
        setNotice(t.policyFeeWaived)
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
      ? new Date(
          end.getTime() +
            (appointment.bufferAfterMinutes + appointment.travelBufferAfterMinutes) * 60 * 1000
        )
      : null
  const eligibleAftercareTemplates = aftercareTemplates.filter(
    (template) => !template.procedure || template.procedure.id === appointment?.procedure?.id
  )
  const selectedAftercareTemplate = eligibleAftercareTemplates.find((template) => template.id === aftercareTemplateId)
  const latestVisit = appointment?.visits[0] ?? null
  const latestAftercareText = latestVisit ? aftercareVisitText(latestVisit) : ''
  const latestAftercareUrl =
    latestVisit && latestAftercareText ? drawerWhatsappUrl(appointment?.patient.phone, latestAftercareText) : null
  const depositPayment = payment.payments.find((item) => item.reference?.startsWith('DEPOSIT:')) ?? null
  const policyFeePayments = payment.payments.filter((item) => isPolicyFeeReference(item.reference))
  const depositRequired = appointment ? appointment.depositRequiredCents > 0 : false
  const hasPolicyFees =
    Boolean(appointment) &&
    (appointment!.lateCancelFeeCents > 0 || appointment!.noShowFeeCents > 0)
  const confirmBlockedByDeposit =
    Boolean(appointment) &&
    appointment!.depositRequiredCents > 0 &&
    appointment!.paymentRequirementStatus === 'PENDING'
  const markDepositPaid = () => {
    const reference = window.prompt(t.depositPaymentReferencePrompt)
    if (reference === null) return
    void runAction('mark_deposit_paid', { reference: reference.trim() || null, method: 'TRANSFER' })
  }
  const policyFeeAction = (kind: 'LATE_CANCEL' | 'NO_SHOW', actionName: 'enforce_policy_fee' | 'waive_policy_fee') => {
    const reason = window.prompt(
      actionName === 'waive_policy_fee' ? t.policyFeeWaiveReasonPrompt : t.policyFeeReasonPrompt
    )
    if (reason === null) return
    void runAction(actionName, { kind, reason: reason.trim() || null })
  }

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
                  <div>
                    <p className="text-gray-500">{t.travelBefore}</p>
                    <p className="font-medium text-gray-900">
                      {appointment.travelBufferBeforeMinutes} {t.minutesAbbr}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t.travelAfter}</p>
                    <p className="font-medium text-gray-900">
                      {appointment.travelBufferAfterMinutes} {t.minutesAbbr}
                    </p>
                  </div>
                  {appointment.locationAddress && (
                    <div className="col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-800">{t.visitLocation}</p>
                      <p className="font-medium text-emerald-950">{appointment.locationAddress}</p>
                      {appointment.locationArea && (
                        <p className="text-sm text-emerald-800">{appointment.locationArea}</p>
                      )}
                      {appointment.locationNotes && (
                        <p className="mt-1 text-sm text-emerald-800">{appointment.locationNotes}</p>
                      )}
                    </div>
                  )}
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

              {depositRequired && (
                <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                        {t.depositProtection}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-orange-950">
                        {money(appointment.depositRequiredCents, appointment.procedure?.currency || 'AED')}
                      </h3>
                      <p className="mt-1 text-sm text-orange-900">{t.depositProtectionHint}</p>
                    </div>
                    <span
                      className={clsx(
                        'inline-flex self-start rounded-full border px-2.5 py-1 text-xs font-semibold',
                        paymentRequirementClasses(appointment.paymentRequirementStatus)
                      )}
                    >
                      {paymentRequirementLabel(t, appointment.paymentRequirementStatus)}
                    </span>
                  </div>
                  {depositPayment && (
                    <div className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-orange-950">
                      <p className="font-semibold">
                        {money(depositPayment.amountCents, depositPayment.currency)} · {depositPayment.status}
                      </p>
                      <p>
                        {t.paymentRequestSent}:{' '}
                        {depositPayment.paymentRequestSentAt
                          ? new Date(depositPayment.paymentRequestSentAt).toLocaleString(dateLocale)
                          : t.emptyValue}
                      </p>
                      {depositPayment.paymentRequestExpiresAt && depositPayment.status === 'PENDING' && (
                        <p>
                          {t.paymentRequestExpires}:{' '}
                          {new Date(depositPayment.paymentRequestExpiresAt).toLocaleDateString(dateLocale)}
                        </p>
                      )}
                    </div>
                  )}
                  {confirmBlockedByDeposit && (
                    <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs font-medium text-orange-950">
                      {t.depositBlocksConfirmation}
                    </p>
                  )}
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <ActionButton
                      busy={busy === 'prepare_deposit_request'}
                      onClick={() => runAction('prepare_deposit_request', { locale: dateLocale })}
                    >
                      {t.generateDepositRequest}
                    </ActionButton>
                    <ActionButton
                      busy={busy === 'mark_deposit_paid'}
                      disabled={appointment.paymentRequirementStatus === 'PAID'}
                      onClick={markDepositPaid}
                    >
                      {t.markDepositPaid}
                    </ActionButton>
                  </div>
                </section>
              )}

              {hasPolicyFees && (
                <section className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                        {t.policyFeeProtection}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-red-950">
                        {t.lateCancelNoShowFees}
                      </h3>
                      <p className="mt-1 text-sm text-red-900">{t.policyFeeProtectionHint}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {appointment.lateCancelFeeCents > 0 && (
                      <div className="rounded-2xl bg-white/80 p-3">
                        <p className="text-xs font-semibold text-red-800">{t.lateCancelProtection}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-950">
                          {money(appointment.lateCancelFeeCents, appointment.procedure?.currency || 'AED')}
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                          <ActionButton
                            busy={busy === 'enforce_policy_fee'}
                            onClick={() => policyFeeAction('LATE_CANCEL', 'enforce_policy_fee')}
                          >
                            {t.enforceLateCancelFee}
                          </ActionButton>
                          <ActionButton
                            busy={busy === 'waive_policy_fee'}
                            onClick={() => policyFeeAction('LATE_CANCEL', 'waive_policy_fee')}
                          >
                            {t.waiveFee}
                          </ActionButton>
                        </div>
                      </div>
                    )}
                    {appointment.noShowFeeCents > 0 && (
                      <div className="rounded-2xl bg-white/80 p-3">
                        <p className="text-xs font-semibold text-red-800">{t.noShowProtection}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-950">
                          {money(appointment.noShowFeeCents, appointment.procedure?.currency || 'AED')}
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                          <ActionButton
                            busy={busy === 'enforce_policy_fee'}
                            onClick={() => policyFeeAction('NO_SHOW', 'enforce_policy_fee')}
                          >
                            {t.enforceNoShowFee}
                          </ActionButton>
                          <ActionButton
                            busy={busy === 'waive_policy_fee'}
                            onClick={() => policyFeeAction('NO_SHOW', 'waive_policy_fee')}
                          >
                            {t.waiveFee}
                          </ActionButton>
                        </div>
                      </div>
                    )}
                  </div>
                  {policyFeePayments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {policyFeePayments.map((item) => (
                        <div key={item.id} className="rounded-xl bg-white/80 p-3 text-xs text-red-950">
                          <p className="font-semibold">
                            {item.reference?.startsWith('NO_SHOW:') ? t.noShowProtection : t.lateCancelProtection}:{' '}
                            {money(item.amountCents, item.currency)} · {item.status}
                          </p>
                          {item.note && <p className="mt-1 text-red-800">{item.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.quickStatus}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ActionButton
                    busy={busy === 'CONFIRMED'}
                    disabled={confirmBlockedByDeposit}
                    onClick={() => patchStatus('CONFIRMED')}
                  >
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
                  <ActionButton
                    busy={busy === 'complete_visit'}
                    onClick={() =>
                      runAction('complete_visit', {
                        aftercareTemplateId: aftercareTemplateId || null,
                      })
                    }
                  >
                    {t.completeVisit}
                  </ActionButton>
                </div>
                {eligibleAftercareTemplates.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <label className="block text-xs font-semibold text-emerald-900">{t.aftercareTemplate}</label>
                    <select
                      value={aftercareTemplateId}
                      onChange={(e) => setAftercareTemplateId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">{t.noAftercareTemplateSelected}</option>
                      {eligibleAftercareTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                    {selectedAftercareTemplate && (
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs text-emerald-900">
                        {selectedAftercareTemplate.messageBody || selectedAftercareTemplate.documentUrl}
                      </p>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  {latestVisit
                    ? `${latestVisit.status} · ${new Date(latestVisit.visitAt).toLocaleString(dateLocale)}`
                    : t.noHistory}
                </p>
                {latestVisit?.aftercareTitleSnapshot && (
                  <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-950">
                    <p className="font-semibold">{latestVisit.aftercareTitleSnapshot}</p>
                    {latestVisit.aftercareTextSnapshot && (
                      <p className="mt-1 whitespace-pre-wrap text-xs">{latestVisit.aftercareTextSnapshot}</p>
                    )}
                    {latestVisit.aftercareDocumentUrlSnapshot && (
                      <a
                        href={latestVisit.aftercareDocumentUrlSnapshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex min-h-9 items-center rounded-xl bg-white px-3 text-xs font-semibold text-emerald-700"
                      >
                        {latestVisit.aftercareDocumentNameSnapshot || t.aftercareDocumentReference}
                      </a>
                    )}
                    {latestAftercareUrl && (
                      <a
                        href={latestAftercareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 ml-2 inline-flex min-h-9 items-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"
                      >
                        {t.openWhatsApp}
                      </a>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900">{t.productSales}</h3>
                <p className="mt-1 text-xs text-gray-500">{t.productSalesHint}</p>
                {!appointment.visits[0] ? (
                  <p className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    {t.completeVisitBeforeProductSale}
                  </p>
                ) : (
                  <form onSubmit={recordProductSale} className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="col-span-2 text-xs text-gray-600">
                        {t.productSaleItem}
                        <select
                          value={saleProductId}
                          onChange={(e) => setSaleProductId(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                        >
                          <option value="">{t.selectPlaceholder}</option>
                          {productItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} · {item.quantityOnHand} {item.unit}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.productSaleQuantity}
                        <input
                          value={saleQuantity}
                          onChange={(e) => setSaleQuantity(e.target.value)}
                          inputMode="numeric"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                        />
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.unitPrice}
                        <input
                          value={saleUnitPrice}
                          onChange={(e) => setSaleUnitPrice(e.target.value)}
                          inputMode="decimal"
                          placeholder="0"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                        />
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.paymentDiscount}
                        <input
                          value={saleDiscount}
                          onChange={(e) => setSaleDiscount(e.target.value)}
                          inputMode="decimal"
                          placeholder="0"
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                        />
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.paymentMethod}
                        <select
                          value={saleMethod}
                          onChange={(e) => setSaleMethod(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                        >
                          <option value="CARD">{t.payMethodCard}</option>
                          <option value="CASH">{t.payMethodCash}</option>
                          <option value="TRANSFER">{t.payMethodTransfer}</option>
                          <option value="POS">{t.payMethodPos}</option>
                          <option value="STRIPE">{t.payMethodStripe}</option>
                          <option value="OTHER">{t.payMethodOther}</option>
                        </select>
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.paymentStatusLabel}
                        <select
                          value={saleStatus}
                          onChange={(e) => setSaleStatus(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                        >
                          <option value="PAID">{t.payStatusPaid}</option>
                          <option value="PENDING">{t.payStatusPending}</option>
                        </select>
                      </label>
                      <label className="text-xs text-gray-600">
                        {t.note}
                        <input
                          value={saleNote}
                          onChange={(e) => setSaleNote(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={busy === 'record_product_sale'}
                      className="min-h-11 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {busy === 'record_product_sale' ? t.savingEllipsis : t.recordProductSale}
                    </button>
                  </form>
                )}
                {productSales.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t.productSaleHistory}
                    </p>
                    {productSales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-600">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {money(sale.totalCents, sale.currency)} · {sale.paymentStatus}
                            </p>
                            <p>
                              {sale.lines.map((line) => `${line.stockItem.name} × ${line.quantity}`).join(', ')}
                            </p>
                          </div>
                          <p className="shrink-0 text-gray-400">
                            {new Date(sale.soldAt).toLocaleDateString(dateLocale)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div className={clsx('mt-4 rounded-xl border p-3 text-sm', balanceClasses(appointment.clientBalance))}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold">{t.clientBalance}</p>
                    <p className="font-semibold">{balanceLabel(t, appointment.clientBalance)}</p>
                  </div>
                  <p className="mt-1 text-xs opacity-75">
                    {t.balancePending}: {money(appointment.clientBalance.pendingCents, appointment.clientBalance.currency)} ·{' '}
                    {t.balanceRefunded}: {money(appointment.clientBalance.refundedCents, appointment.clientBalance.currency)}
                  </p>
                </div>
                <form onSubmit={recordPayment} className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t.recordInlinePayment}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-gray-600">
                      {t.amountAed}
                      <input
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder={(payment.due / 100).toFixed(2)}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.paymentMethod}
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                      >
                        <option value="CARD">{t.payMethodCard}</option>
                        <option value="CASH">{t.payMethodCash}</option>
                        <option value="TRANSFER">{t.payMethodTransfer}</option>
                        <option value="POS">{t.payMethodPos}</option>
                        <option value="STRIPE">{t.payMethodStripe}</option>
                        <option value="OTHER">{t.payMethodOther}</option>
                      </select>
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.discountRuleOptional}
                      <select
                        value={paymentDiscountRuleId}
                        onChange={(e) => {
                          const ruleId = e.target.value
                          setPaymentDiscountRuleId(ruleId)
                          const rule = discountRules.find((item) => item.id === ruleId)
                          const calculated = calculateDiscountFromRule(
                            appointment.procedure?.basePriceCents ?? payment.due,
                            rule
                          )
                          if (calculated > 0) setPaymentDiscount((calculated / 100).toFixed(2))
                        }}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                      >
                        <option value="">{t.noDiscountRule}</option>
                        {discountRules.map((rule) => (
                          <option key={rule.id} value={rule.id}>
                            {rule.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.paymentDiscount}
                      <input
                        value={paymentDiscount}
                        onChange={(e) => setPaymentDiscount(e.target.value)}
                        inputMode="decimal"
                        placeholder="0"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.discountReason}
                      <input
                        value={paymentDiscountReason}
                        onChange={(e) => setPaymentDiscountReason(e.target.value)}
                        placeholder={t.discountReasonPlaceholder}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.paymentFee}
                      <input
                        value={paymentFee}
                        onChange={(e) => setPaymentFee(e.target.value)}
                        inputMode="decimal"
                        placeholder="0"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.paymentStatusLabel}
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-base"
                      >
                        <option value="PAID">{t.payStatusPaid}</option>
                        <option value="PENDING">{t.payStatusPending}</option>
                      </select>
                    </label>
                    <label className="text-xs text-gray-600">
                      {t.paymentReference}
                      <input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                      />
                    </label>
                  </div>
                  <label className="block text-xs text-gray-600">
                    {t.note}
                    <input
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-base"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy === 'record_payment'}
                    className="min-h-11 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busy === 'record_payment' ? t.savingEllipsis : t.savePayment}
                  </button>
                </form>
                {payment.payments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {t.paymentHistory}
                    </p>
                    {payment.payments.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-3 text-xs text-gray-600">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {money(item.amountCents, item.currency)} · {item.status}
                            </p>
                            <p>
                              {item.method} · {new Date(item.paidAt).toLocaleDateString(dateLocale)}
                            </p>
                            {(item.discountCents > 0 || item.feeCents > 0) && (
                              <p>
                                {t.paymentDiscount}: {money(item.discountCents, item.currency)} · {t.paymentFee}:{' '}
                                {money(item.feeCents, item.currency)}
                              </p>
                            )}
                            {item.discountCents > 0 && (
                              <p>
                                {item.discountName ?? t.manualDiscount}
                                {item.discountReason ? ` · ${item.discountReason}` : ''}
                              </p>
                            )}
                            {item.processorFeeCents > 0 && (
                              <p>
                                {t.paymentProcessorFee}: {money(item.processorFeeCents, item.currency)}
                              </p>
                            )}
                            {(item.correctionsAsOriginal?.length ?? 0) > 0 && (
                              <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2">
                                <p className="font-semibold text-gray-700">{t.paymentCorrectionHistory}</p>
                                {item.correctionsAsOriginal?.map((correction) => (
                                  <p key={correction.id}>
                                    {correction.type === 'REFUND' ? t.refundPayment : t.voidPayment}:{' '}
                                    {money(correction.amountCents, correction.currency)} · {correction.method} ·{' '}
                                    {correction.reason}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <a
                            href={`/api/clinic/patients/${appointment.patient.id}/payments/${item.id}/receipt`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-orange-600"
                          >
                            {t.receipt}
                          </a>
                        </div>
                        {item.status === 'PAID' && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => updatePaymentStatus(item, 'REFUNDED')}
                              disabled={busy === `REFUNDED_${item.id}` || refundableCents(item) <= 0}
                              className="rounded-lg border border-gray-200 px-2 py-1 font-semibold text-gray-700 disabled:opacity-60"
                            >
                              {t.refundPayment}
                              {refundableCents(item) > 0 ? ` (${money(refundableCents(item), item.currency)})` : ''}
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePaymentStatus(item, 'VOID')}
                              disabled={busy === `VOID_${item.id}` || refundedCents(item) > 0}
                              className="rounded-lg border border-gray-200 px-2 py-1 font-semibold text-gray-700 disabled:opacity-60"
                            >
                              {t.voidPayment}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                  <p>{appointment.patient.homeAddress || t.emptyValue}</p>
                  {appointment.patient.area && <p>{appointment.patient.area}</p>}
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
  disabled,
  onClick,
  children,
}: {
  busy: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      disabled={busy || disabled}
      onClick={onClick}
      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
    >
      {children}
    </button>
  )
}
