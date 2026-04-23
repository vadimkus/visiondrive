import { NextRequest, NextResponse } from 'next/server'
import { ClinicAppointmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getClinicSession } from '@/lib/clinic/session'

function parseStatus(v: string): ClinicAppointmentStatus | null {
  const u = v.toUpperCase().trim()
  const allowed: ClinicAppointmentStatus[] = [
    'SCHEDULED',
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
      patient: { select: { id: true, firstName: true, lastName: true } },
      procedure: { select: { id: true, name: true, defaultDurationMin: true } },
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
    titleOverride?: string | null
    internalNotes?: string | null
    procedureId?: string | null
  } = {}

  const endsAtProvided = body.endsAt !== undefined

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
  }

  if (body.titleOverride !== undefined) {
    data.titleOverride = body.titleOverride == null ? null : String(body.titleOverride).trim() || null
  }
  if (body.internalNotes !== undefined) {
    data.internalNotes =
      body.internalNotes == null ? null : String(body.internalNotes).trim() || null
  }

  if (body.procedureId !== undefined) {
    const pid = body.procedureId == null ? null : String(body.procedureId).trim() || null
    if (pid) {
      const proc = await prisma.clinicProcedure.findFirst({
        where: { id: pid, tenantId: session.tenantId, active: true },
        select: { id: true, defaultDurationMin: true },
      })
      if (!proc) {
        return NextResponse.json({ error: 'Procedure not found or inactive' }, { status: 400 })
      }
      data.procedureId = proc.id
    } else {
      data.procedureId = null
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

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const appointment = await prisma.clinicAppointment.update({
    where: { id },
    data,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      procedure: { select: { id: true, name: true, defaultDurationMin: true } },
    },
  })

  return NextResponse.json({ appointment })
}
