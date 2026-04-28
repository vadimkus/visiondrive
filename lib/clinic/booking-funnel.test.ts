import { describe, expect, it } from 'vitest'
import {
  abandonedBookingFollowUpMessage,
  buildAbandonedBookingSessions,
  buildBookingFunnelProcedureSummary,
  buildBookingFunnelSourceSummary,
  buildBookingFunnelSummary,
} from './booking-funnel'

describe('clinic booking funnel analytics', () => {
  it('summarizes unique sessions and drop-offs by funnel stage', () => {
    const result = buildBookingFunnelSummary([
      { sessionId: 's1', eventType: 'LINK_VIEW' },
      { sessionId: 's2', eventType: 'LINK_VIEW' },
      { sessionId: 's2', eventType: 'LINK_VIEW' },
      { sessionId: 's1', eventType: 'SERVICE_SELECTED' },
      { sessionId: 's2', eventType: 'SERVICE_SELECTED' },
      { sessionId: 's1', eventType: 'SLOT_SELECTED' },
      { sessionId: 's1', eventType: 'FORM_STARTED' },
      { sessionId: 's1', eventType: 'FORM_SUBMITTED' },
      { sessionId: 's1', eventType: 'BOOKING_COMPLETED' },
    ])

    expect(result.totals).toMatchObject({
      views: 2,
      serviceSelections: 2,
      slotSelections: 1,
      formStarts: 1,
      formSubmissions: 1,
      bookings: 1,
      bookingCompletionRatePct: 50,
    })
    expect(result.stages[0]).toMatchObject({ eventType: 'LINK_VIEW', events: 3, sessions: 2 })
    expect(result.stages[2]).toMatchObject({
      eventType: 'SLOT_SELECTED',
      sessions: 1,
      conversionFromViewsPct: 50,
      dropoffFromPreviousPct: 50,
    })
  })

  it('summarizes selected and completed sessions by procedure', () => {
    const result = buildBookingFunnelProcedureSummary([
      { sessionId: 's1', eventType: 'SERVICE_SELECTED', procedureId: 'p1', procedureName: 'Facial' },
      { sessionId: 's2', eventType: 'SERVICE_SELECTED', procedureId: 'p1', procedureName: 'Facial' },
      { sessionId: 's1', eventType: 'BOOKING_COMPLETED', procedureId: 'p1', procedureName: 'Facial' },
      { sessionId: 's3', eventType: 'SERVICE_SELECTED', procedureId: 'p2', procedureName: 'Peel' },
    ])

    expect(result).toEqual([
      {
        procedureId: 'p1',
        procedureName: 'Facial',
        selectedSessions: 2,
        completedSessions: 1,
        completionRatePct: 50,
      },
      {
        procedureId: 'p2',
        procedureName: 'Peel',
        selectedSessions: 1,
        completedSessions: 0,
        completionRatePct: 0,
      },
    ])
  })

  it('summarizes conversion by booking source', () => {
    const result = buildBookingFunnelSourceSummary([
      { sessionId: 's1', eventType: 'LINK_VIEW', metadata: { utmSource: 'instagram' } },
      { sessionId: 's1', eventType: 'BOOKING_COMPLETED', metadata: { utmSource: 'instagram' } },
      { sessionId: 's2', eventType: 'LINK_VIEW', metadata: { utmSource: 'instagram' } },
      { sessionId: 's3', eventType: 'LINK_VIEW', referrer: 'https://google.com/search?q=facial' },
    ])

    expect(result).toEqual([
      {
        sourceKey: 'instagram',
        sourceLabel: 'instagram',
        sessions: 2,
        bookings: 1,
        completionRatePct: 50,
      },
      {
        sourceKey: 'google-com',
        sourceLabel: 'google.com',
        sessions: 1,
        bookings: 0,
        completionRatePct: 0,
      },
    ])
  })

  it('finds abandoned booking sessions with recoverable contact details', () => {
    const result = buildAbandonedBookingSessions([
      {
        sessionId: 's1',
        eventType: 'SLOT_SELECTED',
        procedureId: 'p1',
        procedureName: 'Facial',
        startsAt: new Date('2026-04-28T10:00:00Z'),
        occurredAt: new Date('2026-04-28T08:00:00Z'),
      },
      {
        sessionId: 's1',
        eventType: 'FORM_SUBMITTED',
        procedureId: 'p1',
        procedureName: 'Facial',
        occurredAt: new Date('2026-04-28T08:05:00Z'),
        metadata: { firstName: 'Amina', phone: '+971500000000', utmSource: 'instagram' },
      },
      { sessionId: 's2', eventType: 'LINK_VIEW', occurredAt: new Date('2026-04-28T08:10:00Z') },
      { sessionId: 's3', eventType: 'FORM_SUBMITTED', occurredAt: new Date('2026-04-28T08:15:00Z') },
      { sessionId: 's3', eventType: 'BOOKING_COMPLETED', occurredAt: new Date('2026-04-28T08:16:00Z') },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      sessionId: 's1',
      sourceLabel: 'instagram',
      lastEventType: 'FORM_SUBMITTED',
      procedureName: 'Facial',
      firstName: 'Amina',
      phone: '+971500000000',
    })
  })

  it('builds localized abandoned booking follow-up copy', () => {
    expect(
      abandonedBookingFollowUpMessage({ firstName: 'Amina', procedureName: 'Facial', startsAt: null }, 'en')
    ).toContain('Hi Amina')
    expect(
      abandonedBookingFollowUpMessage({ firstName: 'Амина', procedureName: 'Чистка', startsAt: null }, 'ru')
    ).toContain('Здравствуйте, Амина')
  })
})
