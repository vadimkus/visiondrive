import { describe, expect, it } from 'vitest'
import { publicBookingEnabledFromSettings } from './public-booking-settings'

describe('public booking settings', () => {
  it('defaults public booking to disabled', () => {
    expect(publicBookingEnabledFromSettings(null)).toBe(false)
    expect(publicBookingEnabledFromSettings({})).toBe(false)
  })

  it('enables public booking only when explicitly true', () => {
    expect(publicBookingEnabledFromSettings({ publicBooking: { enabled: true } })).toBe(true)
    expect(publicBookingEnabledFromSettings({ publicBooking: { enabled: false } })).toBe(false)
  })
})
