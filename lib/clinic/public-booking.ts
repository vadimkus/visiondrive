export type PublicBookingInput = {
  firstName: string
  lastName: string
  dateOfBirth: Date
  phone: string
  email: string | null
  notes: string | null
  consentAccepted: boolean
}

export function normalizePublicBookingInput(body: Record<string, unknown>): PublicBookingInput {
  const firstName = String(body.firstName ?? '').trim().slice(0, 120)
  const lastName = String(body.lastName ?? '').trim().slice(0, 120)
  const phone = String(body.phone ?? '').trim().slice(0, 80)
  const emailRaw = String(body.email ?? '').trim().toLowerCase()
  const dateOfBirth = body.dateOfBirth != null ? new Date(String(body.dateOfBirth)) : new Date('')
  const notes = body.notes != null ? String(body.notes).trim().slice(0, 2000) || null : null
  const consentAccepted = body.consentAccepted === true

  return {
    firstName,
    lastName,
    dateOfBirth,
    phone,
    email: emailRaw || null,
    notes,
    consentAccepted,
  }
}

export function validatePublicBookingInput(input: PublicBookingInput) {
  if (!input.firstName || !input.lastName) return 'firstName and lastName are required'
  if (Number.isNaN(input.dateOfBirth.getTime())) return 'dateOfBirth is required'
  if (!input.phone && !input.email) return 'phone or email is required'
  if (!input.consentAccepted) return 'Consent is required'
  return null
}

export function publicBookingNote(input: PublicBookingInput) {
  const rows = ['Public booking request']
  if (input.notes) rows.push(`Client note: ${input.notes}`)
  rows.push(`Consent accepted: ${input.consentAccepted ? 'yes' : 'no'}`)
  return rows.join('\n')
}
