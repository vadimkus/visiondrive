import {
  ClinicAppointmentEventType,
  ClinicAppointmentStatus,
  Prisma,
  type ClinicAppointment,
} from '@prisma/client'

export const ACTIVE_APPOINTMENT_STATUSES: ClinicAppointmentStatus[] = [
  ClinicAppointmentStatus.SCHEDULED,
  ClinicAppointmentStatus.CONFIRMED,
  ClinicAppointmentStatus.ARRIVED,
  ClinicAppointmentStatus.COMPLETED,
]

export const MAX_APPOINTMENT_BUFFER_MINUTES = 60

type PrismaLike = Prisma.TransactionClient

export type AppointmentConflict = {
  id: string
  startsAt: string
  endsAt: string | null
  occupiedUntil: string
  bufferAfterMinutes: number
  status: ClinicAppointmentStatus
  patientName: string
  procedureName: string | null
}

export function normalizeBufferMinutes(value: unknown, fallback = 0) {
  const n = Number(value ?? fallback)
  if (!Number.isFinite(n)) return fallback
  return Math.min(MAX_APPOINTMENT_BUFFER_MINUTES, Math.max(0, Math.round(n)))
}

export function appointmentEnd(
  startsAt: Date,
  endsAt: Date | null | undefined,
  defaultDurationMin = 60
) {
  return endsAt ?? new Date(startsAt.getTime() + defaultDurationMin * 60 * 1000)
}

export function appointmentOccupiedUntil(
  startsAt: Date,
  endsAt: Date | null | undefined,
  defaultDurationMin: number,
  bufferAfterMinutes: number
) {
  const end = appointmentEnd(startsAt, endsAt, defaultDurationMin)
  return new Date(end.getTime() + normalizeBufferMinutes(bufferAfterMinutes) * 60 * 1000)
}

export function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB
}

export async function findAppointmentConflict(
  db: PrismaLike,
  params: {
    tenantId: string
    startsAt: Date
    endsAt: Date | null
    bufferAfterMinutes: number
    excludeAppointmentId?: string
  }
): Promise<AppointmentConflict | null> {
  const occupiedUntil = appointmentOccupiedUntil(
    params.startsAt,
    params.endsAt,
    60,
    params.bufferAfterMinutes
  )

  const candidates = await db.clinicAppointment.findMany({
    where: {
      tenantId: params.tenantId,
      status: { in: ACTIVE_APPOINTMENT_STATUSES },
      ...(params.excludeAppointmentId ? { id: { not: params.excludeAppointmentId } } : {}),
      startsAt: { lt: occupiedUntil },
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      procedure: { select: { name: true, defaultDurationMin: true } },
    },
    orderBy: { startsAt: 'asc' },
    take: 100,
  })

  for (const candidate of candidates) {
    const candidateEnd = appointmentOccupiedUntil(
      candidate.startsAt,
      candidate.endsAt,
      candidate.procedure?.defaultDurationMin ?? 60,
      candidate.bufferAfterMinutes
    )
    if (rangesOverlap(params.startsAt, occupiedUntil, candidate.startsAt, candidateEnd)) {
      return {
        id: candidate.id,
        startsAt: candidate.startsAt.toISOString(),
        endsAt: candidate.endsAt?.toISOString() ?? null,
        occupiedUntil: candidateEnd.toISOString(),
        bufferAfterMinutes: candidate.bufferAfterMinutes,
        status: candidate.status,
        patientName: `${candidate.patient.lastName}, ${candidate.patient.firstName}`,
        procedureName: candidate.procedure?.name ?? null,
      }
    }
  }

  return null
}

export async function writeAppointmentEvent(
  db: PrismaLike,
  params: {
    tenantId: string
    appointmentId: string
    type: ClinicAppointmentEventType
    message?: string | null
    before?: Prisma.InputJsonValue | null
    after?: Prisma.InputJsonValue | null
    createdByUserId?: string | null
  }
) {
  return db.clinicAppointmentEvent.create({
    data: {
      tenantId: params.tenantId,
      appointmentId: params.appointmentId,
      type: params.type,
      message: params.message ?? null,
      before: params.before ?? Prisma.JsonNull,
      after: params.after ?? Prisma.JsonNull,
      createdByUserId: params.createdByUserId ?? null,
    },
  })
}

export function statusTimestampPatch(
  status: ClinicAppointmentStatus,
  now = new Date()
): Partial<Pick<ClinicAppointment, 'confirmedAt' | 'arrivedAt' | 'completedAt'>> {
  if (status === ClinicAppointmentStatus.CONFIRMED) return { confirmedAt: now }
  if (status === ClinicAppointmentStatus.ARRIVED) return { arrivedAt: now }
  if (status === ClinicAppointmentStatus.COMPLETED) return { completedAt: now }
  return {}
}
