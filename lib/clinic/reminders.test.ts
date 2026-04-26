import { describe, expect, it } from 'vitest'
import { reminderScheduledFor, renderReminderTemplate, whatsappUrl } from './reminders'

describe('clinic reminders', () => {
  const appointment = {
    startsAt: new Date('2026-04-27T06:30:00.000Z'),
    patient: { firstName: 'Iryna', lastName: 'Shadrina', phone: '+971 50 123 4567' },
    procedure: { name: 'Consultation' },
    titleOverride: null,
  }

  it('renders reminder templates with appointment fields', () => {
    expect(
      renderReminderTemplate('Hi {{firstName}}, {{service}} on {{date}} at {{time}}', appointment)
    ).toContain('Hi Iryna, Consultation on')
  })

  it('schedules reminders before appointment start', () => {
    expect(reminderScheduledFor(appointment.startsAt, 24 * 60).toISOString()).toBe(
      '2026-04-26T06:30:00.000Z'
    )
  })

  it('builds WhatsApp URLs with cleaned phone numbers', () => {
    expect(whatsappUrl(appointment.patient.phone, 'hello')).toBe(
      'https://wa.me/971501234567?text=hello'
    )
  })
})
