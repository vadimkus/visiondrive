import { describe, expect, it } from 'vitest'
import {
  bookingChannelLabel,
  bookingChannelWhatsappText,
  buildBookingChannelUrl,
} from './booking-channel-links'

describe('booking channel links', () => {
  it('builds attributed relative channel links', () => {
    const url = buildBookingChannelUrl({
      baseUrl: '/book/demo-clinic',
      channel: 'instagram',
      procedureId: 'proc_123',
    })

    expect(url).toContain('/book/demo-clinic?')
    expect(url).toContain('source=instagram')
    expect(url).toContain('utm_source=instagram')
    expect(url).toContain('utm_medium=bio')
    expect(url).toContain('utm_campaign=direct_booking')
    expect(url).toContain('procedureId=proc_123')
  })

  it('preserves absolute origins', () => {
    expect(
      buildBookingChannelUrl({
        baseUrl: 'https://clinic.example/book/demo',
        channel: 'google',
      })
    ).toMatch(/^https:\/\/clinic\.example\/book\/demo\?/)
  })

  it('labels channels and builds WhatsApp copy', () => {
    expect(bookingChannelLabel('google')).toBe('Google')
    expect(bookingChannelLabel('instagram')).toBe('Instagram')
    expect(bookingChannelLabel('whatsapp')).toBe('WhatsApp')
    expect(bookingChannelWhatsappText('/book/demo', 'Demo Clinic')).toContain('Demo Clinic')
  })
})
