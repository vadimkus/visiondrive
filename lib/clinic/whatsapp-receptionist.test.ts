import { describe, expect, it } from 'vitest'
import { buildWhatsAppReceptionistMessage } from '@/lib/clinic/whatsapp-receptionist'

describe('WhatsApp receptionist v2 messages', () => {
  it('builds a patient-safe quote message from an existing quote', () => {
    const message = buildWhatsAppReceptionistMessage({
      mode: 'quote',
      patientFirstName: 'Ladi',
      quote: {
        quoteNumber: 'Q-2026-0001',
        title: 'Skin booster plan',
        status: 'SENT',
        currency: 'AED',
        totalCents: 180000,
        lines: [{ description: 'Skin booster', quantity: 2, totalCents: 180000 }],
      },
    })

    expect(message).toContain('Hi Ladi')
    expect(message).toContain('Skin booster plan (Q-2026-0001)')
    expect(message).toContain('Estimated total: 1800.00 AED')
  })

  it('keeps reschedule and cancel replies as practitioner-confirmed actions', () => {
    const appointment = {
      startsAt: '2026-05-01T10:00:00.000Z',
      status: 'CONFIRMED',
      label: 'Botox',
    }

    expect(
      buildWhatsAppReceptionistMessage({
        mode: 'reschedule',
        patientFirstName: 'Ladi',
        appointment,
        customText: 'Friday afternoon',
      })
    ).toContain('personally confirm the new slot')

    expect(
      buildWhatsAppReceptionistMessage({
        mode: 'cancel',
        patientFirstName: 'Ladi',
        appointment,
      })
    ).toContain('personally confirm before changing the schedule')
  })

  it('offers waitlist slots in Russian', () => {
    const message = buildWhatsAppReceptionistMessage({
      mode: 'waitlist',
      locale: 'ru',
      patientFirstName: 'Лади',
      waitlistSlotStart: '2026-05-01T10:00:00.000Z',
      procedures: [{ name: 'Ботокс', basePriceCents: 90000, currency: 'AED' }],
    })

    expect(message).toContain('Здравствуйте, Лади')
    expect(message).toContain('Освободилось окно')
    expect(message).toContain('Ботокс')
  })
})
