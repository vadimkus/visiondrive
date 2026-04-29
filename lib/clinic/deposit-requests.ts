import { createHash, randomBytes } from 'crypto'
import {
  ClinicAppointmentStatus,
  ClinicPaymentMethod,
  ClinicPaymentRequirementStatus,
  ClinicPaymentStatus,
  type Prisma,
} from '@prisma/client'
import { whatsappUrl } from './reminders'

export const DEPOSIT_PAYMENT_REFERENCE_PREFIX = 'DEPOSIT'
export const DEPOSIT_REQUEST_EXPIRY_DAYS = 14

export type DepositRequestAppointment = {
  id: string
  startsAt: Date
  depositRequiredCents: number
  paymentRequirementStatus: ClinicPaymentRequirementStatus
  patient: { firstName: string; lastName: string; phone?: string | null }
  procedure: { name: string; currency: string } | null
  titleOverride: string | null
}

export type DepositPaymentForStatus = {
  status: ClinicPaymentStatus | string
  amountCents: number
  reference: string | null
}

export function depositPaymentReference(appointmentId: string) {
  return `${DEPOSIT_PAYMENT_REFERENCE_PREFIX}:${appointmentId}`
}

export function isDepositPaymentReference(reference: string | null | undefined) {
  return String(reference || '').startsWith(`${DEPOSIT_PAYMENT_REFERENCE_PREFIX}:`)
}

export function generatePaymentRequestToken() {
  return randomBytes(24).toString('base64url')
}

export function paymentRequestTokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function paymentRequestExpiresAt(now = new Date()) {
  return new Date(now.getTime() + DEPOSIT_REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
}

export function depositRequirementStatusFromPayments(
  appointment: { depositRequiredCents: number },
  payments: DepositPaymentForStatus[]
): ClinicPaymentRequirementStatus {
  if (appointment.depositRequiredCents <= 0) return ClinicPaymentRequirementStatus.NOT_REQUIRED

  const paidCents = payments
    .filter(
      (payment) =>
        isDepositPaymentReference(payment.reference) &&
        String(payment.status).toUpperCase() === ClinicPaymentStatus.PAID
    )
    .reduce((sum, payment) => sum + Math.max(0, payment.amountCents), 0)

  return paidCents >= appointment.depositRequiredCents
    ? ClinicPaymentRequirementStatus.PAID
    : ClinicPaymentRequirementStatus.PENDING
}

export function buildDepositRequestText({
  appointment,
  paymentRequestUrl,
  locale = 'en-GB',
}: {
  appointment: DepositRequestAppointment
  paymentRequestUrl: string
  locale?: string
}) {
  const currency = appointment.procedure?.currency || 'AED'
  const service = appointment.procedure?.name || appointment.titleOverride || 'appointment'
  const amount = `${(appointment.depositRequiredCents / 100).toFixed(2)} ${currency}`
  const date = appointment.startsAt.toLocaleDateString(locale, {
    dateStyle: 'medium',
    timeZone: 'Asia/Dubai',
  })
  const time = appointment.startsAt.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  })

  if (locale.startsWith('ru')) {
    return [
      `Здравствуйте, ${appointment.patient.firstName},`,
      `Чтобы закрепить запись на ${service} ${date} в ${time}, пожалуйста, оплатите депозит: ${amount}.`,
      `Ссылка на оплату: ${paymentRequestUrl}`,
      'После оплаты ответьте здесь, и запись будет подтверждена.',
    ].join('\n\n')
  }

  return [
    `Hi ${appointment.patient.firstName},`,
    `To secure your ${service} appointment on ${date} at ${time}, please pay the deposit: ${amount}.`,
    `Payment request: ${paymentRequestUrl}`,
    'Once paid, please reply here and the appointment will be confirmed.',
  ].join('\n\n')
}

export function buildDepositWhatsappUrl(appointment: DepositRequestAppointment, text: string) {
  return whatsappUrl(appointment.patient.phone, text)
}

export function shouldBlockConfirmation(params: {
  nextStatus: ClinicAppointmentStatus
  paymentRequirementStatus: ClinicPaymentRequirementStatus
  depositRequiredCents: number
}) {
  return (
    params.nextStatus === ClinicAppointmentStatus.CONFIRMED &&
    params.depositRequiredCents > 0 &&
    params.paymentRequirementStatus === ClinicPaymentRequirementStatus.PENDING
  )
}

export function depositPaidAppointmentPatch(now = new Date()) {
  return {
    paymentRequirementStatus: ClinicPaymentRequirementStatus.PAID,
    status: ClinicAppointmentStatus.CONFIRMED,
    confirmedAt: now,
  } satisfies Prisma.ClinicAppointmentUpdateInput
}

export function normalizeDepositPaymentMethod(value: unknown) {
  const method = String(value ?? ClinicPaymentMethod.TRANSFER).trim().toUpperCase()
  const allowed = Object.values(ClinicPaymentMethod)
  return allowed.includes(method as ClinicPaymentMethod)
    ? (method as ClinicPaymentMethod)
    : ClinicPaymentMethod.TRANSFER
}
