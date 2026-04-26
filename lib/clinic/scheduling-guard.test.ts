import { describe, expect, it } from 'vitest'
import type { Prisma } from '@prisma/client'
import { findSchedulingConflict, normalizeOverrideReason, overrideAllowed } from './scheduling-guard'

function dbMock(params: {
  appointments?: unknown[]
  blocked?: unknown | null
  rules?: unknown[]
}): Prisma.TransactionClient {
  return {
    clinicAppointment: {
      findMany: async () => params.appointments ?? [],
    },
    clinicBlockedTime: {
      findFirst: async () => params.blocked ?? null,
    },
    clinicAvailabilityRule: {
      findMany: async () => params.rules ?? [],
    },
  } as unknown as Prisma.TransactionClient
}

describe('scheduling guard', () => {
  it('detects blocked-time conflicts before working-hour checks', async () => {
    const conflict = await findSchedulingConflict(
      dbMock({
        blocked: {
          id: 'block-1',
          startsAt: new Date('2026-04-27T06:30:00.000Z'),
          endsAt: new Date('2026-04-27T07:30:00.000Z'),
          reason: 'Lunch',
        },
        rules: [
          {
            dayOfWeek: 1,
            startMinutes: 10 * 60,
            endMinutes: 18 * 60,
            slotIntervalMinutes: 30,
            minLeadMinutes: 0,
            active: true,
          },
        ],
      }),
      {
        tenantId: 'tenant-1',
        startsAt: new Date('2026-04-27T06:00:00.000Z'),
        endsAt: new Date('2026-04-27T07:00:00.000Z'),
        bufferAfterMinutes: 0,
        now: new Date('2026-04-26T00:00:00.000Z'),
      }
    )

    expect(conflict?.type).toBe('BLOCKED_TIME')
  })

  it('detects appointments outside working hours', async () => {
    const conflict = await findSchedulingConflict(
      dbMock({
        rules: [
          {
            dayOfWeek: 1,
            startMinutes: 10 * 60,
            endMinutes: 18 * 60,
            slotIntervalMinutes: 30,
            minLeadMinutes: 0,
            active: true,
          },
        ],
      }),
      {
        tenantId: 'tenant-1',
        startsAt: new Date('2026-04-27T15:00:00.000Z'),
        endsAt: new Date('2026-04-27T16:00:00.000Z'),
        bufferAfterMinutes: 0,
        now: new Date('2026-04-26T00:00:00.000Z'),
      }
    )

    expect(conflict?.type).toBe('WORKING_HOURS')
  })

  it('requires an override reason when a conflict is overridden', () => {
    const conflict = {
      type: 'WORKING_HOURS' as const,
      startsAt: '2026-04-27T15:00:00.000Z',
      occupiedUntil: '2026-04-27T16:00:00.000Z',
      dayOfWeek: 1,
      message: 'Outside hours',
    }

    expect(overrideAllowed({ conflict, allowConflictOverride: true, overrideReason: null })).toBe(false)
    expect(
      overrideAllowed({ conflict, allowConflictOverride: true, overrideReason: 'VIP emergency' })
    ).toBe(true)
    expect(normalizeOverrideReason('  emergency  ')).toBe('emergency')
  })
})
