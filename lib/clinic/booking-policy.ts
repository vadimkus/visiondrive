import {
  ClinicBookingPolicyType,
  ClinicPaymentRequirementStatus,
  Prisma,
} from '@prisma/client'

export type BookingPolicyProcedure = {
  id: string
  name: string
  basePriceCents: number
  currency: string
  bookingPolicyType: ClinicBookingPolicyType
  depositAmountCents: number
  depositPercent: number
  cancellationWindowHours: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  bookingPolicyText: string | null
}

export type BookingPolicySnapshot = {
  procedureId: string
  procedureName: string
  currency: string
  bookingPolicyType: ClinicBookingPolicyType
  depositRequiredCents: number
  depositAmountCents: number
  depositPercent: number
  cancellationWindowHours: number
  lateCancelFeeCents: number
  noShowFeeCents: number
  bookingPolicyText: string | null
}

export const BOOKING_POLICY_TYPES = Object.values(ClinicBookingPolicyType)

export function normalizeBookingPolicyType(value: unknown): ClinicBookingPolicyType {
  const raw = String(value ?? ClinicBookingPolicyType.NONE).trim().toUpperCase()
  return BOOKING_POLICY_TYPES.includes(raw as ClinicBookingPolicyType)
    ? (raw as ClinicBookingPolicyType)
    : ClinicBookingPolicyType.NONE
}

export function normalizeMoneyCents(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

export function normalizePercent(value: unknown) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function normalizeCancellationWindowHours(value: unknown) {
  const n = Number(value ?? 24)
  if (!Number.isFinite(n)) return 24
  return Math.min(720, Math.max(0, Math.round(n)))
}

export function depositRequiredCents(procedure: BookingPolicyProcedure) {
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.NONE) return 0
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.CARD_ON_FILE) return 0
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.FULL_PREPAY) {
    return Math.max(0, procedure.basePriceCents)
  }

  const fixed = Math.max(0, procedure.depositAmountCents)
  const percent = normalizePercent(procedure.depositPercent)
  const percentAmount = Math.round(Math.max(0, procedure.basePriceCents) * (percent / 100))
  return Math.max(fixed, percentAmount)
}

export function buildBookingPolicySnapshot(
  procedure: BookingPolicyProcedure
): BookingPolicySnapshot | null {
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.NONE) return null

  return {
    procedureId: procedure.id,
    procedureName: procedure.name,
    currency: procedure.currency,
    bookingPolicyType: procedure.bookingPolicyType,
    depositRequiredCents: depositRequiredCents(procedure),
    depositAmountCents: Math.max(0, procedure.depositAmountCents),
    depositPercent: normalizePercent(procedure.depositPercent),
    cancellationWindowHours: normalizeCancellationWindowHours(procedure.cancellationWindowHours),
    lateCancelFeeCents: Math.max(0, procedure.lateCancelFeeCents),
    noShowFeeCents: Math.max(0, procedure.noShowFeeCents),
    bookingPolicyText: procedure.bookingPolicyText?.trim() || null,
  }
}

export function paymentRequirementStatusForPolicy(
  snapshot: BookingPolicySnapshot | null
): ClinicPaymentRequirementStatus {
  if (!snapshot) return ClinicPaymentRequirementStatus.NOT_REQUIRED
  if (
    snapshot.bookingPolicyType === ClinicBookingPolicyType.DEPOSIT ||
    snapshot.bookingPolicyType === ClinicBookingPolicyType.FULL_PREPAY ||
    snapshot.bookingPolicyType === ClinicBookingPolicyType.CARD_ON_FILE
  ) {
    return ClinicPaymentRequirementStatus.PENDING
  }
  return ClinicPaymentRequirementStatus.NOT_REQUIRED
}

export function bookingPolicyAppointmentData(
  procedure: BookingPolicyProcedure | null,
  accepted: boolean,
  acceptedAt = new Date()
) {
  const snapshot = procedure ? buildBookingPolicySnapshot(procedure) : null

  return {
    bookingPolicyType: snapshot?.bookingPolicyType ?? ClinicBookingPolicyType.NONE,
    bookingPolicySnapshot: snapshot ? (snapshot as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
    bookingPolicyAcceptedAt: snapshot && accepted ? acceptedAt : null,
    paymentRequirementStatus: paymentRequirementStatusForPolicy(snapshot),
    depositRequiredCents: snapshot?.depositRequiredCents ?? 0,
    cancellationWindowHours: snapshot?.cancellationWindowHours ?? 24,
    lateCancelFeeCents: snapshot?.lateCancelFeeCents ?? 0,
    noShowFeeCents: snapshot?.noShowFeeCents ?? 0,
  }
}

export function bookingPolicyRequiresAcceptance(procedure: BookingPolicyProcedure | null) {
  return Boolean(procedure && procedure.bookingPolicyType !== ClinicBookingPolicyType.NONE)
}
