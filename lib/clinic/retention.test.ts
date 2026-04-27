import { describe, expect, it } from 'vitest'
import {
  buildFollowUpConversion,
  buildProcedureRepeatIntervals,
  buildRetentionSummary,
} from './retention'

const start = new Date('2026-01-01T00:00:00.000Z')
const end = new Date('2026-04-01T00:00:00.000Z')
const now = new Date('2026-04-15T00:00:00.000Z')

describe('clinic retention analytics', () => {
  it('calculates rebook, returning, no-show, and lost-patient metrics', () => {
    const rows = [
      {
        patientId: 'p1',
        patientName: 'One Patient',
        startsAt: new Date('2026-01-10T10:00:00.000Z'),
        status: 'COMPLETED',
        procedureId: 'facial',
        procedureName: 'Facial',
      },
      {
        patientId: 'p1',
        patientName: 'One Patient',
        startsAt: new Date('2026-02-10T10:00:00.000Z'),
        status: 'COMPLETED',
        procedureId: 'facial',
        procedureName: 'Facial',
      },
      {
        patientId: 'p2',
        patientName: 'Two Patient',
        patientPhone: '+971501111111',
        startsAt: new Date('2026-01-15T10:00:00.000Z'),
        status: 'COMPLETED',
        procedureId: 'peel',
        procedureName: 'Peel',
      },
      {
        patientId: 'p3',
        patientName: 'Three Patient',
        startsAt: new Date('2026-02-01T10:00:00.000Z'),
        status: 'NO_SHOW',
      },
      {
        patientId: 'p2',
        patientName: 'Two Patient',
        startsAt: new Date('2026-05-01T10:00:00.000Z'),
        status: 'CONFIRMED',
      },
    ]

    const result = buildRetentionSummary(rows, start, end, now, 45)

    expect(result.summary).toMatchObject({
      completedAppointments: 3,
      uniqueCompletedPatients: 2,
      returningPatients: 1,
      returningRatePct: 50,
      rebookedCompletedAppointments: 2,
      rebookRatePct: 66.7,
      noShowAppointments: 1,
      noShowRatePct: 25,
    })
    expect(result.lostPatients).toHaveLength(1)
    expect(result.lostPatients[0].patientId).toBe('p1')
  })

  it('calculates repeat interval by procedure', () => {
    const rows = [
      {
        patientId: 'p1',
        patientName: 'One Patient',
        procedureId: 'facial',
        procedureName: 'Facial',
        startsAt: new Date('2026-01-01T00:00:00.000Z'),
        status: 'COMPLETED',
      },
      {
        patientId: 'p1',
        patientName: 'One Patient',
        procedureId: 'facial',
        procedureName: 'Facial',
        startsAt: new Date('2026-01-31T00:00:00.000Z'),
        status: 'COMPLETED',
      },
      {
        patientId: 'p2',
        patientName: 'Two Patient',
        procedureId: 'facial',
        procedureName: 'Facial',
        startsAt: new Date('2026-01-10T00:00:00.000Z'),
        status: 'COMPLETED',
      },
      {
        patientId: 'p2',
        patientName: 'Two Patient',
        procedureId: 'facial',
        procedureName: 'Facial',
        startsAt: new Date('2026-02-19T00:00:00.000Z'),
        status: 'COMPLETED',
      },
    ]

    expect(buildProcedureRepeatIntervals(rows)).toEqual([
      { procedureId: 'facial', procedureName: 'Facial', repeatPairs: 2, averageDays: 35 },
    ])
  })

  it('calculates rebooking follow-up conversion', () => {
    const reminders = [
      { patientId: 'p1', scheduledFor: new Date('2026-01-01T00:00:00.000Z'), status: 'PREPARED' },
      { patientId: 'p2', scheduledFor: new Date('2026-01-01T00:00:00.000Z'), status: 'SCHEDULED' },
      { patientId: 'p3', scheduledFor: new Date('2026-01-01T00:00:00.000Z'), status: 'CANCELLED' },
    ]
    const appointments = [
      {
        patientId: 'p1',
        patientName: 'One Patient',
        startsAt: new Date('2026-01-15T00:00:00.000Z'),
        status: 'CONFIRMED',
      },
    ]

    expect(buildFollowUpConversion(reminders, appointments, start, end)).toEqual({
      rebookingReminders: 2,
      convertedReminders: 1,
      conversionRatePct: 50,
    })
  })
})
