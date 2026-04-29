import { ClinicAppointmentStatus } from '@prisma/client'

export type PolicyFeeKind = 'LATE_CANCEL' | 'NO_SHOW'

export const POLICY_FEE_REFERENCE_PREFIXES = {
  LATE_CANCEL: 'LATE_CANCEL',
  NO_SHOW: 'NO_SHOW',
} as const

export function normalizePolicyFeeKind(value: unknown): PolicyFeeKind | null {
  const raw = String(value ?? '').trim().toUpperCase()
  return raw === 'LATE_CANCEL' || raw === 'NO_SHOW' ? raw : null
}

export function policyFeeReference(kind: PolicyFeeKind, appointmentId: string) {
  return `${POLICY_FEE_REFERENCE_PREFIXES[kind]}:${appointmentId}`
}

export function isPolicyFeePaymentReference(reference: string | null | undefined) {
  const value = String(reference || '')
  return (
    value.startsWith(`${POLICY_FEE_REFERENCE_PREFIXES.LATE_CANCEL}:`) ||
    value.startsWith(`${POLICY_FEE_REFERENCE_PREFIXES.NO_SHOW}:`)
  )
}

export function policyFeeAmountCents(
  appointment: { lateCancelFeeCents: number; noShowFeeCents: number },
  kind: PolicyFeeKind
) {
  return kind === 'LATE_CANCEL'
    ? Math.max(0, appointment.lateCancelFeeCents)
    : Math.max(0, appointment.noShowFeeCents)
}

export function policyFeeStatusPatch(kind: PolicyFeeKind, reason: string | null) {
  if (kind === 'NO_SHOW') {
    return { status: ClinicAppointmentStatus.NO_SHOW }
  }

  return {
    status: ClinicAppointmentStatus.CANCELLED,
    cancelReason: reason || 'Late cancellation',
  }
}
