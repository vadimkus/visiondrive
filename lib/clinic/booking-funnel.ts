export const BOOKING_FUNNEL_STAGES = [
  'LINK_VIEW',
  'SERVICE_SELECTED',
  'SLOT_SELECTED',
  'FORM_STARTED',
  'FORM_SUBMITTED',
  'BOOKING_COMPLETED',
] as const

export type BookingFunnelStage = (typeof BOOKING_FUNNEL_STAGES)[number]

export type BookingFunnelEventInput = {
  sessionId: string
  eventType: string
  procedureId?: string | null
  procedureName?: string | null
  occurredAt?: Date
}

export type BookingFunnelStageSummary = {
  eventType: BookingFunnelStage
  events: number
  sessions: number
  conversionFromViewsPct: number
  dropoffFromPreviousPct: number
}

export type BookingFunnelProcedureSummary = {
  procedureId: string | null
  procedureName: string
  selectedSessions: number
  completedSessions: number
  completionRatePct: number
}

export function isBookingFunnelStage(value: string): value is BookingFunnelStage {
  return BOOKING_FUNNEL_STAGES.includes(value as BookingFunnelStage)
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0
}

export function buildBookingFunnelSummary(events: BookingFunnelEventInput[]) {
  const stageSessions = new Map<BookingFunnelStage, Set<string>>()
  const stageEvents = new Map<BookingFunnelStage, number>()

  for (const stage of BOOKING_FUNNEL_STAGES) {
    stageSessions.set(stage, new Set())
    stageEvents.set(stage, 0)
  }

  for (const event of events) {
    if (!isBookingFunnelStage(event.eventType)) continue
    stageEvents.set(event.eventType, (stageEvents.get(event.eventType) ?? 0) + 1)
    if (event.sessionId) stageSessions.get(event.eventType)?.add(event.sessionId)
  }

  const viewSessions = stageSessions.get('LINK_VIEW')?.size ?? 0
  let previousSessions = viewSessions

  const stages: BookingFunnelStageSummary[] = BOOKING_FUNNEL_STAGES.map((stage, index) => {
    const sessions = stageSessions.get(stage)?.size ?? 0
    const dropoffFromPreviousPct = index === 0 ? 0 : pct(Math.max(previousSessions - sessions, 0), previousSessions)
    previousSessions = sessions
    return {
      eventType: stage,
      events: stageEvents.get(stage) ?? 0,
      sessions,
      conversionFromViewsPct: index === 0 ? 100 : pct(sessions, viewSessions),
      dropoffFromPreviousPct,
    }
  })

  return {
    stages,
    totals: {
      views: stages[0].sessions,
      serviceSelections: stages[1].sessions,
      slotSelections: stages[2].sessions,
      formStarts: stages[3].sessions,
      formSubmissions: stages[4].sessions,
      bookings: stages[5].sessions,
      bookingCompletionRatePct: pct(stages[5].sessions, stages[0].sessions),
    },
  }
}

export function buildBookingFunnelProcedureSummary(
  events: BookingFunnelEventInput[]
): BookingFunnelProcedureSummary[] {
  const rows = new Map<string, { procedureId: string | null; procedureName: string; selected: Set<string>; completed: Set<string> }>()

  for (const event of events) {
    if (!event.procedureId && !event.procedureName) continue
    const key = event.procedureId ?? event.procedureName ?? 'unassigned'
    const existing =
      rows.get(key) ??
      {
        procedureId: event.procedureId ?? null,
        procedureName: event.procedureName ?? 'Unassigned',
        selected: new Set<string>(),
        completed: new Set<string>(),
      }
    if (event.eventType === 'SERVICE_SELECTED') existing.selected.add(event.sessionId)
    if (event.eventType === 'BOOKING_COMPLETED') existing.completed.add(event.sessionId)
    rows.set(key, existing)
  }

  return [...rows.values()]
    .map((row) => ({
      procedureId: row.procedureId,
      procedureName: row.procedureName,
      selectedSessions: row.selected.size,
      completedSessions: row.completed.size,
      completionRatePct: pct(row.completed.size, row.selected.size),
    }))
    .filter((row) => row.selectedSessions > 0 || row.completedSessions > 0)
    .sort((a, b) => b.selectedSessions - a.selectedSessions || b.completedSessions - a.completedSessions)
}
