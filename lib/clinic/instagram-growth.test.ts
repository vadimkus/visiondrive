import { describe, expect, it } from 'vitest'
import {
  ClinicAppointmentStatus,
  ClinicLeadActivityType,
  ClinicLeadSource,
  ClinicLeadStage,
} from '@prisma/client'
import {
  buildInstagramReply,
  buildLeadBookingUrl,
  buildLeadTasks,
  cleanInstagramHandle,
  nextStageAfterActivity,
  normalizeLeadSource,
  normalizeLeadStage,
} from './instagram-growth'

describe('instagram growth helpers', () => {
  it('normalizes handles, stages, and sources', () => {
    expect(cleanInstagramHandle('@clinic.client')).toBe('clinic.client')
    expect(cleanInstagramHandle('https://www.instagram.com/client_name/?igsh=abc')).toBe('client_name')
    expect(normalizeLeadStage('booking_link_sent')).toBe(ClinicLeadStage.BOOKING_LINK_SENT)
    expect(normalizeLeadStage('unknown')).toBe(ClinicLeadStage.NEW)
    expect(normalizeLeadSource('whatsapp')).toBe(ClinicLeadSource.WHATSAPP)
  })

  it('builds tracked Instagram booking URLs', () => {
    expect(
      buildLeadBookingUrl({
        baseUrl: '/book/demo',
        trackingCode: 'lead_123',
        procedureId: 'proc_1',
        campaign: 'may_promo',
      })
    ).toBe('/book/demo?source=instagram&utm_source=instagram&utm_medium=bio&utm_campaign=may_promo&procedureId=proc_1&lead=lead_123&ref=lead_123')
  })

  it('moves a new lead to replied or booking-link sent from reviewed activities', () => {
    expect(nextStageAfterActivity(ClinicLeadActivityType.INSTAGRAM_DM, ClinicLeadStage.NEW)).toBe(
      ClinicLeadStage.REPLIED
    )
    expect(nextStageAfterActivity(ClinicLeadActivityType.BOOKING_LINK_SENT, ClinicLeadStage.REPLIED)).toBe(
      ClinicLeadStage.BOOKING_LINK_SENT
    )
  })

  it('renders useful manual DM copy', () => {
    const text = buildInstagramReply({
      mode: 'booking',
      leadName: 'Maya',
      procedure: { id: 'p1', name: 'Hydrafacial', basePriceCents: 45000, currency: 'AED' },
      bookingUrl: 'https://example.com/book/demo?lead=1',
      practitionerName: 'Dr. Lina',
    })

    expect(text).toContain('Maya')
    expect(text).toContain('Hydrafacial')
    expect(text).toContain('https://example.com/book/demo?lead=1')
    expect(text).toContain('Dr. Lina')
  })

  it('derives pipeline tasks from lead stages', () => {
    const now = new Date('2026-05-04T10:00:00.000Z')
    const tasks = buildLeadTasks(
      [
        {
          id: 'lead_new',
          displayName: 'New Client',
          source: ClinicLeadSource.INSTAGRAM,
          stage: ClinicLeadStage.NEW,
          trackingCode: 'new',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'lead_booked',
          displayName: 'Booked Client',
          source: ClinicLeadSource.INSTAGRAM,
          stage: ClinicLeadStage.BOOKED,
          trackingCode: 'booked',
          createdAt: now,
          updatedAt: now,
          convertedAppointment: {
            id: 'appt_1',
            startsAt: new Date('2026-05-03T10:00:00.000Z'),
            status: ClinicAppointmentStatus.CONFIRMED,
            procedure: { name: 'Botox' },
          },
        },
      ],
      now
    )

    expect(tasks.map((task) => task.kind)).toEqual(['lead_reply', 'aftercare'])
  })
})
