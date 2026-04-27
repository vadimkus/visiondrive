import { describe, expect, it } from 'vitest'
import { buildBookingFunnelProcedureSummary, buildBookingFunnelSummary } from './booking-funnel'

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
})
