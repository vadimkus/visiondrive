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
  startsAt?: Date | null
  occurredAt?: Date
  referrer?: string | null
  metadata?: BookingFunnelEventMetadata | null
}

export type BookingFunnelEventMetadata = {
  source?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  ref?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  consentAccepted?: boolean | null
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

export type BookingFunnelSourceSummary = {
  sourceKey: string
  sourceLabel: string
  sessions: number
  bookings: number
  completionRatePct: number
}

export type AbandonedBookingSession = {
  sessionId: string
  sourceLabel: string
  lastEventType: BookingFunnelStage
  lastOccurredAt: Date
  procedureId: string | null
  procedureName: string | null
  startsAt: Date | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
}

export function isBookingFunnelStage(value: string): value is BookingFunnelStage {
  return BOOKING_FUNNEL_STAGES.includes(value as BookingFunnelStage)
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0
}

function cleanSourcePart(value: string | null | undefined) {
  return String(value ?? '').trim().slice(0, 80) || null
}

function hostFromReferrer(value: string | null | undefined) {
  if (!value) return null
  try {
    return new URL(value).hostname.replace(/^www\./, '') || null
  } catch {
    return null
  }
}

export function bookingFunnelSourceLabel(event: Pick<BookingFunnelEventInput, 'metadata' | 'referrer'>) {
  const metadata = event.metadata ?? null
  const explicit = cleanSourcePart(metadata?.utmSource) ?? cleanSourcePart(metadata?.source) ?? cleanSourcePart(metadata?.ref)
  if (explicit) return explicit
  return hostFromReferrer(event.referrer) ?? 'direct'
}

export function bookingFunnelSourceKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'direct'
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

export function buildBookingFunnelSourceSummary(
  events: BookingFunnelEventInput[]
): BookingFunnelSourceSummary[] {
  const sources = new Map<string, { sourceKey: string; sourceLabel: string; sessions: Set<string>; bookings: Set<string> }>()

  for (const event of events) {
    if (!isBookingFunnelStage(event.eventType)) continue
    const sourceLabel = bookingFunnelSourceLabel(event)
    const sourceKey = bookingFunnelSourceKey(sourceLabel)
    const existing =
      sources.get(sourceKey) ??
      {
        sourceKey,
        sourceLabel,
        sessions: new Set<string>(),
        bookings: new Set<string>(),
      }
    existing.sessions.add(event.sessionId)
    if (event.eventType === 'BOOKING_COMPLETED') existing.bookings.add(event.sessionId)
    sources.set(sourceKey, existing)
  }

  return [...sources.values()]
    .map((source) => ({
      sourceKey: source.sourceKey,
      sourceLabel: source.sourceLabel,
      sessions: source.sessions.size,
      bookings: source.bookings.size,
      completionRatePct: pct(source.bookings.size, source.sessions.size),
    }))
    .sort((a, b) => b.sessions - a.sessions || b.bookings - a.bookings)
}

export function buildAbandonedBookingSessions(events: BookingFunnelEventInput[]): AbandonedBookingSession[] {
  const sessions = new Map<string, BookingFunnelEventInput[]>()
  for (const event of events) {
    if (!event.sessionId || !isBookingFunnelStage(event.eventType)) continue
    sessions.set(event.sessionId, [...(sessions.get(event.sessionId) ?? []), event])
  }

  const rows: AbandonedBookingSession[] = []
  for (const [sessionId, sessionEvents] of sessions.entries()) {
    if (sessionEvents.some((event) => event.eventType === 'BOOKING_COMPLETED')) continue
    const sorted = [...sessionEvents].sort(
      (a, b) => (a.occurredAt?.getTime() ?? 0) - (b.occurredAt?.getTime() ?? 0)
    )
    const last = sorted.at(-1)
    if (!last || !isBookingFunnelStage(last.eventType)) continue
    if (!['SLOT_SELECTED', 'FORM_STARTED', 'FORM_SUBMITTED'].includes(last.eventType)) continue
    const latestWithContact = [...sorted]
      .reverse()
      .find((event) => event.metadata?.phone || event.metadata?.email || event.metadata?.firstName)
    const latestWithProcedure = [...sorted].reverse().find((event) => event.procedureId || event.procedureName)
    rows.push({
      sessionId,
      sourceLabel: bookingFunnelSourceLabel(last),
      lastEventType: last.eventType,
      lastOccurredAt: last.occurredAt ?? new Date(0),
      procedureId: latestWithProcedure?.procedureId ?? null,
      procedureName: latestWithProcedure?.procedureName ?? null,
      startsAt: last.startsAt ?? latestWithProcedure?.startsAt ?? null,
      firstName: latestWithContact?.metadata?.firstName?.trim() || null,
      lastName: latestWithContact?.metadata?.lastName?.trim() || null,
      phone: latestWithContact?.metadata?.phone?.trim() || null,
      email: latestWithContact?.metadata?.email?.trim() || null,
    })
  }

  return rows.sort((a, b) => b.lastOccurredAt.getTime() - a.lastOccurredAt.getTime())
}

export function abandonedBookingFollowUpMessage(
  row: Pick<AbandonedBookingSession, 'firstName' | 'procedureName' | 'startsAt'>,
  locale: 'en' | 'ru' = 'en'
) {
  const firstName = row.firstName?.trim() || (locale === 'ru' ? 'Здравствуйте' : 'there')
  if (locale === 'ru') {
    const service = row.procedureName ? ` по услуге "${row.procedureName}"` : ''
    return `Здравствуйте, ${firstName}. Вы начинали запись${service}, но она не завершилась. Если удобно, напишите сюда — я помогу подобрать время.`
  }
  const service = row.procedureName ? ` for ${row.procedureName}` : ''
  return `Hi ${firstName}, you started a booking${service} but it did not finish. Reply here if you would like help finding a time.`
}
