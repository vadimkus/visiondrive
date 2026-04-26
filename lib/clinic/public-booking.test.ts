import { describe, expect, it } from 'vitest'
import {
  normalizePublicBookingInput,
  publicBookingNote,
  validatePublicBookingInput,
} from './public-booking'

describe('public booking input', () => {
  it('normalizes and validates client details', () => {
    const input = normalizePublicBookingInput({
      firstName: '  Anna ',
      lastName: '  Petrova ',
      dateOfBirth: '1990-02-03',
      phone: '+971 50 000 0000',
      email: ' ANNA@EXAMPLE.COM ',
      notes: 'Sensitive skin',
      consentAccepted: true,
    })

    expect(input.firstName).toBe('Anna')
    expect(input.email).toBe('anna@example.com')
    expect(validatePublicBookingInput(input)).toBeNull()
    expect(publicBookingNote(input)).toContain('Sensitive skin')
  })

  it('requires consent and either phone or email', () => {
    const input = normalizePublicBookingInput({
      firstName: 'Anna',
      lastName: 'Petrova',
      dateOfBirth: '1990-02-03',
    })

    expect(validatePublicBookingInput(input)).toBe('phone or email is required')
  })
})
