import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentEventType, ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'
import {
  ACTIVE_APPOINTMENT_STATUSES,
  normalizeBufferMinutes,
  statusTimestampPatch,
  writeAppointmentEvent,
} from '@/lib/clinic/appointments'
import {
  findSchedulingConflict,
  normalizeOverrideReason,
  overrideAllowed,
} from '@/lib/clinic/scheduling-guard'

function parseStatus(v: string): ClinicAppointmentStatus | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicAppointmentStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'ARRIVED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
  ]
  return allowed.includes(u as ClinicAppointmentStatus) ? (u as ClinicAppointmentStatus) : null
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const appointment = await prisma.clinicAppointment.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          middleName: true,
          phone: true,
          email: true,
          internalNotes: true,
        },
      },
      procedure: {
        select: {
          id: true,
          name: true,
          defaultDurationMin: true,
          bufferAfterMinutes: true,
          basePriceCents: true,
          currency: true,
        },
      },
      visits: {
        select: {
          id: true,
          visitAt: true,
          status: true,
          chiefComplaint: true,
          procedureSummary: true,
          nextSteps: true,
          payments: {
            select: {
              id: true,
              amountCents: true,
              currency: true,
              method: true,
              status: true,
              paidAt: true,
            },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: { visitAt: 'desc' },
      },
      events: {
        select: {
          id: true,
          type: true,
          message: true,
          before: true,
          after: true,
          createdAt: true,
          createdBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ appointment })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = getClinicSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const existing = await prisma.clinicAppointment.findFirst({
    where: { id, tenantId: session.tenantId },
    include: {
      procedure: { select: { id: true, defaultDurationMin: true } },
    },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: {
    startsAt?: Date
    endsAt?: Date | null
    status?: ClinicAppointmentStatus
    bufferAfterMinutes?: number
    cancelReason?: string | null
    confirmedAt?: Date | null
    arrivedAt?: Date | null
    completedAt?: Date | null
    titleOverride?: string | null
    internalNotes?: string | null
    procedureId?: string | null
    overrideReason?: string | null
  } = {}

  const endsAtProvided = body.endsAt !== undefined
  const allowConflictOverride = body.allowConflictOverride === true
  const overrideReason = normalizeOverrideReason(body.overrideReason)

  if (body.startsAt !== undefined) {
    const d = new Date(String(body.startsAt))
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'startsAt must be a valid ISO datetime' }, { status: 400 })
    }
    data.startsAt = d
  }

  if (endsAtProvided) {
    if (body.endsAt === null) {
      data.endsAt = null
    } else {
      const d = new Date(String(body.endsAt))
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'endsAt must be a valid ISO datetime' }, { status: 400 })
      }
      data.endsAt = d
    }
  }

  if (body.status !== undefined) {
    const s = parseStatus(String(body.status))
    if (!s) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    data.status = s
    Object.assign(data, statusTimestampPatch(s))
  }

  if (body.bufferAfterMinutes !== undefined) {
    data.bufferAfterMinutes = normalizeBufferMinutes(body.bufferAfterMinutes, existing.bufferAfterMinutes)
  }

  if (body.cancelReason !== undefined) {
    data.cancelReason = body.cancelReason == null ? null : String(body.cancelReason).trim() || null
  }

  if (body.titleOverride !== undefined) {
    data.titleOverride = body.titleOverride == null ? null : String(body.titleOverride).trim() || null
  }
  if (body.internalNotes !== undefined) {
    data.internalNotes =
      body.internalNotes == null ? null : String(body.internalNotes).trim() || null
  }
  if (body.overrideReason !== undefined) {
    data.overrideReason = overrideReason
  }

  if (body.procedureId !== undefined) {
    const pid = body.procedureId == null ? null : String(body.procedureId).trim() || null
    if (pid) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: pid, tenantId: session.tenantId, active: true },
        select: { id: true, defaultDurationMin: true, bufferAfterMinutes: true },
      })
      if (!proc) {
        return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 400 })
      }
      data.procedureId = proc.id
      if (body.bufferAfterMinutes === undefined) {
        data.bufferAfterMinutes = proc.bufferAfterMinutes
      }
    } else {
      data.procedureId = null
      if (body.bufferAfterMinutes === undefined) {
        data.bufferAfterMinutes = 0
      }
    }
  }

  const shouldRecomputeEnd =
    !endsAtProvided &&
    (data.startsAt !== undefined || data.procedureId !== undefined) &&
    (data.procedureId !== undefined ? data.procedureId !== null : existing.procedureId !== null)

  if (shouldRecomputeEnd) {
    const procId =
      data.procedureId !== undefined ? data.procedureId : existing.procedureId
    const start = data.startsAt ?? existing.startsAt
    if (procId) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: procId, tenantId: session.tenantId },
        select: { defaultDurationMin: true },
      })
      if (proc) {
        data.endsAt = new Date(start.getTime() + proc.defaultDurationMin * 60 * 1000)
      }
    }
  }

  const nextStartsAt = data.startsAt ?? existing.startsAt
  const nextEndsAt = data.endsAt !== undefined ? data.endsAt : existing.endsAt
  const nextBufferAfterMinutes = data.bufferAfterMinutes ?? existing.bufferAfterMinutes
  if (nextEndsAt && nextEndsAt <= nextStartsAt) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 })
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const nextStatus = data.status ?? existing.status
    const scheduleRelevantChange =
      data.startsAt !== undefined ||
      data.endsAt !== undefined ||
      data.bufferAfterMinutes !== undefined ||
      data.procedureId !== undefined ||
      (!ACTIVE_APPOINTMENT_STATUSES.includes(existing.status) &&
        ACTIVE_APPOINTMENT_STATUSES.includes(nextStatus))

    if (scheduleRelevantChange && ACTIVE_APPOINTMENT_STATUSES.includes(nextStatus)) {
      const conflict = await findSchedulingConflict(tx, {
        tenantId: session.tenantId,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        bufferAfterMinutes: nextBufferAfterMinutes,
        excludeAppointmentId: id,
      })
      if (!overrideAllowed({ conflict, allowConflictOverride, overrideReason })) {
        return { conflict }
      }
      if (conflict) {
        data.overrideReason = overrideReason
      }
    }

    const appointment = await tx.clinicAppointment.update({
      where: { id },
      data,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        procedure: {
          select: {
            id: true,
            name: true,
            defaultDurationMin: true,
            bufferAfterMinutes: true,
            basePriceCents: true,
            currency: true,
          },
        },
        visits: { select: { id: true, status: true, visitAt: true }, orderBy: { visitAt: 'desc' }, take: 1 },
      },
    })

    const rescheduled =
      data.startsAt !== undefined ||
      data.endsAt !== undefined ||
      data.bufferAfterMinutes !== undefined ||
      data.procedureId !== undefined

    await writeAppointmentEvent(tx, {
      tenantId: session.tenantId,
      appointmentId: id,
      type:
        data.status !== undefined && data.status !== existing.status
          ? ClinicAppointmentEventType.STATUS_CHANGED
          : rescheduled
            ? ClinicAppointmentEventType.RESCHEDULED
            : ClinicAppointmentEventType.UPDATED,
      message:
        data.status !== undefined && data.status !== existing.status
          ? `Status changed to ${data.status}`
          : rescheduled
            ? 'Appointment schedule changed'
            : 'Appointment updated',
      before: {
        startsAt: existing.startsAt.toISOString(),
        endsAt: existing.endsAt?.toISOString() ?? null,
        status: existing.status,
        procedureId: existing.procedureId,
        bufferAfterMinutes: existing.bufferAfterMinutes,
        overrideReason: existing.overrideReason,
      },
      after: {
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt?.toISOString() ?? null,
        status: appointment.status,
        procedureId: appointment.procedureId,
        bufferAfterMinutes: appointment.bufferAfterMinutes,
        overrideReason: appointment.overrideReason,
      },
      createdByUserId: session.userId,
    })

    return { appointment }
  })

  if ('conflict' in result) {
    return NextResponse.json(
      { error: 'Appointment conflicts with an existing booking', conflict: result.conflict },
      { status: 409 }
    )
  }

  return NextResponse.json({ appointment: result.appointment })
}
