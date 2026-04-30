import { ClinicBookingPolicyType } from '@prisma/client'

export type PublicProfilePolicyProcedure = {
  bookingPolicyType: ClinicBookingPolicyType
  depositAmountCents: number
  depositPercent: number
  currency: string
}

export function publicMediaUrl(id: string) {
  return `/api/public/clinic/media/${encodeURIComponent(id)}`
}

export function publicReviewName(patient: { firstName?: string | null; lastName?: string | null }) {
  const first = patient.firstName?.trim() || 'Client'
  const lastInitial = patient.lastName?.trim().charAt(0)
  return lastInitial ? `${first} ${lastInitial}.` : first
}

export function publicServicePrice(cents: number, currency: string) {
  if (!cents) return null
  return `${(cents / 100).toFixed(0)} ${currency}`
}

export function publicServicePolicyLabel(procedure: PublicProfilePolicyProcedure) {
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.FULL_PREPAY) return 'Full prepay required'
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.CARD_ON_FILE) return 'Card-on-file hold'
  if (procedure.bookingPolicyType === ClinicBookingPolicyType.DEPOSIT) {
    if (procedure.depositAmountCents > 0) {
      return `Deposit ${publicServicePrice(procedure.depositAmountCents, procedure.currency)}`
    }
    if (procedure.depositPercent > 0) return `Deposit ${procedure.depositPercent}%`
    return 'Deposit required'
  }
  return 'Policy shown before booking'
}
