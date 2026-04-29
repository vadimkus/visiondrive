import { describe, expect, it } from 'vitest'
import {
  normalizePublicBookingConfirmationMode,
  publicBookingConfirmationModeFromSettings,
  publicBookingEnabledFromSettings,
  publicBookingSettingsFromThresholds,
} from './public-booking-settings'

describe('public booking settings', () => {
  it('defaults public booking to disabled', () => {
    expect(publicBookingEnabledFromSettings(null)).toBe(false)
    expect(publicBookingEnabledFromSettings({})).toBe(false)
  })

  it('enables public booking only when explicitly true', () => {
    expect(publicBookingEnabledFromSettings({ publicBooking: { enabled: true } })).toBe(true)
    expect(publicBookingEnabledFromSettings({ publicBooking: { enabled: false } })).toBe(false)
  })

  it('defaults confirmation mode to request approval', () => {
    expect(normalizePublicBookingConfirmationMode('instant')).toBe('INSTANT')
    expect(normalizePublicBookingConfirmationMode('request')).toBe('REQUEST')
    expect(normalizePublicBookingConfirmationMode('bad')).toBe('REQUEST')
    expect(publicBookingConfirmationModeFromSettings(null)).toBe('REQUEST')
    expect(publicBookingConfirmationModeFromSettings({ publicBooking: { confirmationMode: 'INSTANT' } })).toBe('INSTANT')
  })

  it('returns combined public booking settings', () => {
    expect(
      publicBookingSettingsFromThresholds({
        publicBooking: { enabled: true, confirmationMode: 'INSTANT' },
      })
    ).toEqual({ enabled: true, confirmationMode: 'INSTANT' })
  })
})
